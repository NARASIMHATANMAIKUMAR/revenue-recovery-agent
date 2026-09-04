import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { TransactionRecord } from '../types';
import { StateBadge } from '../components/StateBadge';
import { Search, FileText } from 'lucide-react';

export const AuditExplorer: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [filtered, setFiltered] = useState<TransactionRecord[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getTransactions()
      .then((txs) => {
        setTransactions(txs);
        setFiltered(txs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(transactions);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(transactions.filter(t =>
      t.transaction_id.toLowerCase().includes(q) ||
      t.customer_id.toLowerCase().includes(q) ||
      t.failure_code.toLowerCase().includes(q) ||
      (t.selected_action && t.selected_action.toLowerCase().includes(q))
    ));
  }, [search, transactions]);

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Transaction Audit Explorer
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Inspect individual transaction decisions, policy audit trails & financial utility values
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search by Transaction ID, Customer ID, Failure Code, or Action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              borderRadius: '8px',
              outline: 'none',
              fontSize: '0.9rem'
            }}
          />
        </div>
      </div>

      <div className="grid-cols-2" style={{ alignItems: 'start' }}>
        {/* Transaction Table */}
        <div className="card" style={{ padding: '1rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.6rem 0.5rem' }}>Transaction</th>
                <th style={{ padding: '0.6rem 0.5rem' }}>Amount</th>
                <th style={{ padding: '0.6rem 0.5rem' }}>State</th>
                <th style={{ padding: '0.6rem 0.5rem' }}>Action</th>
                <th style={{ padding: '0.6rem 0.5rem' }}>Realized EU</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Loading transactions...
                  </td>
                </tr>
              )}
              {filtered.slice(0, 50).map((tx) => {
                const hasRealized = tx.realized_utility !== null && tx.realized_utility !== undefined;
                return (
                  <tr
                    key={tx.transaction_id}
                    onClick={() => setSelectedTx(tx)}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      backgroundColor: selectedTx?.transaction_id === tx.transaction_id ? '#1e293b' : 'transparent',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div className="mono" style={{ fontWeight: 600, color: '#60a5fa' }}>{tx.transaction_id}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.failure_code}</div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <StateBadge state={tx.state} />
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>
                      {tx.selected_action || '-'}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>
                      {hasRealized ? (
                        <span style={{ color: (tx.realized_utility || 0) >= 0 ? '#34d399' : '#f87171' }}>
                          ₹{tx.realized_utility?.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>Awaiting verification</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Showing top {Math.min(50, filtered.length)} of {filtered.length} matching transactions
          </div>
        </div>

        {/* Transaction Detail Panel */}
        <div className="card">
          {selectedTx ? (
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#60a5fa' }}>
                Audit Detail: {selectedTx.transaction_id}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                <div>Customer: <strong className="mono">{selectedTx.customer_id}</strong></div>
                <div>Amount: <strong>₹{selectedTx.amount.toLocaleString('en-IN')}</strong></div>
                <div>LTV: <strong>₹{selectedTx.ltv.toLocaleString('en-IN')}</strong></div>
                <div>Previous Failures: <strong>{selectedTx.previous_failures}</strong></div>
                <div>Selected Action: <strong style={{ color: '#f59e0b' }}>{selectedTx.selected_action || 'None'}</strong></div>

                {selectedTx.policy_rule_triggered && (
                  <div>Applied Rules: <span className="mono" style={{ color: '#a78bfa' }}>{selectedTx.policy_rule_triggered}</span></div>
                )}

                <div>
                  Realized Utility:{' '}
                  {selectedTx.realized_utility !== null && selectedTx.realized_utility !== undefined ? (
                    <strong style={{ color: selectedTx.realized_utility >= 0 ? '#34d399' : '#f87171' }}>
                      ₹{selectedTx.realized_utility.toLocaleString('en-IN')}
                    </strong>
                  ) : (
                    <em style={{ color: '#f59e0b' }}>Awaiting verification</em>
                  )}
                </div>

                <div>
                  Baseline Realized Utility:{' '}
                  {selectedTx.baseline_utility !== null && selectedTx.baseline_utility !== undefined ? (
                    <strong>₹{selectedTx.baseline_utility.toLocaleString('en-IN')}</strong>
                  ) : (
                    <em style={{ color: '#9ca3af' }}>Baseline realized utility: Not available for this transaction</em>
                  )}
                </div>
              </div>

              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                State Transition Audit Trail:
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedTx.audit_trail && selectedTx.audit_trail.length > 0 ? (
                  selectedTx.audit_trail.map((entry, i) => (
                    <div key={i} style={{ backgroundColor: 'var(--bg-primary)', padding: '0.65rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                      <div style={{ color: 'var(--text-muted)' }}>{entry.timestamp}</div>
                      <div style={{ marginTop: '0.2rem' }}>
                        <span className="mono">{entry.from_state}</span> ➔ <span className="mono" style={{ color: '#60a5fa' }}>{entry.to_state}</span>
                      </div>
                      {entry.details && <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{entry.details}</div>}
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No audit log entries recorded yet.</div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <FileText size={32} style={{ marginBottom: '0.5rem' }} />
              <p>Select any transaction from the list to view full audit logs and decision breakdown.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
