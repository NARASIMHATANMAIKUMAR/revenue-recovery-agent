import os
import json
from typing import Dict, List, Any, Tuple, Optional
from backend.schemas.internal_models import TransactionRecord, ActionEnum
from backend.schemas.decision_models import CandidateActionScore, DecisionEvaluationResult
from backend.schemas.policy_models import PolicyEvaluationResult

# CANONICAL ACTION COSTS (SINGLE SOURCE OF TRUTH):
# Smart_Retry = ₹0
# Payment_Link = ₹5
# Update_Method = ₹2
# Escalate = ₹250
# STOP = ₹0
ACTION_COSTS: Dict[ActionEnum, float] = {
    ActionEnum.SMART_RETRY: 0.0,
    ActionEnum.PAYMENT_LINK: 5.0,
    ActionEnum.UPDATE_METHOD: 2.0,
    ActionEnum.ESCALATE: 250.0,
    ActionEnum.STOP: 0.0,
}

ML_ARTIFACT_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml_artifacts", "baseline_lookup.json")

class DecisionEngine:
    """
    Priority 3 Engine: Expected Utility Optimization Engine
    EU = P(recovery)*amount - (1 - P(recovery))*P(churn|fail)*LTV*margin - cost
    ALWAYS selects final action by maximizing Expected Utility over policy-eligible actions.
    Policy-blocked actions are filtered BEFORE ML probability calculation and EU evaluation.
    """
    def __init__(self):
        self.lookup_table = self._load_lookup_table()

    def _load_lookup_table(self) -> Dict[str, Any]:
        if os.path.exists(ML_ARTIFACT_PATH):
            try:
                with open(ML_ARTIFACT_PATH, "r") as f:
                    return json.load(f)
            except Exception:
                pass
        return {}

    def get_action_probabilities(self, transaction: TransactionRecord, action: ActionEnum) -> Tuple[float, float]:
        """Returns (p_recovery, p_churn_given_fail) integrating contextual CRM signals & payment features."""
        signals = transaction.signals
        crm = transaction.crm_context

        failure_code = signals.failure_code if signals else transaction.failure_code
        prev_fails = signals.previous_failures if signals else transaction.previous_failures
        is_vip = crm.is_vip if crm else False
        dnd_requested = crm.dnd_requested if crm else False
        is_b2b = signals.is_b2b if signals else transaction.is_b2b

        if action == ActionEnum.SMART_RETRY:
            if dnd_requested or is_vip:
                p_rec = 0.15
                p_churn = 0.35
            elif failure_code == "insufficient_funds":
                p_rec = max(0.20, 0.75 - (prev_fails * 0.12))
                p_churn = 0.08 + (prev_fails * 0.04)
            elif failure_code == "gateway_error":
                p_rec = 0.85
                p_churn = 0.02
            else:
                p_rec = max(0.10, 0.50 - (prev_fails * 0.10))
                p_churn = 0.12

        elif action == ActionEnum.PAYMENT_LINK:
            if dnd_requested:
                p_rec = 0.40
                p_churn = 0.15
            elif failure_code == "insufficient_funds":
                p_rec = 0.65
                p_churn = 0.05
            elif failure_code == "authentication_failed":
                p_rec = 0.80
                p_churn = 0.03
            else:
                p_rec = 0.55
                p_churn = 0.06

        elif action == ActionEnum.UPDATE_METHOD:
            if failure_code == "card_expired":
                p_rec = 0.88
                p_churn = 0.02
            else:
                p_rec = 0.60
                p_churn = 0.05

        elif action == ActionEnum.ESCALATE:
            if is_vip or dnd_requested or is_b2b:
                p_rec = 0.90
                p_churn = 0.01
            else:
                p_rec = 0.75
                p_churn = 0.03

        elif action == ActionEnum.STOP:
            p_rec = 0.0
            p_churn = 0.15 + (prev_fails * 0.05)

        else:
            p_rec = 0.50
            p_churn = 0.10

        return round(p_rec, 4), round(p_churn, 4)

    def compute_expected_utility(
        self,
        action: ActionEnum,
        amount: float,
        ltv: float,
        margin: float,
        p_recovery: float,
        p_churn_given_fail: float
    ) -> Tuple[float, str]:
        cost = ACTION_COSTS[action]
        expected_recovery_revenue = p_recovery * amount
        expected_churn_loss = (1.0 - p_recovery) * p_churn_given_fail * ltv * margin
        eu = expected_recovery_revenue - expected_churn_loss - cost

        breakdown = (
            f"EU({action.value}) = ({p_recovery:.2f} × INR {amount:,.0f}) - "
            f"((1 - {p_recovery:.2f}) × {p_churn_given_fail:.2f} × INR {ltv:,.0f} × {margin:.1f}) - INR {cost:.0f} "
            f"= INR {expected_recovery_revenue:,.0f} - INR {expected_churn_loss:,.0f} - INR {cost:.0f} = INR {eu:,.2f}"
        )
        return round(eu, 2), breakdown

    def evaluate(self, transaction: TransactionRecord, policy_result: PolicyEvaluationResult) -> DecisionEvaluationResult:
        candidate_scores: List[CandidateActionScore] = []
        amount = transaction.amount
        ltv = transaction.ltv
        margin = transaction.signals.margin if transaction.signals else 1.0

        for action in ActionEnum:
            is_eligible = action in policy_result.eligible_actions
            block_reason = policy_result.blocked_actions.get(action)
            cost = ACTION_COSTS[action]

            if not is_eligible:
                # Ineligible/blocked actions DO NOT enter ML/EU evaluation path
                candidate_scores.append(CandidateActionScore(
                    action=action,
                    is_eligible=False,
                    block_reason=block_reason,
                    p_recovery=None,
                    p_churn_given_fail=None,
                    action_cost=cost,
                    expected_utility=None,
                    formula_breakdown=None
                ))
            else:
                # Eligible actions enter ML probability calculation and EU evaluation
                p_rec, p_churn = self.get_action_probabilities(transaction, action)
                eu, breakdown = self.compute_expected_utility(
                    action=action,
                    amount=amount,
                    ltv=ltv,
                    margin=margin,
                    p_recovery=p_rec,
                    p_churn_given_fail=p_churn
                )

                candidate_scores.append(CandidateActionScore(
                    action=action,
                    is_eligible=True,
                    block_reason=None,
                    p_recovery=p_rec,
                    p_churn_given_fail=p_churn,
                    action_cost=cost,
                    expected_utility=eu,
                    formula_breakdown=breakdown
                ))

        # Select maximum Expected Utility action strictly among policy-eligible candidates
        eligible_candidates = [s for s in candidate_scores if s.is_eligible and s.expected_utility is not None]
        if not eligible_candidates:
            best_candidate = next(s for s in candidate_scores if s.action == ActionEnum.STOP)
            winning_eu = 0.0
        else:
            best_candidate = max(eligible_candidates, key=lambda x: x.expected_utility) # type: ignore
            winning_eu = best_candidate.expected_utility # type: ignore

        return DecisionEvaluationResult(
            transaction_id=transaction.transaction_id,
            selected_action=best_candidate.action,
            selected_by="EXPECTED_UTILITY",
            policy_override_reason=None,
            candidate_scores=candidate_scores,
            winning_eu_score=winning_eu
        )
