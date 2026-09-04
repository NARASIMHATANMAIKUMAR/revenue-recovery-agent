import uuid
from datetime import datetime
from backend.schemas.internal_models import ActionEnum, TransactionRecord
from backend.schemas.execution_models import ExecutionResponse
from backend.services.decision_engine import ACTION_COSTS

class ActionAdapters:
    @staticmethod
    def execute_action(transaction: TransactionRecord, action: ActionEnum) -> ExecutionResponse:
        exec_id = f"exec_{uuid.uuid4().hex[:8]}"
        now = datetime.utcnow().isoformat()
        cost = ACTION_COSTS[action]

        if action == ActionEnum.SMART_RETRY:
            return ExecutionResponse(
                execution_id=exec_id,
                transaction_id=transaction.transaction_id,
                action=action,
                status="SUCCESS",
                executed_at=now,
                message=f"Dispatched automated Razorpay smart retry for transaction {transaction.transaction_id}.",
                payload_details={"retry_channel": "razorpay_gateway_api", "attempt": transaction.previous_failures + 1, "cost": cost}
            )

        elif action == ActionEnum.PAYMENT_LINK:
            return ExecutionResponse(
                execution_id=exec_id,
                transaction_id=transaction.transaction_id,
                action=action,
                status="SUCCESS",
                executed_at=now,
                message=f"Generated and sent SMS/Email payment link for ₹{transaction.amount:,.2f}.",
                payload_details={"payment_link_url": f"https://rzp.io/i/{transaction.transaction_id}", "channel": "SMS_EMAIL", "cost": cost}
            )

        elif action == ActionEnum.ESCALATE:
            return ExecutionResponse(
                execution_id=exec_id,
                transaction_id=transaction.transaction_id,
                action=action,
                status="SUCCESS",
                executed_at=now,
                message=f"Escalated transaction {transaction.transaction_id} to Account Management CRM ticket.",
                payload_details={"ticket_id": f"TICKET_{transaction.transaction_id}", "priority": "HIGH", "queue": "VIP_SUPPORT", "cost": cost}
            )

        elif action == ActionEnum.UPDATE_METHOD:
            return ExecutionResponse(
                execution_id=exec_id,
                transaction_id=transaction.transaction_id,
                action=action,
                status="SUCCESS",
                executed_at=now,
                message=f"Dispatched Card/Payment Method Update link to customer.",
                payload_details={"update_url": f"https://razorpay.com/update_card/{transaction.customer_id}", "cost": cost}
            )

        elif action == ActionEnum.STOP:
            return ExecutionResponse(
                execution_id=exec_id,
                transaction_id=transaction.transaction_id,
                action=action,
                status="SUCCESS",
                executed_at=now,
                message=f"Execution halted per STOP decision for transaction {transaction.transaction_id}.",
                payload_details={"action_taken": "NO_FURTHER_RETRY", "cost": cost}
            )

        return ExecutionResponse(
            execution_id=exec_id,
            transaction_id=transaction.transaction_id,
            action=action,
            status="FAILED",
            executed_at=now,
            message="Unknown action specified.",
            payload_details={"cost": 0.0}
        )
