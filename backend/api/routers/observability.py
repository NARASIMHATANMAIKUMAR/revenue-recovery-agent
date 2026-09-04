from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException
from backend.schemas.observability_models import ObservabilityDashboardMetrics, FinancialSummary, ActionDistribution
from backend.schemas.internal_models import TransactionRecord, ActionEnum
from backend.api.dependencies import get_db

router = APIRouter(prefix="/api/v1/observability", tags=["Observability"])

@router.get("/metrics", response_model=ObservabilityDashboardMetrics)
def get_dashboard_metrics(db=Depends(get_db)):
    transactions = db.get_all_transactions()
    
    if not transactions:
        try:
            import importlib
            seed_mod = importlib.import_module("scripts.02_seed_demo_database")
            seed_mod.seed_database(db=db)
            transactions = db.get_all_transactions()
        except Exception as e:
            print("Auto-seeding empty database failed:", e)

    # Compute actual sums from transactions
    realized_sum = sum(t.realized_utility or 0.0 for t in transactions)
    baseline_sum = sum(t.baseline_utility or 0.0 for t in transactions)
    revenue_sum = sum(t.revenue_recovered or 0.0 for t in transactions)
    churn_sum = sum(t.churn_loss or 0.0 for t in transactions)
    cost_sum = sum(t.action_cost or 0.0 for t in transactions)
    
    # Counts
    action_counts = {
        "Smart_Retry": 0,
        "Payment_Link": 0,
        "Escalate": 0,
        "Update_Method": 0,
        "STOP": 0
    }
    state_counts: Dict[str, int] = {}

    for t in transactions:
        st = t.state.value
        state_counts[st] = state_counts.get(st, 0) + 1
        if t.selected_action:
            act_val = t.selected_action.value
            if act_val in action_counts:
                action_counts[act_val] += 1

    total_tx = len(transactions)
    recovered_cnt = state_counts.get("RECOVERED", 0)
    recovery_rate = (recovered_cnt / total_tx * 100.0) if total_tx > 0 else 0.0

    return ObservabilityDashboardMetrics(
        financial_summary=FinancialSummary(
            realized_utility=round(realized_sum, 2),
            baseline_utility=round(baseline_sum, 2),
            net_improvement=round(realized_sum - baseline_sum, 2),
            revenue_recovered=round(revenue_sum, 2),
            churn_loss=round(churn_sum, 2),
            action_cost=round(cost_sum, 2),
            total_transactions=total_tx,
            recovery_rate_pct=round(recovery_rate, 1)
        ),
        action_distribution=ActionDistribution(
            Smart_Retry=action_counts["Smart_Retry"],
            Payment_Link=action_counts["Payment_Link"],
            Escalate=action_counts["Escalate"],
            Update_Method=action_counts["Update_Method"],
            STOP=action_counts["STOP"],
            total=total_tx
        ),
        state_counts=state_counts
    )

@router.get("/transactions", response_model=List[TransactionRecord])
def list_transactions(db=Depends(get_db)):
    return db.get_all_transactions()

@router.get("/transaction/{transaction_id}", response_model=TransactionRecord)
def get_transaction_detail(transaction_id: str, db=Depends(get_db)):
    tx = db.get_transaction(transaction_id)
    if not tx:
        raise HTTPException(status_code=404, detail=f"Transaction {transaction_id} not found.")
    return tx
