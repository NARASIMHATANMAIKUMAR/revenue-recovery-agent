from typing import Optional, Set, Dict, List
from pydantic import BaseModel
from backend.schemas.internal_models import ActionEnum

class PolicyRule(BaseModel):
    rule_id: str
    rule_name: str
    description: str
    priority: int = 1

class PolicyEvaluationResult(BaseModel):
    eligible_actions: Set[ActionEnum]
    blocked_actions: Dict[ActionEnum, str]  # action -> block reason
    rules_applied: List[str] = []

