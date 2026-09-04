import unittest
from unittest.mock import MagicMock, patch
from backend.schemas.internal_models import TransactionRecord, ActionEnum, StateLifecycleEnum
from backend.services.signal_resolver import SignalResolver
from backend.services.context_engine import ContextEngine
from backend.services.policy_engine import PolicyEngine
from backend.services.decision_engine import DecisionEngine

class TestPolicyBlockedEvaluation(unittest.TestCase):
    def setUp(self):
        self.tx_884 = TransactionRecord(
            transaction_id="txn_884",
            customer_id="cust_vip_b2b_884",
            amount=2500.0,
            failure_code="insufficient_funds",
            ltv=30000.0,
            previous_failures=4,
            is_b2b=True,
            ip_country="IN",
            card_country="UK",
            crm_notes="Customer flagged as VIP account. User requested Do Not Disturb (DND) for automated retries.",
            state=StateLifecycleEnum.PAYMENT_FAILED
        )
        SignalResolver.resolve_signals(self.tx_884)
        ContextEngine.extract_crm_context(self.tx_884)

    def test_blocked_actions_do_not_invoke_ml_or_eu_routines(self):
        """Regression Test A & B: Ineligible actions do NOT invoke get_action_probabilities or compute_expected_utility."""
        de = DecisionEngine()
        policy_res = PolicyEngine.evaluate_policy(self.tx_884)

        # Smart_Retry is blocked
        self.assertIn(ActionEnum.SMART_RETRY, policy_res.blocked_actions)

        with patch.object(de, 'get_action_probabilities', wraps=de.get_action_probabilities) as mock_prob, \
             patch.object(de, 'compute_expected_utility', wraps=de.compute_expected_utility) as mock_eu:

            dec_res = de.evaluate(self.tx_884, policy_res)

            # Check that get_action_probabilities and compute_expected_utility were NOT called for SMART_RETRY
            smart_retry_prob_calls = [
                call for call in mock_prob.call_args_list
                if (call.args and call.args[1] == ActionEnum.SMART_RETRY) or call.kwargs.get('action') == ActionEnum.SMART_RETRY
            ]
            smart_retry_eu_calls = [
                call for call in mock_eu.call_args_list
                if (call.args and call.args[0] == ActionEnum.SMART_RETRY) or call.kwargs.get('action') == ActionEnum.SMART_RETRY
            ]

            self.assertEqual(len(smart_retry_prob_calls), 0, "get_action_probabilities was invoked for blocked Smart_Retry")
            self.assertEqual(len(smart_retry_eu_calls), 0, "compute_expected_utility was invoked for blocked Smart_Retry")

    def test_blocked_candidate_null_fields_and_eligible_evaluation(self):
        """Regression Test C & D: Blocked candidate has null fields; eligible candidates are evaluated."""
        de = DecisionEngine()
        policy_res = PolicyEngine.evaluate_policy(self.tx_884)
        dec_res = de.evaluate(self.tx_884, policy_res)

        smart_retry_score = next(s for s in dec_res.candidate_scores if s.action == ActionEnum.SMART_RETRY)
        self.assertFalse(smart_retry_score.is_eligible)
        self.assertIn("Exceeded maximum automated retry count (4 failures)", smart_retry_score.block_reason or "")
        self.assertIsNone(smart_retry_score.p_recovery)
        self.assertIsNone(smart_retry_score.p_churn_given_fail)
        self.assertIsNone(smart_retry_score.expected_utility)
        self.assertIsNone(smart_retry_score.formula_breakdown)

        # Eligible candidate Escalate has full evaluation fields
        escalate_score = next(s for s in dec_res.candidate_scores if s.action == ActionEnum.ESCALATE)
        self.assertTrue(escalate_score.is_eligible)
        self.assertEqual(escalate_score.p_recovery, 0.90)
        self.assertEqual(escalate_score.p_churn_given_fail, 0.01)
        self.assertEqual(escalate_score.action_cost, 250.0)
        self.assertEqual(escalate_score.expected_utility, 1970.0)
        self.assertIsNotNone(escalate_score.formula_breakdown)

    def test_txn_884_selection_and_selected_by(self):
        """Regression Test E & F: Escalate remains selected action and selected_by remains EXPECTED_UTILITY."""
        de = DecisionEngine()
        policy_res = PolicyEngine.evaluate_policy(self.tx_884)
        dec_res = de.evaluate(self.tx_884, policy_res)

        self.assertEqual(dec_res.selected_action, ActionEnum.ESCALATE)
        self.assertEqual(dec_res.selected_by, "EXPECTED_UTILITY")
        self.assertEqual(dec_res.winning_eu_score, 1970.0)

if __name__ == "__main__":
    unittest.main()
