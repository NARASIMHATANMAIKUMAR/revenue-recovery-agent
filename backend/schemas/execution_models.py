from typing import Optional, Dict, Any
from pydantic import BaseModel
from backend.schemas.internal_models import ActionEnum, StateLifecycleEnum

class ExecutionRequest(BaseModel):
    transaction_id: str
    action: Optional[ActionEnum] = None

class ExecutionResponse(BaseModel):
    execution_id: str
    transaction_id: str
    action: ActionEnum
    status: str  # "SUCCESS", "FAILED"
    executed_at: str
    message: str
    payload_details: Dict[str, Any] = {}

class VerificationRequest(BaseModel):
    transaction_id: str
    outcome: StateLifecycleEnum  # RECOVERED, FAILED_AGAIN, CHURNED

class VerificationResponse(BaseModel):
    transaction_id: str
    previous_state: StateLifecycleEnum
    final_state: StateLifecycleEnum
    realized_utility: float
    baseline_utility: Optional[float] = None
    revenue_recovered: float
    churn_loss: float
    action_cost: float

