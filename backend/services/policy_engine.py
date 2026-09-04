from typing import Set, Dict, List
from backend.schemas.internal_models import TransactionRecord, ActionEnum
from backend.schemas.policy_models import PolicyEvaluationResult

class PolicyEngine:
    """
    Priority 1 Policy Engine: Action Eligibility Filtering.
    STRICT FROZEN RULE: The Policy Engine ONLY filters eligible/blocked actions.
    It NEVER directly selects final actions or sets override actions.
    """
    @staticmethod
    def evaluate_policy(transaction: TransactionRecord) -> PolicyEvaluationResult:
        all_actions: Set[ActionEnum] = set(ActionEnum)
        eligible: Set[ActionEnum] = set(ActionEnum)
        blocked: Dict[ActionEnum, str] = {}
        rules_applied: List[str] = []

        signals = transaction.signals
        failure_code = signals.failure_code if signals else transaction.failure_code
        prev_fails = signals.previous_failures if signals else transaction.previous_failures

        # Rule 1: Fraud / Stolen Card Restrictions
        if failure_code == "stolen_card":
            rules_applied.append("RULE_STOLEN_CARD_RESTRICTION")
            for act in [ActionEnum.SMART_RETRY, ActionEnum.PAYMENT_LINK, ActionEnum.UPDATE_METHOD, ActionEnum.ESCALATE]:
                eligible.discard(act)
                blocked[act] = "Blocked due to reported stolen card fraud restriction."

        # Rule 2: Maximum Automated Retry Count
        if prev_fails >= 4:
            rules_applied.append("RULE_MAX_RETRY_COUNT_EXCEEDED")
            if ActionEnum.SMART_RETRY in eligible:
                eligible.discard(ActionEnum.SMART_RETRY)
                blocked[ActionEnum.SMART_RETRY] = f"Blocked: Exceeded maximum automated retry count ({prev_fails} failures)."

        # Rule 3: Expired Card Retry Restriction
        if failure_code == "card_expired":
            rules_applied.append("RULE_EXPIRED_CARD_RETRY_INVALID")
            if ActionEnum.SMART_RETRY in eligible:
                eligible.discard(ActionEnum.SMART_RETRY)
                blocked[ActionEnum.SMART_RETRY] = "Blocked: Direct gateway retry invalid for expired card."

        # Rule 4: Update Method Applicable Scope
        if failure_code not in ["card_expired", "insufficient_funds", "do_not_honor"]:
            rules_applied.append("RULE_UPDATE_METHOD_NOT_APPLICABLE")
            if ActionEnum.UPDATE_METHOD in eligible:
                eligible.discard(ActionEnum.UPDATE_METHOD)
                blocked[ActionEnum.UPDATE_METHOD] = f"Blocked: Payment method update link not applicable for failure code '{failure_code}'."

        # Ensure STOP is always eligible as fallback
        eligible.add(ActionEnum.STOP)
        blocked.pop(ActionEnum.STOP, None)

        return PolicyEvaluationResult(
            eligible_actions=eligible,
            blocked_actions=blocked,
            rules_applied=rules_applied
        )
