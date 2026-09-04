import unittest
import importlib
import tempfile
import os
from backend.core.db import Database
from backend.schemas.internal_models import ActionEnum

seed_demo_database = importlib.import_module("scripts.02_seed_demo_database")
seed_database = seed_demo_database.seed_database

class TestBenchmarkMetrics(unittest.TestCase):
    def setUp(self):
        self.temp_db_file = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
        self.temp_db_file.close()
        self.db = Database(db_path=self.temp_db_file.name)

    def tearDown(self):
        if os.path.exists(self.temp_db_file.name):
            try:
                os.remove(self.temp_db_file.name)
            except OSError:
                pass

    def test_benchmark_frozen_totals(self):
        seed_database(db=self.db)
        txs = self.db.get_all_transactions()

        benchmark_txs = [t for t in txs if t.transaction_id != "txn_884"]
        self.assertEqual(len(benchmark_txs), 1000)

        realized_sum = sum(t.realized_utility or 0.0 for t in benchmark_txs)
        baseline_sum = sum(t.baseline_utility or 0.0 for t in benchmark_txs)
        revenue_sum = sum(t.revenue_recovered or 0.0 for t in benchmark_txs)
        churn_sum = sum(t.churn_loss or 0.0 for t in benchmark_txs)
        cost_sum = sum(t.action_cost or 0.0 for t in benchmark_txs)

        action_counts = {
            ActionEnum.SMART_RETRY: 0,
            ActionEnum.PAYMENT_LINK: 0,
            ActionEnum.ESCALATE: 0,
            ActionEnum.UPDATE_METHOD: 0,
            ActionEnum.STOP: 0
        }
        for t in benchmark_txs:
            if t.selected_action:
                action_counts[t.selected_action] += 1

        self.assertAlmostEqual(realized_sum, 1426800.0, delta=1.0)
        self.assertAlmostEqual(baseline_sum, 877750.0, delta=1.0)
        self.assertAlmostEqual(realized_sum - baseline_sum, 549050.0, delta=1.0)
        self.assertAlmostEqual(revenue_sum, 1696850.0, delta=1.0)
        self.assertAlmostEqual(churn_sum, 238600.0, delta=1.0)
        self.assertAlmostEqual(cost_sum, 31450.0, delta=1.0)

        self.assertEqual(action_counts[ActionEnum.SMART_RETRY], 384)
        self.assertEqual(action_counts[ActionEnum.PAYMENT_LINK], 302)
        self.assertEqual(action_counts[ActionEnum.ESCALATE], 125)
        self.assertEqual(action_counts[ActionEnum.UPDATE_METHOD], 139)
        self.assertEqual(action_counts[ActionEnum.STOP], 50)

    def test_full_1001_transaction_post_verification_totals(self):
        seed_database(db=self.db)
        txs = self.db.get_all_transactions()
        self.assertEqual(len(txs), 1001)

        realized_sum = sum(t.realized_utility or 0.0 for t in txs)
        baseline_sum = sum(t.baseline_utility or 0.0 for t in txs)
        revenue_sum = sum(t.revenue_recovered or 0.0 for t in txs)
        churn_sum = sum(t.churn_loss or 0.0 for t in txs)
        cost_sum = sum(t.action_cost or 0.0 for t in txs)

        action_counts = {
            ActionEnum.SMART_RETRY: 0,
            ActionEnum.PAYMENT_LINK: 0,
            ActionEnum.ESCALATE: 0,
            ActionEnum.UPDATE_METHOD: 0,
            ActionEnum.STOP: 0
        }
        for t in txs:
            if t.selected_action:
                action_counts[t.selected_action] += 1

        self.assertAlmostEqual(realized_sum, 1429050.0, delta=1.0)
        self.assertAlmostEqual(baseline_sum, 877750.0, delta=1.0)
        self.assertAlmostEqual(realized_sum - baseline_sum, 551300.0, delta=1.0)
        self.assertAlmostEqual(revenue_sum, 1699350.0, delta=1.0)
        self.assertAlmostEqual(churn_sum, 238600.0, delta=1.0)
        self.assertAlmostEqual(cost_sum, 31700.0, delta=1.0)

        self.assertEqual(action_counts[ActionEnum.SMART_RETRY], 384)
        self.assertEqual(action_counts[ActionEnum.PAYMENT_LINK], 302)
        self.assertEqual(action_counts[ActionEnum.ESCALATE], 126)
        self.assertEqual(action_counts[ActionEnum.UPDATE_METHOD], 139)
        self.assertEqual(action_counts[ActionEnum.STOP], 50)

if __name__ == "__main__":
    unittest.main()
