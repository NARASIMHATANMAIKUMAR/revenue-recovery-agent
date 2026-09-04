import unittest
from backend.core.state_machine import StateMachine, InvalidStateTransitionError
from backend.schemas.internal_models import TransactionRecord, StateLifecycleEnum

class TestStateMachine(unittest.TestCase):
    def test_valid_state_transitions(self):
        tx = TransactionRecord(
            transaction_id="tx_test_100", customer_id="cust_1", amount=1000.0,
            failure_code="insufficient_funds", ltv=5000.0, state=StateLifecycleEnum.PAYMENT_FAILED
        )

        StateMachine.transition(tx, StateLifecycleEnum.CONTEXT_GATHERED)
        self.assertEqual(tx.state, StateLifecycleEnum.CONTEXT_GATHERED)

        StateMachine.transition(tx, StateLifecycleEnum.EVALUATED)
        self.assertEqual(tx.state, StateLifecycleEnum.EVALUATED)

        StateMachine.transition(tx, StateLifecycleEnum.ACTION_SELECTED)
        self.assertEqual(tx.state, StateLifecycleEnum.ACTION_SELECTED)

        StateMachine.transition(tx, StateLifecycleEnum.ACTION_EXECUTED)
        self.assertEqual(tx.state, StateLifecycleEnum.ACTION_EXECUTED)

        StateMachine.transition(tx, StateLifecycleEnum.VERIFICATION_PENDING)
        self.assertEqual(tx.state, StateLifecycleEnum.VERIFICATION_PENDING)

        StateMachine.transition(tx, StateLifecycleEnum.RECOVERED)
        self.assertEqual(tx.state, StateLifecycleEnum.RECOVERED)

    def test_invalid_state_transition_raises_error(self):
        tx = TransactionRecord(
            transaction_id="tx_test_101", customer_id="cust_1", amount=1000.0,
            failure_code="insufficient_funds", ltv=5000.0, state=StateLifecycleEnum.PAYMENT_FAILED
        )

        with self.assertRaises(InvalidStateTransitionError):
            StateMachine.transition(tx, StateLifecycleEnum.RECOVERED)

if __name__ == "__main__":
    unittest.main()
