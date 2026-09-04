import unittest
from backend.services.signal_resolver import SignalResolver
from backend.services.context_engine import ContextEngine
from backend.services.policy_engine import PolicyEngine
from backend.schemas.internal_models import TransactionRecord, ActionEnum

class TestPolicyEngine(unittest.TestCase):
    def test_policy_engine_has_no_override_action_property(self):
        """Requirement B: Policy Engine contains no override_action mechanism."""
        tx = TransactionRecord(
            transaction_id="txn_test_no_override", customer_id="cust_1", amount=1000.0,
            failure_code="insufficient_funds", ltv=5000.0
        )
        SignalResolver.resolve_signals(tx)
        ContextEngine.extract_crm_context(tx)
        policy_res = PolicyEngine.evaluate_policy(tx)

        self.assertFalse(hasattr(policy_res, "override_action"), "PolicyEvaluationResult must NOT contain override_action property!")

    def test_vip_dnd_does_not_directly_select_escalate(self):
        """Requirement A: VIP/DND does not directly select Escalate."""
        tx = TransactionRecord(
            transaction_id="txn_884", customer_id="cust_b2b_884", amount=2500.0,
            failure_code="insufficient_funds", ltv=30000.0, previous_failures=4, is_b2b=True,
            ip_country="IN", card_country="UK",
            crm_notes="Customer flagged as VIP account. User requested Do Not Disturb (DND) for automated retries."
        )

        SignalResolver.resolve_signals(tx)
        ContextEngine.extract_crm_context(tx)
        policy_res = PolicyEngine.evaluate_policy(tx)

        self.assertIn(ActionEnum.ESCALATE, policy_res.eligible_actions)
        self.assertFalse(hasattr(policy_res, "override_action"))

    def test_fraud_terminal_policy_forces_stop_by_eligibility_filtering(self):
        """Requirement E: Fraud/terminal policy forces STOP by filtering out all recovery actions."""
        tx = TransactionRecord(
            transaction_id="txn_stolen", customer_id="cust_fraud", amount=5000.0,
            failure_code="stolen_card", ltv=10000.0, crm_notes=""
        )

        SignalResolver.resolve_signals(tx)
        ContextEngine.extract_crm_context(tx)
        policy_res = PolicyEngine.evaluate_policy(tx)

        self.assertEqual(policy_res.eligible_actions, {ActionEnum.STOP})
        self.assertIn(ActionEnum.SMART_RETRY, policy_res.blocked_actions)
        self.assertIn(ActionEnum.PAYMENT_LINK, policy_res.blocked_actions)
        self.assertIn(ActionEnum.UPDATE_METHOD, policy_res.blocked_actions)
        self.assertIn(ActionEnum.ESCALATE, policy_res.blocked_actions)

if __name__ == "__main__":
    unittest.main()
