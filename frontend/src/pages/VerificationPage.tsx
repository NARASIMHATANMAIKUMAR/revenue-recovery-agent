import React, { useState, useEffect } from 'react';
import { TransactionRecord } from '../types';
import { apiClient } from '../api/client';
import { CheckCircle2, AlertOctagon, RefreshCw } from 'lucide-react';

interface VerificationPageProps {
  onSelectTransaction: (tx: TransactionRecord) => void;
}

export const VerificationPage: React.FC<VerificationPageProps> = ({ onSelectTransaction }) => {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getTransactions();
      // Show pending or recent verified transactions
      const pendingOrVerified = data.filter((t) =>
        t.state === 'VERIFICATION_PENDING' ||
        t.state === 'ACTION_EXECUTED' ||
        t.state === 'ACTION_SELECTED' ||
        t.state === 'RECOVERED'
      );
      setTransactions(pendingOrVerified);
    } catch (err) {
      console.error('Error fetching verification queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleVerify = async (txId: string, outcome: 'RECOVERED' | 'FAILED_AGAIN' | 'CHURNED') => {
    setVerifyingId(txId);
    try {
      await apiClient.verifyOutcome(txId, outcome);
      await fetchPending();
    } catch (err) {
      console.error('Verification error:', err);
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Post-Action Outcome Verification
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            Confirm payment webhook callbacks to reconcile realized financial utility vs expected estimates.
          </p>
        </div>

        <button className="btn-secondary" onClick={fetchPending} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>Refresh Queue</span>
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading pending verification items...
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Amount</th>
                  <th>Customer ID</th>
                  <th>Selected Action</th>
                  <th>Action Cost</th>
                  <th>Verification Status</th>
                  <th>Realized Utility</th>
                  <th>Verify Outcome Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                      No items currently pending verification.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.transaction_id}>
                      <td className="mono" style={{ fontWeight: 700, color: 'var(--accent-primary)', cursor: 'pointer' }} onClick={() => onSelectTransaction(t)}>
                        {t.transaction_id}
                      </td>
                      <td style={{ fontWeight: 600 }}>₹{t.amount?.toLocaleString('en-IN')}</td>
                      <td className="mono" style={{ fontSize: '0.8rem' }}>{t.customer_id}</td>
                      <td><strong>{t.selected_action || 'Escalate'}</strong></td>
                      <td>₹{t.action_cost || 0}</td>
                      <td>
                        {t.state === 'RECOVERED' ? (
                          <span className="badge badge-success"><CheckCircle2 size={12} /> RECOVERED</span>
                        ) : t.state === 'CHURNED' || t.state === 'FAILED_AGAIN' ? (
                          <span className="badge badge-danger">{t.state}</span>
                        ) : (
                          <span className="badge badge-warning">VERIFICATION PENDING</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 700, color: (t.realized_utility || 0) >= 0 ? '#10b981' : '#ef4444' }}>
                        {t.realized_utility != null ? `₹${t.realized_utility.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <button
                            className="btn-success"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            onClick={() => handleVerify(t.transaction_id, 'RECOVERED')}
                            disabled={verifyingId === t.transaction_id}
                          >
                            ✓ Recovered
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: '#dc2626' }}
                            onClick={() => handleVerify(t.transaction_id, 'FAILED_AGAIN')}
                            disabled={verifyingId === t.transaction_id}
                          >
                            Failed
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: '#b91c1c' }}
                            onClick={() => handleVerify(t.transaction_id, 'CHURNED')}
                            disabled={verifyingId === t.transaction_id}
                          >
                            Churned
                          </button>
                        </div>
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
