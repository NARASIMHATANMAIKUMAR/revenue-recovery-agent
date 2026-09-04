import sqlite3
import json
import os
from typing import Optional, List
from backend.schemas.internal_models import TransactionRecord

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "revenue_recovery.db")

class Database:
    def __init__(self, db_path: str = DB_FILE):
        self.db_path = db_path
        self._init_db()

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path, timeout=30.0)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS transactions (
                    transaction_id TEXT PRIMARY KEY,
                    customer_id TEXT,
                    amount REAL,
                    failure_code TEXT,
                    ltv REAL,
                    state TEXT,
                    selected_action TEXT,
                    realized_utility REAL,
                    baseline_utility REAL,
                    revenue_recovered REAL,
                    churn_loss REAL,
                    action_cost REAL,
                    payload JSON,
                    updated_at TEXT
                );
            """)
            conn.commit()

    def save_transaction(self, tx: TransactionRecord) -> TransactionRecord:
        payload_json = tx.model_dump_json()
        with self._get_connection() as conn:
            conn.execute("""
                INSERT INTO transactions (
                    transaction_id, customer_id, amount, failure_code, ltv, state,
                    selected_action, realized_utility, baseline_utility, revenue_recovered,
                    churn_loss, action_cost, payload, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(transaction_id) DO UPDATE SET
                    customer_id=excluded.customer_id,
                    amount=excluded.amount,
                    failure_code=excluded.failure_code,
                    ltv=excluded.ltv,
                    state=excluded.state,
                    selected_action=excluded.selected_action,
                    realized_utility=excluded.realized_utility,
                    baseline_utility=excluded.baseline_utility,
                    revenue_recovered=excluded.revenue_recovered,
                    churn_loss=excluded.churn_loss,
                    action_cost=excluded.action_cost,
                    payload=excluded.payload,
                    updated_at=excluded.updated_at;
            """, (
                tx.transaction_id,
                tx.customer_id,
                tx.amount,
                tx.failure_code,
                tx.ltv,
                tx.state.value,
                tx.selected_action.value if tx.selected_action else None,
                tx.realized_utility,
                tx.baseline_utility,
                tx.revenue_recovered,
                tx.churn_loss,
                tx.action_cost,
                payload_json,
                tx.updated_at
            ))
            conn.commit()
        return tx

    def save_transactions(self, txs: List[TransactionRecord]) -> List[TransactionRecord]:
        with self._get_connection() as conn:
            conn.executemany("""
                INSERT INTO transactions (
                    transaction_id, customer_id, amount, failure_code, ltv, state,
                    selected_action, realized_utility, baseline_utility, revenue_recovered,
                    churn_loss, action_cost, payload, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(transaction_id) DO UPDATE SET
                    customer_id=excluded.customer_id,
                    amount=excluded.amount,
                    failure_code=excluded.failure_code,
                    ltv=excluded.ltv,
                    state=excluded.state,
                    selected_action=excluded.selected_action,
                    realized_utility=excluded.realized_utility,
                    baseline_utility=excluded.baseline_utility,
                    revenue_recovered=excluded.revenue_recovered,
                    churn_loss=excluded.churn_loss,
                    action_cost=excluded.action_cost,
                    payload=excluded.payload,
                    updated_at=excluded.updated_at;
            """, [
                (
                    tx.transaction_id,
                    tx.customer_id,
                    tx.amount,
                    tx.failure_code,
                    tx.ltv,
                    tx.state.value,
                    tx.selected_action.value if tx.selected_action else None,
                    tx.realized_utility,
                    tx.baseline_utility,
                    tx.revenue_recovered,
                    tx.churn_loss,
                    tx.action_cost,
                    tx.model_dump_json(),
                    tx.updated_at
                ) for tx in txs
            ])
            conn.commit()
        return txs

    def get_transaction(self, transaction_id: str) -> Optional[TransactionRecord]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT payload FROM transactions WHERE transaction_id = ?", (transaction_id,))
            row = cursor.fetchone()
            if row and row["payload"]:
                data = json.loads(row["payload"])
                return TransactionRecord.model_validate(data)
        return None

    def get_all_transactions(self) -> List[TransactionRecord]:
        results = []
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT payload FROM transactions")
            rows = cursor.fetchall()
            for row in rows:
                if row["payload"]:
                    data = json.loads(row["payload"])
                    results.append(TransactionRecord.model_validate(data))
        return results

    def clear(self):
        with self._get_connection() as conn:
            conn.execute("DELETE FROM transactions;")
            conn.commit()

db_instance = Database()
