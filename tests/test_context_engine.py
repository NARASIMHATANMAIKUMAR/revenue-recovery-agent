import unittest
from backend.services.context_engine import ContextEngine
from backend.schemas.internal_models import TransactionRecord

class TestContextEngine(unittest.TestCase):
    def test_context_engine_vip_dnd_extraction(self):
        tx = TransactionRecord(
            transaction_id="tx_notes_1", customer_id="cust_vip", amount=2500.0,
            failure_code="insufficient_funds", ltv=30000.0,
            crm_notes="Customer flagged as VIP account. User requested Do Not Disturb (DND) for automated retries."
        )

        ctx = ContextEngine.extract_crm_context(tx)
        self.assertTrue(ctx.is_vip)
        self.assertTrue(ctx.dnd_requested)
        self.assertIsNotNone(tx.crm_context)
        self.assertTrue(tx.crm_context.is_vip)

    def test_context_engine_empty_notes(self):
        tx = TransactionRecord(
            transaction_id="tx_notes_2", customer_id="cust_normal", amount=500.0,
            failure_code="insufficient_funds", ltv=1000.0, crm_notes=""
        )

        ctx = ContextEngine.extract_crm_context(tx)
        self.assertFalse(ctx.is_vip)
        self.assertFalse(ctx.dnd_requested)

if __name__ == "__main__":
    unittest.main()
