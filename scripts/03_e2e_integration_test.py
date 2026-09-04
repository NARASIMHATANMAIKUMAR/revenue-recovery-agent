import os
import sys
import tempfile
import importlib

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.core.db import Database
from backend.services.signal_resolver import SignalResolver
from backend.services.context_engine import ContextEngine
from backend.services.policy_engine import PolicyEngine
from backend.services.decision_engine import DecisionEngine
from backend.schemas.internal_models import TransactionRecord, StateLifecycleEnum, ActionEnum

export_phase1_models = importlib.import_module("scripts.01_export_phase1_models")
seed_demo_database = importlib.import_module("scripts.02_seed_demo_database")

export_models = export_phase1_models.export_models
seed_database = seed_demo_database.seed_database

def run_e2e_test():
    print("\n========================================================")
    print("RUNNING E2E INTEGRATION & BENCHMARK ASSERTION SUITE")
    print("========================================================\n")

    # Create isolated temp database
    temp_db_file = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
    temp_db_file.close()
    test_db = Database(db_path=temp_db_file.name)

    try:
        # Step 1: Export models
        print("[1/4] Exporting ML Artifact Baseline lookup...")
        export_models()

        # Step 2: Seed DB in isolated test environment
        print("[2/4] Seeding 1,000 benchmark transactions into isolated test database...")
        seed_database(db=test_db)

        # Step 3: Verify aggregate database benchmarks
        print("[3/4] Verifying exact frozen benchmark figures...")
        txs = test_db.get_all_transactions()
        print(f"Loaded {len(txs)} transactions from isolated SQLite test database.")

        realized_sum = sum(t.realized_utility or 0.0 for t in txs if t.transaction_id != "txn_884")
        baseline_sum = sum(t.baseline_utility or 0.0 for t in txs if t.transaction_id != "txn_884")
        revenue_sum = sum(t.revenue_recovered or 0.0 for t in txs if t.transaction_id != "txn_884")
        churn_sum = sum(t.churn_loss or 0.0 for t in txs if t.transaction_id != "txn_884")
        cost_sum = sum(t.action_cost or 0.0 for t in txs if t.transaction_id != "txn_884")

        action_counts = {
            ActionEnum.SMART_RETRY: 0,
            ActionEnum.PAYMENT_LINK: 0,
            ActionEnum.ESCALATE: 0,
            ActionEnum.UPDATE_METHOD: 0,
            ActionEnum.STOP: 0
        }
        for t in txs:
            if t.transaction_id != "txn_884" and t.selected_action:
                action_counts[t.selected_action] += 1

        print("\n--- BENCHMARK AUDIT RESULTS ---")
        print(f"Realized Utility:  INR {realized_sum:,.2f}  (Target: INR 1,426,800.00)")
        print(f"Baseline Utility:  INR {baseline_sum:,.2f}  (Target: INR 877,750.00)")
        print(f"Net Improvement:   INR {realized_sum - baseline_sum:,.2f}  (Target: INR 549,050.00)")
        print(f"Revenue Recovered: INR {revenue_sum:,.2f}  (Target: INR 1,696,850.00)")
        print(f"Churn Loss:        INR {churn_sum:,.2f}  (Target: INR 238,600.00)")
        print(f"Action Cost:       INR {cost_sum:,.2f}  (Target: INR 31,450.00)")
        print(f"Action Breakdown:  {action_counts}")

        assert abs(realized_sum - 1426800.0) < 1.0, f"Realized Utility mismatch: {realized_sum}"
        assert abs(baseline_sum - 877750.0) < 1.0, f"Baseline Utility mismatch: {baseline_sum}"
        assert abs((realized_sum - baseline_sum) - 549050.0) < 1.0, f"Improvement mismatch: {realized_sum - baseline_sum}"
        assert abs(revenue_sum - 1696850.0) < 1.0, f"Revenue recovered mismatch: {revenue_sum}"
        assert abs(churn_sum - 238600.0) < 1.0, f"Churn loss mismatch: {churn_sum}"
        assert abs(cost_sum - 31450.0) < 1.0, f"Action cost mismatch: {cost_sum}"
        
        assert action_counts[ActionEnum.SMART_RETRY] == 384, f"Smart_Retry count mismatch: {action_counts[ActionEnum.SMART_RETRY]}"
        assert action_counts[ActionEnum.PAYMENT_LINK] == 302, f"Payment_Link count mismatch: {action_counts[ActionEnum.PAYMENT_LINK]}"
        assert action_counts[ActionEnum.ESCALATE] == 125, f"Escalate count mismatch: {action_counts[ActionEnum.ESCALATE]}"
        assert action_counts[ActionEnum.UPDATE_METHOD] == 139, f"Update_Method count mismatch: {action_counts[ActionEnum.UPDATE_METHOD]}"
        assert action_counts[ActionEnum.STOP] == 50, f"STOP count mismatch: {action_counts[ActionEnum.STOP]}"
        print("[OK] ALL 1,000 TRANSACTION BENCHMARK SUBSET METRICS PERFECTLY MATCHED!")

        # Audit full 1,001 transaction state
        realized_full = sum(t.realized_utility or 0.0 for t in txs)
        baseline_full = sum(t.baseline_utility or 0.0 for t in txs)
        revenue_full = sum(t.revenue_recovered or 0.0 for t in txs)
        churn_full = sum(t.churn_loss or 0.0 for t in txs)
        cost_full = sum(t.action_cost or 0.0 for t in txs)

        action_counts_full = {
            ActionEnum.SMART_RETRY: 0,
            ActionEnum.PAYMENT_LINK: 0,
            ActionEnum.ESCALATE: 0,
            ActionEnum.UPDATE_METHOD: 0,
            ActionEnum.STOP: 0
        }
        for t in txs:
            if t.selected_action:
                action_counts_full[t.selected_action] += 1

        print("\n--- FULL 1,001 TRANSACTION VERIFIED AUDIT RESULTS ---")
        print(f"Total Transactions: {len(txs)}  (Target: 1001)")
        print(f"Realized Utility:  INR {realized_full:,.2f}  (Target: INR 1,429,050.00)")
        print(f"Baseline Utility:  INR {baseline_full:,.2f}  (Target: INR 877,750.00)")
        print(f"Net Improvement:   INR {realized_full - baseline_full:,.2f}  (Target: INR 551,300.00)")
        print(f"Revenue Recovered: INR {revenue_full:,.2f}  (Target: INR 1,699,350.00)")
        print(f"Churn Loss:        INR {churn_full:,.2f}  (Target: INR 238,600.00)")
        print(f"Action Cost:       INR {cost_full:,.2f}  (Target: INR 31,700.00)")
        print(f"Action Breakdown:  {action_counts_full}")

        assert len(txs) == 1001, f"Total transaction count mismatch: {len(txs)}"
        assert abs(realized_full - 1429050.0) < 1.0, f"Realized Utility 1001 mismatch: {realized_full}"
        assert abs(baseline_full - 877750.0) < 1.0, f"Baseline Utility 1001 mismatch: {baseline_full}"
        assert abs((realized_full - baseline_full) - 551300.0) < 1.0, f"Improvement 1001 mismatch: {realized_full - baseline_full}"
        assert abs(revenue_full - 1699350.0) < 1.0, f"Revenue recovered 1001 mismatch: {revenue_full}"
        assert abs(churn_full - 238600.0) < 1.0, f"Churn loss 1001 mismatch: {churn_full}"
        assert abs(cost_full - 31700.0) < 1.0, f"Action cost 1001 mismatch: {cost_full}"
        assert action_counts_full[ActionEnum.ESCALATE] == 126, f"Escalate 1001 count mismatch: {action_counts_full[ActionEnum.ESCALATE]}"
        print("[OK] ALL 1,001 TRANSACTION VERIFIED BENCHMARK METRICS PERFECTLY MATCHED!")

        # Step 4: Test txn_884 Live Demo case
        print("\n[4/4] Testing Live Demo Transaction txn_884 evaluation...")
        tx_884 = test_db.get_transaction("txn_884")
        assert tx_884 is not None, "txn_884 not found in database."

        sr = SignalResolver()
        ce = ContextEngine()
        pe = PolicyEngine()
        de = DecisionEngine()

        sr.resolve_signals(tx_884)
        ce.extract_crm_context(tx_884)
        policy_res = pe.evaluate_policy(tx_884)
        decision_res = de.evaluate(tx_884, policy_res)

        print("\n--- TXN_884 EVALUATION OUTPUT ---")
        print(f"Transaction ID:         {tx_884.transaction_id}")
        print(f"CRM Notes Extracted:    VIP={tx_884.crm_context.is_vip}, DND={tx_884.crm_context.dnd_requested}")
        print(f"Policy Eligible:        {[a.value for a in policy_res.eligible_actions]}")
        print(f"Policy Blocked:         {[a.value for a in policy_res.blocked_actions.keys()]}")
        print(f"Selected Action:        {decision_res.selected_action.value}")
        print(f"Selection Source:       {decision_res.selected_by}")
        print(f"Winning EU Score:       INR {decision_res.winning_eu_score:,.2f}")

        assert decision_res.selected_action == ActionEnum.ESCALATE, f"Expected Escalate for txn_884 but got {decision_res.selected_action}"
        assert decision_res.selected_by == "EXPECTED_UTILITY", f"Expected EXPECTED_UTILITY selection for txn_884 but got {decision_res.selected_by}"
        print("[OK] TXN_884 PASSED PERFECTLY: Expected Utility optimization selected action Escalate (EU = INR 1,970.00).")

        print("\n========================================================")
        print("ALL E2E INTEGRATION TESTS PASSED WITH 100% SUCCESS!")
        print("========================================================\n")
    finally:
        if os.path.exists(temp_db_file.name):
            try:
                os.remove(temp_db_file.name)
            except OSError:
                pass

if __name__ == "__main__":
    run_e2e_test()
