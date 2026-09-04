from typing import Optional, List
from pydantic import BaseModel
from backend.schemas.internal_models import StateLifecycleEnum, ActionEnum, TransactionRecord
from backend.schemas.decision_models import CandidateActionScore

class WebhookPayload(BaseModel):
    transaction_id: str
    customer_id: str = "cust_default"
    amount: float
    failure_code: str
    ltv: float
    previous_failures: int = 0
    is_b2b: bool = False
    ip_country: str = "IN"
    card_country: str = "IN"
    crm_notes: str = ""

class WebhookResponse(BaseModel):
    success: bool
    transaction_id: str
    state: StateLifecycleEnum
    message: str

class EvaluateRequest(BaseModel):
    transaction_id: str

class EvaluateResponse(BaseModel):
    transaction_id: str
    state: StateLifecycleEnum
    selected_action: ActionEnum
    selected_by: str  # "POLICY" or "EXPECTED_UTILITY"
    policy_override_reason: Optional[str] = None
    candidate_scores: List[CandidateActionScore]
    winning_eu_score: float
    transaction: TransactionRecord
