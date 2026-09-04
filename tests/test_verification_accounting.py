import unittest
from backend.schemas.internal_models import TransactionRecord, StateLifecycleEnum, ActionEnum
from backend.services.signal_resolver import SignalResolver
from backend.services.context_engine import ContextEngine
from backend.services.policy_engine import PolicyEngine
from backend.services.decision_engine import DecisionEngine, ACTION_COSTS
from backend.services.adapters import ActionAdapters
from backend.services.verification import VerificationEngine
from backend.core.state_machine import StateMachine

class TestVerificationAccounting(unittest.TestCase):
    def test_escalate_action_cost_persists_as_250_after_execution(self):
        """Test 1: Escalate action cost persists as ₹250 after execution."""
        tx = TransactionRecord(
            transaction_id="txn_884_test", customer_id="cust_vip", amount=2500.0,
            failure_code="insufficient_funds", ltv=30000.0, previous_failures=4, is_b2b=True,
            ip_country="IN", card_country="UK",
            crm_notes="Customer flagged as VIP account. User requested Do Not Disturb (DND) for automated retries."
        )
        SignalResolver.resolve_signals(tx)
        ContextEngine.extract_crm_context(tx)
        policy_res = PolicyEngine.evaluate_policy(tx)
        de = DecisionEngine()
        dec_res = de.evaluate(tx, policy_res)

        tx.selected_action = dec_res.selected_action
        tx.action_cost = ACTION_COSTS[tx.selected_action]
        StateMachine.transition(tx, StateLifecycleEnum.CONTEXT_GATHERED)
        StateMachine.transition(tx, StateLifecycleEnum.EVALUATED)
        StateMachine.transition(tx, StateLifecycleEnum.ACTION_SELECTED)

        # Execute action via adapter
        exec_res = ActionAdapters.execute_action(tx, tx.selected_action)
        StateMachine.transition(tx, StateLifecycleEnum.ACTION_EXECUTED)

        # Assert action cost remains ₹250 after execution
        self.assertEqual(tx.action_cost, 250.0)
        self.assertEqual(exec_res.payload_details["cost"], 250.0)

    def test_successful_verification_calculates_realized_utility_as_2250(self):
        """Test 2: Successful verification calculates realized utility as ₹2250."""
        tx = TransactionRecord(
            transaction_id="txn_884_test2", customer_id="cust_vip", amount=2500.0,
            failure_code="insufficient_funds", ltv=30000.0, previous_failures=4, is_b2b=True,
            ip_country="IN", card_country="UK",
            crm_notes="Customer flagged as VIP account. User requested Do Not Disturb (DND) for automated retries."
        )
        SignalResolver.resolve_signals(tx)
        ContextEngine.extract_crm_context(tx)
        policy_res = PolicyEngine.evaluate_policy(tx)
        de = DecisionEngine()
        dec_res = de.evaluate(tx, policy_res)

        tx.selected_action = dec_res.selected_action
        tx.action_cost = ACTION_COSTS[tx.selected_action]
        tx.baseline_utility = None  # Counterfactual unavailable
        StateMachine.transition(tx, StateLifecycleEnum.CONTEXT_GATHERED)
        StateMachine.transition(tx, StateLifecycleEnum.EVALUATED)
        StateMachine.transition(tx, StateLifecycleEnum.ACTION_SELECTED)
        StateMachine.transition(tx, StateLifecycleEnum.ACTION_EXECUTED)
        StateMachine.transition(tx, StateLifecycleEnum.VERIFICATION_PENDING)

        ver_res = VerificationEngine.verify_outcome(tx, StateLifecycleEnum.RECOVERED)

        # Assert accounting fields
        self.assertEqual(ver_res.final_state, StateLifecycleEnum.RECOVERED)
        self.assertEqual(ver_res.revenue_recovered, 2500.0)
        self.assertEqual(ver_res.action_cost, 250.0)
        self.assertEqual(ver_res.realized_utility, 2250.0)  # 2500 - 250 = 2250 EXACTLY!

    def test_system_does_not_silently_substitute_zero_or_invent_missing_baseline(self):
        """Requirement 7: System does NOT silently substitute 0 or invent a value when baseline counterfactual is unavailable."""
        tx = TransactionRecord(
            transaction_id="txn_no_baseline", customer_id="cust_test", amount=2500.0,
            failure_code="insufficient_funds", ltv=10000.0, baseline_utility=None
        )
        tx.selected_action = ActionEnum.ESCALATE
        tx.action_cost = 250.0
        StateMachine.transition(tx, StateLifecycleEnum.CONTEXT_GATHERED)
        StateMachine.transition(tx, StateLifecycleEnum.EVALUATED)
        StateMachine.transition(tx, StateLifecycleEnum.ACTION_SELECTED)
        StateMachine.transition(tx, StateLifecycleEnum.ACTION_EXECUTED)
        StateMachine.transition(tx, StateLifecycleEnum.VERIFICATION_PENDING)

        ver_res = VerificationEngine.verify_outcome(tx, StateLifecycleEnum.RECOVERED)

        # Assert baseline_utility remains None and is NOT silently converted to 0.0 or an invented number
        self.assertIsNone(ver_res.baseline_utility)
        self.assertNotEqual(ver_res.baseline_utility, 0.0)

if __name__ == "__main__":
    unittest.main()
