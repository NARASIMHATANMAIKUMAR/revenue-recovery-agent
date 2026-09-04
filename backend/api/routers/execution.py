from fastapi import APIRouter, Depends, HTTPException
from backend.schemas.execution_models import ExecutionRequest, ExecutionResponse, VerificationRequest, VerificationResponse
from backend.schemas.internal_models import StateLifecycleEnum, is_benchmark_transaction
from backend.api.dependencies import get_db
from backend.services.adapters import ActionAdapters
from backend.services.verification import VerificationEngine
from backend.services.decision_engine import ACTION_COSTS
from backend.core.state_machine import StateMachine

router = APIRouter(prefix="/api/v1/execution", tags=["Execution"])

@router.post("/execute", response_model=ExecutionResponse)
def execute_action(request: ExecutionRequest, db=Depends(get_db)):
    tx = db.get_transaction(request.transaction_id)
    if not tx:
        raise HTTPException(status_code=404, detail=f"Transaction {request.transaction_id} not found.")

    if is_benchmark_transaction(tx):
        raise HTTPException(
            status_code=403,
            detail=f"Transaction {request.transaction_id} is part of the immutable frozen benchmark dataset and cannot be executed."
        )

    if not tx.selected_action:
        raise HTTPException(status_code=400, detail="No action has been selected for this transaction yet.")

    action_to_execute = request.action or tx.selected_action
    
    # Canonical financial action cost assignment from single source of truth
    tx.action_cost = ACTION_COSTS[action_to_execute]

    # Action execution state transition
    if tx.state == StateLifecycleEnum.ACTION_SELECTED:
        StateMachine.transition(tx, StateLifecycleEnum.ACTION_EXECUTED, details=f"Action '{action_to_execute.value}' executed.")

    exec_response = ActionAdapters.execute_action(tx, action_to_execute)

    if tx.state == StateLifecycleEnum.ACTION_EXECUTED:
        StateMachine.transition(tx, StateLifecycleEnum.VERIFICATION_PENDING, details="Awaiting outcome verification.")

    db.save_transaction(tx)
    return exec_response

@router.post("/verify", response_model=VerificationResponse)
def verify_transaction_outcome(request: VerificationRequest, db=Depends(get_db)):
    tx = db.get_transaction(request.transaction_id)
    if not tx:
        raise HTTPException(status_code=404, detail=f"Transaction {request.transaction_id} not found.")

    if is_benchmark_transaction(tx):
        raise HTTPException(
            status_code=403,
            detail=f"Transaction {request.transaction_id} is part of the immutable frozen benchmark dataset and cannot be verified."
        )

    response = VerificationEngine.verify_outcome(tx, request.outcome)
    db.save_transaction(tx)
    return response
