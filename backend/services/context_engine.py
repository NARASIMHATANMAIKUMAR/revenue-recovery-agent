import re
from backend.schemas.internal_models import CRMNotesContext, TransactionRecord

class ContextEngine:
    """
    LLM Context Extractor for Unstructured CRM Notes.
    STRICT FROZEN RULE: The LLM is ONLY a context extractor.
    It NEVER chooses actions or probabilities.
    """
    @staticmethod
    def extract_crm_context(transaction: TransactionRecord) -> CRMNotesContext:
        raw = transaction.crm_notes.strip() if transaction.crm_notes else ""
        if not raw:
            context = CRMNotesContext(raw_notes="", is_vip=False, dnd_requested=False)
            transaction.crm_context = context
            return context

        notes_upper = raw.upper()
        
        # Rule/LLM Extraction logic for structured flags
        is_vip = bool(re.search(r'\b(VIP|HIGH VALUE|KEY ACCOUNT|ENTERPRISE|PREMIUM)\b', notes_upper))
        dnd_requested = bool(re.search(r'\b(DND|DO NOT DISTURB|NO AUTO RETRY|DO NOT RETRY|MANUAL ONLY|CALL ONLY)\b', notes_upper))
        
        sentiment = "neutral"
        if re.search(r'\b(ANGRY|UPSET|DISSATISFIED|ESCALATED|FRUSTRATED)\b', notes_upper):
            sentiment = "negative"
        elif re.search(r'\b(HAPPY|LOVAL|SATISFIED|DELIGHTED)\b', notes_upper):
            sentiment = "positive"
            
        preferred_channel = None
        if "EMAIL" in notes_upper:
            preferred_channel = "EMAIL"
        elif "SMS" in notes_upper:
            preferred_channel = "SMS"
        elif "PHONE" in notes_upper or "CALL" in notes_upper:
            preferred_channel = "PHONE"

        context = CRMNotesContext(
            raw_notes=raw,
            is_vip=is_vip,
            dnd_requested=dnd_requested,
            sentiment=sentiment,
            preferred_channel=preferred_channel,
            extracted_intent="CRM Note extracted key signals: VIP=" + str(is_vip) + ", DND=" + str(dnd_requested)
        )
        transaction.crm_context = context
        return context
