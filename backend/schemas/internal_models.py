from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class StateLifecycleEnum(str, Enum):
    PAYMENT_FAILED = "PAYMENT_FAILED"
    CONTEXT_GATHERED = "CONTEXT_GATHERED"
    EVALUATED = "EVALUATED"
    ACTION_SELECTED = "ACTION_SELECTED"
    ACTION_EXECUTED = "ACTION_EXECUTED"
    VERIFICATION_PENDING = "VERIFICATION_PENDING"
    RECOVERED = "RECOVERED"
    FAILED_AGAIN = "FAILED_AGAIN"
    CHURNED = "CHURNED"

class ActionEnum(str, Enum):
    SMART_RETRY = "Smart_Retry"
    PAYMENT_LINK = "Payment_Link"
    ESCALATE = "Escalate"
    UPDATE_METHOD = "Update_Method"
    STOP = "STOP"

class FailureCodeEnum(str, Enum):
    INSUFFICIENT_FUNDS = "insufficient_funds"
    AUTHENTICATION_FAILED = "authentication_failed"
    CARD_EXPIRED = "card_expired"
    GATEWAY_ERROR = "gateway_error"
    DO_NOT_HONOR = "do_not_honor"
    STOLEN_CARD = "stolen_card"

class CRMNotesContext(BaseModel):
    raw_notes: str = ""
    is_vip: bool = False
    dnd_requested: bool = False
    sentiment: Optional[str] = "neutral"
    preferred_channel: Optional[str] = None
    extracted_intent: Optional[str] = None

class SignalContext(BaseModel):
    card_country: str = "IN"
    ip_country: str = "IN"
    is_country_mismatch: bool = False
    previous_failures: int = 0
    is_b2b: bool = False
    ltv: float = 0.0
    margin: float = 1.0
    amount: float = 0.0
    failure_code: str = "insufficient_funds"

class AuditLogEntry(BaseModel):
    timestamp: str
    from_state: str
    to_state: str
    action_taken: Optional[str] = None
    details: Optional[str] = None

class TransactionRecord(BaseModel):
    transaction_id: str
    customer_id: str
    amount: float
    failure_code: str
    ltv: float
    previous_failures: int = 0
    is_b2b: bool = False
    ip_country: str = "IN"
    card_country: str = "IN"
    crm_notes: str = ""
    
    # Resolved fields
    signals: Optional[SignalContext] = None
    crm_context: Optional[CRMNotesContext] = None
    
    # State tracking
    state: StateLifecycleEnum = StateLifecycleEnum.PAYMENT_FAILED
    policy_overridden: bool = False
    policy_rule_triggered: Optional[str] = None
    selected_action: Optional[ActionEnum] = None
    
    # Financial math output
    realized_utility: Optional[float] = None
    baseline_utility: Optional[float] = None
    revenue_recovered: Optional[float] = None
    churn_loss: Optional[float] = None
    action_cost: Optional[float] = None
    
    # Benchmark & Protection
    is_benchmark: bool = False
    
    # Audit trail
    audit_trail: List[AuditLogEntry] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

def is_benchmark_transaction(tx: TransactionRecord) -> bool:
    if tx.is_benchmark:
        return True
    return tx.transaction_id.startswith(("txn_retry_", "txn_link_", "txn_esc_", "txn_upd_", "txn_stop_"))

