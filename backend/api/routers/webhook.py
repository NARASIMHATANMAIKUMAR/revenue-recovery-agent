from fastapi import APIRouter, Depends, HTTPException
from backend.schemas.api_models import WebhookPayload, WebhookResponse
from backend.schemas.internal_models import TransactionRecord, StateLifecycleEnum, is_benchmark_transaction
from backend.api.dependencies import get_db, get_signal_resolver, get_context_engine
from backend.core.state_machine import StateMachine

router = APIRouter(prefix="/api/v1/webhook", tags=["Webhook"])

@router.post("/payment-failed", response_model=WebhookResponse)
def handle_payment_failed_webhook(payload: WebhookPayload, db=Depends(get_db)):
    existing = db.get_transaction(payload.transaction_id)
    if existing and is_benchmark_transaction(existing):
        raise HTTPException(
            status_code=403,
            detail=f"Transaction {payload.transaction_id} is an immutable benchmark record and cannot be overwritten."
        )

    tx = TransactionRecord(
        transaction_id=payload.transaction_id,
        customer_id=payload.customer_id,
        amount=payload.amount,
        failure_code=payload.failure_code,
        ltv=payload.ltv,
        previous_failures=payload.previous_failures,
        is_b2b=payload.is_b2b,
        ip_country=payload.ip_country,
        card_country=payload.card_country,
        crm_notes=payload.crm_notes,
        state=StateLifecycleEnum.PAYMENT_FAILED
    )
    
    # Store initial transaction
    db.save_transaction(tx)
    
    return WebhookResponse(
        success=True,
        transaction_id=tx.transaction_id,
        state=tx.state,
        message=f"Payment failure ingested for transaction {tx.transaction_id}. Initial state set to PAYMENT_FAILED."
    )

@router.post("/simulate", response_model=WebhookResponse)
def simulate_payment_failure(payload: WebhookPayload, db=Depends(get_db)):
    existing = db.get_transaction(payload.transaction_id)
    if existing and is_benchmark_transaction(existing):
        raise HTTPException(
            status_code=403,
            detail=f"Transaction {payload.transaction_id} is an immutable benchmark record and cannot be overwritten."
        )

    tx = TransactionRecord(
        transaction_id=payload.transaction_id,
        customer_id=payload.customer_id,
        amount=payload.amount,
        failure_code=payload.failure_code,
        ltv=payload.ltv,
        previous_failures=payload.previous_failures,
        is_b2b=payload.is_b2b,
        ip_country=payload.ip_country,
        card_country=payload.card_country,
        crm_notes=payload.crm_notes,
        state=StateLifecycleEnum.PAYMENT_FAILED
    )
    db.save_transaction(tx)
    return WebhookResponse(
        success=True,
        transaction_id=tx.transaction_id,
        state=tx.state,
        message=f"Simulated payment failure created for transaction {tx.transaction_id}."
    )

