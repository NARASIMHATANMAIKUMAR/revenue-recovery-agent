import unittest
from backend.services.signal_resolver import SignalResolver
from backend.services.context_engine import ContextEngine
from backend.services.policy_engine import PolicyEngine
from backend.services.decision_engine import DecisionEngine, ACTION_COSTS
from backend.schemas.internal_models import TransactionRecord, ActionEnum

class TestDecisionEngine(unittest.TestCase):
    def test_escalate_cost_is_250(self):
        """Requirement F: Escalate cost is ₹250."""
        self.assertEqual(ACTION_COSTS[ActionEnum.ESCALATE], 250.0)
        self.assertEqual(ACTION_COSTS[ActionEnum.SMART_RETRY], 0.0)
        self.assertEqual(ACTION_COSTS[ActionEnum.PAYMENT_LINK], 5.0)
        self.assertEqual(ACTION_COSTS[ActionEnum.UPDATE_METHOD], 2.0)
        self.assertEqual(ACTION_COSTS[ActionEnum.STOP], 0.0)

    def test_decision_engine_evaluates_multiple_eligible_actions_and_escalate_wins_by_highest_eu(self):
        """Requirements C & D: Decision Engine evaluates multiple eligible actions and Escalate wins by highest EU."""
        tx = TransactionRecord(
            transaction_id="txn_884", customer_id="cust_b2b_884", amount=2500.0,
            failure_code="insufficient_funds", ltv=30000.0, previous_failures=4, is_b2b=True,
            ip_country="IN", card_country="UK",
            crm_notes="Customer flagged as VIP account. User requested Do Not Disturb (DND) for automated retries."
        )

        SignalResolver.resolve_signals(tx)
        ContextEngine.extract_crm_context(tx)
        policy_res = PolicyEngine.evaluate_policy(tx)

        de = DecisionEngine()
        dec_res = de.evaluate(tx, policy_res)

        self.assertEqual(len(dec_res.candidate_scores), 5)

        eligible_actions = [s.action for s in dec_res.candidate_scores if s.is_eligible]
        self.assertIn(ActionEnum.PAYMENT_LINK, eligible_actions)
        self.assertIn(ActionEnum.ESCALATE, eligible_actions)
        self.assertIn(ActionEnum.STOP, eligible_actions)

        self.assertEqual(dec_res.selected_action, ActionEnum.ESCALATE)
        self.assertEqual(dec_res.selected_by, "EXPECTED_UTILITY")

        escalate_score = next(s for s in dec_res.candidate_scores if s.action == ActionEnum.ESCALATE)
        link_score = next(s for s in dec_res.candidate_scores if s.action == ActionEnum.PAYMENT_LINK)
        stop_score = next(s for s in dec_res.candidate_scores if s.action == ActionEnum.STOP)

        self.assertGreater(escalate_score.expected_utility, link_score.expected_utility)
        self.assertGreater(escalate_score.expected_utility, stop_score.expected_utility)
        self.assertEqual(dec_res.winning_eu_score, escalate_score.expected_utility)

if __name__ == "__main__":
    unittest.main()
