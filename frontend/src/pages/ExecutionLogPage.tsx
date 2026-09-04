import React, { useState, useEffect } from 'react';
import { TransactionRecord } from '../types';
import { apiClient } from '../api/client';
import { History, RefreshCw, CheckCircle2, Clock } from 'lucide-react';

interface ExecutionLogPageProps {
  onSelectTransaction: (tx: TransactionRecord) => void;
}

export const ExecutionLogPage: React.FC<ExecutionLogPageProps> = ({ onSelectTransaction }) => {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getTransactions();
      // Filter executed transactions
      const executed = data.filter((t) => t.selected_action || t.state === 'ACTION_EXECUTED' || t.state === 'VERIFICATION_PENDING' || t.state === 'RECOVERED');
      setTransactions(executed);
    } catch (err) {
      console.error('Error loading execution logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Action Execution Log
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            Audit history of dispatched payment recovery actions, channels, costs, and execution outcomes.
          </p>
        </div>

        <button className="btn-secondary" onClick={fetchLogs} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>Refresh Log</span>
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading execution logs...
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Customer</th>
                  <th>Dispatched Action</th>
                  <th>Action Cost</th>
                  <th>Execution State</th>
                  <th>Outcome Status</th>
                  <th>Realized Utility</th>
                  <th>Execution Timestamp</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                      No action execution logs found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.transaction_id} style={{ cursor: 'pointer' }} onClick={() => onSelectTransaction(t)}>
                      <td className="mono" style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{t.transaction_id}</td>
                      <td className="mono" style={{ fontSize: '0.8rem' }}>{t.customer_id}</td>
                      <td><strong>{t.selected_action || 'Smart_Retry'}</strong></td>
                      <td>₹{t.action_cost || 0}</td>
                      <td>
                        <span className="badge badge-info">{t.state}</span>
                      </td>
                      <td>
                        {t.state === 'RECOVERED' ? (
                          <span className="badge badge-success"><CheckCircle2 size={12} /> RECOVERED</span>
                        ) : t.state === 'CHURNED' || t.state === 'FAILED_AGAIN' ? (
                          <span className="badge badge-danger">{t.state}</span>
                        ) : (
                          <span className="badge badge-warning"><Clock size={12} /> PENDING</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 700, color: (t.realized_utility || 0) >= 0 ? '#10b981' : '#ef4444' }}>
                        {t.realized_utility != null ? `₹${t.realized_utility.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {t.updated_at ? new Date(t.updated_at).toLocaleString() : 'Recent'}
                      </td>
                      <td>
                        <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                          View Audit
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
