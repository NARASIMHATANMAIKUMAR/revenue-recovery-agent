from backend.schemas.internal_models import SignalContext, TransactionRecord

class SignalResolver:
    @staticmethod
    def resolve_signals(transaction: TransactionRecord) -> SignalContext:
        is_mismatch = transaction.card_country.upper() != transaction.ip_country.upper()
        
        signals = SignalContext(
            card_country=transaction.card_country.upper(),
            ip_country=transaction.ip_country.upper(),
            is_country_mismatch=is_mismatch,
            previous_failures=transaction.previous_failures,
            is_b2b=transaction.is_b2b,
            ltv=transaction.ltv,
            margin=1.0,  # Default gross margin 100%
            amount=transaction.amount,
            failure_code=transaction.failure_code
        )
        transaction.signals = signals
        return signals
