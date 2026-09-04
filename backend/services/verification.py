from backend.schemas.internal_models import TransactionRecord, StateLifecycleEnum
from backend.schemas.execution_models import VerificationResponse
from backend.services.decision_engine import ACTION_COSTS
from backend.core.state_machine import StateMachine

class VerificationEngine:
    @staticmethod
    def verify_outcome(transaction: TransactionRecord, outcome: StateLifecycleEnum) -> VerificationResponse:
        prev_state = transaction.state

        # Transition state
        StateMachine.transition(transaction, outcome, details=f"Outcome verified as {outcome.value}")

        # Canonical financial action cost
        cost = transaction.action_cost if transaction.action_cost is not None else ACTION_COSTS.get(transaction.selected_action, 0.0)
        transaction.action_cost = cost

        amount = transaction.amount
        ltv = transaction.ltv
        margin = transaction.signals.margin if transaction.signals else 1.0

        if outcome == StateLifecycleEnum.RECOVERED:
            transaction.revenue_recovered = amount
            transaction.churn_loss = 0.0
            transaction.realized_utility = amount - cost
        elif outcome == StateLifecycleEnum.FAILED_AGAIN:
            transaction.revenue_recovered = 0.0
            transaction.churn_loss = 0.0
            transaction.realized_utility = -cost
        elif outcome == StateLifecycleEnum.CHURNED:
            transaction.revenue_recovered = 0.0
            transaction.churn_loss = ltv * margin
            transaction.realized_utility = -(transaction.churn_loss) - cost

        return VerificationResponse(
            transaction_id=transaction.transaction_id,
            previous_state=prev_state,
            final_state=transaction.state,
            realized_utility=transaction.realized_utility,
            baseline_utility=transaction.baseline_utility,  # Pass exact counterfactual (None if unavailable)
            revenue_recovered=transaction.revenue_recovered or 0.0,
            churn_loss=transaction.churn_loss or 0.0,
            action_cost=cost
        )
