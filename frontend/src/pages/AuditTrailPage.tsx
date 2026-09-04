import React, { useState, useEffect } from 'react';
import { TransactionRecord, AuditLogEntry } from '../types';
import { apiClient } from '../api/client';
import { History, Search, RefreshCw, ShieldCheck } from 'lucide-react';

interface AuditTrailPageProps {
  onSelectTransaction: (tx: TransactionRecord) => void;
}

export const AuditTrailPage: React.FC<AuditTrailPageProps> = ({ onSelectTransaction }) => {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Flatten all audit entries
  const allLogs: { tx: TransactionRecord; entry: AuditLogEntry }[] = [];
  transactions.forEach((tx) => {
    if (tx.audit_trail && tx.audit_trail.length > 0) {
      tx.audit_trail.forEach((entry) => {
        allLogs.push({ tx, entry });
      });
    }
  });

  const filtered = allLogs.filter(({ tx, entry }) => {
    const term = search.toLowerCase();
    return (
      tx.transaction_id.toLowerCase().includes(term) ||
      tx.customer_id.toLowerCase().includes(term) ||
      entry.from_state.toLowerCase().includes(term) ||
      entry.to_state.toLowerCase().includes(term) ||
      (entry.details && entry.details.toLowerCase().includes(term))
    );
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            System Audit Trail & Compliance Log
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            Immutable audit record of state transitions, policy checks, Expected Utility decisions, and outcome accounting.
          </p>
        </div>

        <button className="btn-secondary" onClick={fetchAuditLogs} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
        <div className="header-search" style={{ width: '100%', maxWidth: '450px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search audit trail by Transaction ID, state, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading system audit trail...
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Transaction ID</th>
                  <th>Customer ID</th>
                  <th>From State</th>
                  <th>To State</th>
                  <th>Transition Details</th>
                  <th>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                      No audit log entries matching criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map(({ tx, entry }, idx) => (
                    <tr key={`${tx.transaction_id}-${idx}`}>
                      <td className="mono" style={{ fontSize: '0.78rem' }}>{entry.timestamp}</td>
                      <td className="mono" style={{ fontWeight: 700, color: 'var(--accent-primary)', cursor: 'pointer' }} onClick={() => onSelectTransaction(tx)}>
                        {tx.transaction_id}
                      </td>
                      <td className="mono" style={{ fontSize: '0.8rem' }}>{tx.customer_id}</td>
                      <td><span className="badge badge-neutral">{entry.from_state}</span></td>
                      <td><span className="badge badge-info">{entry.to_state}</span></td>
                      <td style={{ fontSize: '0.82rem' }}>{entry.details || 'State transition completed.'}</td>
                      <td>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => onSelectTransaction(tx)}>
                          View Tx
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
