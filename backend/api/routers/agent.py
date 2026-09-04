from fastapi import APIRouter, Depends, HTTPException
from backend.schemas.api_models import EvaluateRequest, EvaluateResponse
from backend.schemas.internal_models import TransactionRecord, StateLifecycleEnum, is_benchmark_transaction
from backend.api.dependencies import get_db, get_signal_resolver, get_context_engine, get_policy_engine, get_decision_engine
from backend.services.decision_engine import ACTION_COSTS, DecisionEngine
from backend.core.state_machine import StateMachine

router = APIRouter(prefix="/api/v1/agent", tags=["Agent"])

@router.post("/evaluate", response_model=EvaluateResponse)
def evaluate_transaction(
    request: EvaluateRequest,
    db=Depends(get_db),
    signal_resolver=Depends(get_signal_resolver),
    context_engine=Depends(get_context_engine),
    policy_engine=Depends(get_policy_engine),
    decision_engine=Depends(get_decision_engine)
):
    tx = db.get_transaction(request.transaction_id)
    if not tx:
        raise HTTPException(status_code=404, detail=f"Transaction {request.transaction_id} not found.")

    if is_benchmark_transaction(tx):
        raise HTTPException(
            status_code=403,
            detail=f"Transaction {request.transaction_id} is part of the immutable frozen benchmark dataset and cannot be re-evaluated. Use demo case 'txn_884' or trigger a simulation."
        )

    # 1. Resolve signals & Context -> CONTEXT_GATHERED
    if tx.state == StateLifecycleEnum.PAYMENT_FAILED:
        signal_resolver.resolve_signals(tx)
        context_engine.extract_crm_context(tx)
        StateMachine.transition(tx, StateLifecycleEnum.CONTEXT_GATHERED, details="Signals & CRM Context gathered.")

    # 2. Evaluate Policy Eligibility -> EVALUATED
    policy_result = policy_engine.evaluate_policy(tx)
    if tx.state == StateLifecycleEnum.CONTEXT_GATHERED:
        StateMachine.transition(
            tx,
            StateLifecycleEnum.EVALUATED,
            details=f"Policy eligibility checked. Eligible: {[a.value for a in policy_result.eligible_actions]}"
        )

    # 3. Decision Engine Optimization -> ACTION_SELECTED
    decision_result = decision_engine.evaluate(tx, policy_result)
    tx.selected_action = decision_result.selected_action
    tx.action_cost = ACTION_COSTS[tx.selected_action]
    tx.policy_overridden = False
    tx.policy_rule_triggered = ", ".join(policy_result.rules_applied) if policy_result.rules_applied else None

    if tx.state == StateLifecycleEnum.EVALUATED:
        StateMachine.transition(
            tx,
            StateLifecycleEnum.ACTION_SELECTED,
            details=f"Selected action '{tx.selected_action.value}' via Expected Utility optimization (EU=INR {decision_result.winning_eu_score:,.2f})."
        )

    db.save_transaction(tx)

    return EvaluateResponse(
        transaction_id=tx.transaction_id,
        state=tx.state,
        selected_action=tx.selected_action,
        selected_by="EXPECTED_UTILITY",
        policy_override_reason=None,
        candidate_scores=decision_result.candidate_scores,
        winning_eu_score=decision_result.winning_eu_score,
        transaction=tx
    )

@router.post("/demo/txn_884", response_model=EvaluateResponse)
def run_demo_txn_884(
    db=Depends(get_db),
    signal_resolver=Depends(get_signal_resolver),
    context_engine=Depends(get_context_engine),
    policy_engine=Depends(get_policy_engine),
    decision_engine=Depends(get_decision_engine)
):
    # Live Demo Transaction txn_884 setup (reuses existing DB record if available)
    tx = db.get_transaction("txn_884")
    if not tx:
        tx = TransactionRecord(
            transaction_id="txn_884",
            customer_id="cust_vip_b2b_884",
            amount=2500.0,
            failure_code="insufficient_funds",
            ltv=30000.0,
            previous_failures=4,
            is_b2b=True,
            ip_country="IN",
            card_country="UK",
            crm_notes="Customer flagged as VIP account. User requested Do Not Disturb (DND) for automated retries. Requires direct account manager outreach.",
            state=StateLifecycleEnum.PAYMENT_FAILED,
            baseline_utility=None
        )
    else:
        tx.state = StateLifecycleEnum.PAYMENT_FAILED
        tx.revenue_recovered = 0.0
        tx.churn_loss = 0.0
        tx.realized_utility = 0.0

    db.save_transaction(tx)

    return evaluate_transaction(
        request=EvaluateRequest(transaction_id="txn_884"),
        db=db,
        signal_resolver=signal_resolver,
        context_engine=context_engine,
        policy_engine=policy_engine,
        decision_engine=decision_engine
    )
