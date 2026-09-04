from typing import List, Optional, Dict
from pydantic import BaseModel
from backend.schemas.internal_models import ActionEnum

class CandidateActionScore(BaseModel):
    action: ActionEnum
    is_eligible: bool = True
    block_reason: Optional[str] = None
    p_recovery: Optional[float] = None
    p_churn_given_fail: Optional[float] = None
    action_cost: float
    expected_utility: Optional[float] = None
    formula_breakdown: Optional[str] = None

class DecisionEvaluationResult(BaseModel):
    transaction_id: str
    selected_action: ActionEnum
    selected_by: str = "EXPECTED_UTILITY"
    policy_override_reason: Optional[str] = None
    candidate_scores: List[CandidateActionScore]
    winning_eu_score: float
