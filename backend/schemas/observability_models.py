from typing import Dict
from pydantic import BaseModel

class ActionDistribution(BaseModel):
    Smart_Retry: int = 384
    Payment_Link: int = 302
    Escalate: int = 126
    Update_Method: int = 139
    STOP: int = 50
    total: int = 1001

class FinancialSummary(BaseModel):
    realized_utility: float = 1429050.0
    baseline_utility: float = 877750.0
    net_improvement: float = 551300.0
    revenue_recovered: float = 1699350.0
    churn_loss: float = 238600.0
    action_cost: float = 31700.0
    total_transactions: int = 1001
    recovery_rate_pct: float = 68.5

class ObservabilityDashboardMetrics(BaseModel):
    financial_summary: FinancialSummary
    action_distribution: ActionDistribution
    state_counts: Dict[str, int]
