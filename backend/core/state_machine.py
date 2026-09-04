from datetime import datetime
from backend.schemas.internal_models import StateLifecycleEnum, TransactionRecord, AuditLogEntry

class InvalidStateTransitionError(Exception):
    def __init__(self, current_state: StateLifecycleEnum, target_state: StateLifecycleEnum):
        self.current_state = current_state
        self.target_state = target_state
        super().__init__(f"Invalid state transition: Cannot move from '{current_state}' to '{target_state}'")

VALID_TRANSITIONS = {
    StateLifecycleEnum.PAYMENT_FAILED: {StateLifecycleEnum.CONTEXT_GATHERED},
    StateLifecycleEnum.CONTEXT_GATHERED: {StateLifecycleEnum.EVALUATED},
    StateLifecycleEnum.EVALUATED: {StateLifecycleEnum.ACTION_SELECTED},
    StateLifecycleEnum.ACTION_SELECTED: {StateLifecycleEnum.ACTION_EXECUTED},
    StateLifecycleEnum.ACTION_EXECUTED: {StateLifecycleEnum.VERIFICATION_PENDING},
    StateLifecycleEnum.VERIFICATION_PENDING: {
        StateLifecycleEnum.RECOVERED,
        StateLifecycleEnum.FAILED_AGAIN,
        StateLifecycleEnum.CHURNED,
    },
    StateLifecycleEnum.RECOVERED: set(),
    StateLifecycleEnum.FAILED_AGAIN: set(),
    StateLifecycleEnum.CHURNED: set(),
}

class StateMachine:
    @staticmethod
    def can_transition(current_state: StateLifecycleEnum, target_state: StateLifecycleEnum) -> bool:
        allowed = VALID_TRANSITIONS.get(current_state, set())
        return target_state in allowed

    @staticmethod
    def transition(transaction: TransactionRecord, target_state: StateLifecycleEnum, details: str = "") -> TransactionRecord:
        if not StateMachine.can_transition(transaction.state, target_state):
            raise InvalidStateTransitionError(transaction.state, target_state)
        
        from_state = transaction.state.value
        transaction.state = target_state
        transaction.updated_at = datetime.utcnow().isoformat()
        
        audit_entry = AuditLogEntry(
            timestamp=transaction.updated_at,
            from_state=from_state,
            to_state=target_state.value,
            action_taken=transaction.selected_action.value if transaction.selected_action else None,
            details=details,
        )
        transaction.audit_trail.append(audit_entry)
        return transaction
