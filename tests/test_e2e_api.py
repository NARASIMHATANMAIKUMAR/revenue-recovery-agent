import unittest
import tempfile
import os
import importlib

try:
    from fastapi.testclient import TestClient
    from backend.main import app
    from backend.api.dependencies import get_db
    from backend.core.db import Database
    from backend.schemas.internal_models import ActionEnum
    HAS_FASTAPI = True
except ImportError:
    HAS_FASTAPI = False

seed_demo_database = importlib.import_module("scripts.02_seed_demo_database")
seed_database = seed_demo_database.seed_database

@unittest.skipUnless(HAS_FASTAPI, "FastAPI / httpx not installed in test environment")
class TestE2EApi(unittest.TestCase):
    def setUp(self):
        self.temp_db_file = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
        self.temp_db_file.close()
        self.db = Database(db_path=self.temp_db_file.name)
        seed_database(db=self.db)
        
        app.dependency_overrides[get_db] = lambda: self.db
        self.client = TestClient(app)

    def tearDown(self):
        app.dependency_overrides.clear()
        if os.path.exists(self.temp_db_file.name):
            try:
                os.remove(self.temp_db_file.name)
            except OSError:
                pass

    def test_webhook_and_evaluation_flow(self):
        webhook_payload = {
            "transaction_id": "tx_api_test_01",
            "customer_id": "cust_api_01",
            "amount": 2500.0,
            "failure_code": "insufficient_funds",
            "ltv": 15000.0,
            "previous_failures": 1,
            "is_b2b": False,
            "ip_country": "IN",
            "card_country": "IN",
            "crm_notes": "Standard customer."
        }
        wh_resp = self.client.post("/api/v1/webhook/payment-failed", json=webhook_payload)
        self.assertEqual(wh_resp.status_code, 200)
        self.assertTrue(wh_resp.json()["success"])
        self.assertEqual(wh_resp.json()["state"], "PAYMENT_FAILED")

        eval_resp = self.client.post("/api/v1/agent/evaluate", json={"transaction_id": "tx_api_test_01"})
        self.assertEqual(eval_resp.status_code, 200)
        data = eval_resp.json()
        self.assertEqual(data["state"], "ACTION_SELECTED")
        self.assertEqual(data["selected_by"], "EXPECTED_UTILITY")

    def test_demo_txn_884_api(self):
        resp = self.client.post("/api/v1/agent/demo/txn_884")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["transaction_id"], "txn_884")
        self.assertEqual(data["selected_action"], "Escalate")
        self.assertEqual(data["selected_by"], "EXPECTED_UTILITY")

    def test_observability_metrics_api(self):
        resp = self.client.get("/api/v1/observability/metrics")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("financial_summary", data)
        self.assertGreater(data["financial_summary"]["realized_utility"], 0)
        self.assertEqual(data["action_distribution"]["Smart_Retry"], 384)

    def test_benchmark_mutation_protection_api(self):
        """Verify that attempting to evaluate or execute a benchmark transaction returns 403 Forbidden."""
        eval_resp = self.client.post("/api/v1/agent/evaluate", json={"transaction_id": "txn_retry_0001"})
        self.assertEqual(eval_resp.status_code, 403)
        self.assertIn("immutable frozen benchmark dataset", eval_resp.json()["detail"])

        exec_resp = self.client.post("/api/v1/execution/execute", json={"transaction_id": "txn_retry_0001"})
        self.assertEqual(exec_resp.status_code, 403)
        self.assertIn("immutable frozen benchmark dataset", exec_resp.json()["detail"])

        verify_resp = self.client.post("/api/v1/execution/verify", json={"transaction_id": "txn_retry_0001", "outcome": "RECOVERED"})
        self.assertEqual(verify_resp.status_code, 403)
        self.assertIn("immutable frozen benchmark dataset", verify_resp.json()["detail"])

if __name__ == "__main__":
    unittest.main()
