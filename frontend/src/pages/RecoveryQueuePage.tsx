import React, { useState, useEffect } from 'react';
import { TransactionRecord } from '../types';
import { apiClient } from '../api/client';
import { ListTodo, Play, ArrowRight, CheckCircle2, AlertOctagon, Clock } from 'lucide-react';

import { EmptyState } from '../components/EmptyState';

interface RecoveryQueuePageProps {
  onSelectTransaction: (tx: TransactionRecord) => void;
}

export const RecoveryQueuePage: React.FC<RecoveryQueuePageProps> = ({ onSelectTransaction }) => {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'needs-eval' | 'awaiting-exec' | 'pending-verify' | 'resolved'>('all');

  const loadQueue = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Error loading recovery queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  // Filter queues
  const needsEval = transactions.filter((t) => t.state === 'PAYMENT_FAILED' || t.state === 'CONTEXT_GATHERED');
  const awaitingExec = transactions.filter((t) => t.state === 'EVALUATED' || t.state === 'ACTION_SELECTED');
  const pendingVerify = transactions.filter((t) => t.state === 'ACTION_EXECUTED' || t.state === 'VERIFICATION_PENDING');
  const resolved = transactions.filter((t) => t.state === 'RECOVERED' || t.state === 'FAILED_AGAIN' || t.state === 'CHURNED');

  const getFilteredList = () => {
    switch (activeTab) {
      case 'needs-eval': return needsEval;
      case 'awaiting-exec': return awaitingExec;
      case 'pending-verify': return pendingVerify;
      case 'resolved': return resolved;
      default: return transactions;
    }
  };

  const currentList = getFilteredList();

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Payment Failure Recovery Queue
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
          Operational control queue for evaluating failed payments, executing optimal recovery actions, and verifying realized financial utility.
        </p>
      </div>

      {/* Stage Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          className="btn-secondary"
          style={{ backgroundColor: activeTab === 'all' ? '#eef2ff' : '#ffffff', borderColor: activeTab === 'all' ? '#6366f1' : 'var(--border-color)', color: activeTab === 'all' ? '#4f46e5' : 'var(--text-primary)' }}
          onClick={() => setActiveTab('all')}
        >
          All Failures ({transactions.length})
        </button>

        <button
          className="btn-secondary"
          style={{ backgroundColor: activeTab === 'needs-eval' ? '#eff6ff' : '#ffffff', borderColor: activeTab === 'needs-eval' ? '#3b82f6' : 'var(--border-color)', color: activeTab === 'needs-eval' ? '#1d4ed8' : 'var(--text-primary)' }}
          onClick={() => setActiveTab('needs-eval')}
        >
          <Clock size={15} /> Needs Evaluation ({needsEval.length})
        </button>

        <button
          className="btn-secondary"
          style={{ backgroundColor: activeTab === 'awaiting-exec' ? '#f5f3ff' : '#ffffff', borderColor: activeTab === 'awaiting-exec' ? '#8b5cf6' : 'var(--border-color)', color: activeTab === 'awaiting-exec' ? '#6d28d9' : 'var(--text-primary)' }}
          onClick={() => setActiveTab('awaiting-exec')}
        >
          <Play size={15} /> Awaiting Execution ({awaitingExec.length})
        </button>

        <button
          className="btn-secondary"
          style={{ backgroundColor: activeTab === 'pending-verify' ? '#fffbe6' : '#ffffff', borderColor: activeTab === 'pending-verify' ? '#f59e0b' : 'var(--border-color)', color: activeTab === 'pending-verify' ? '#b45309' : 'var(--text-primary)' }}
          onClick={() => setActiveTab('pending-verify')}
        >
          <ArrowRight size={15} /> Verification Pending ({pendingVerify.length})
        </button>

        <button
          className="btn-secondary"
          style={{ backgroundColor: activeTab === 'resolved' ? '#ecfdf5' : '#ffffff', borderColor: activeTab === 'resolved' ? '#10b981' : 'var(--border-color)', color: activeTab === 'resolved' ? '#047857' : 'var(--text-primary)' }}
          onClick={() => setActiveTab('resolved')}
        >
          <CheckCircle2 size={15} /> Resolved ({resolved.length})
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading recovery queue items...
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Amount</th>
                  <th>Customer ID</th>
                  <th>Failure Reason</th>
                  <th>VIP / DND</th>
                  <th>Current State</th>
                  <th>Selected Action</th>
                  <th>Action Cost</th>
                  <th>Realized Utility</th>
                  <th>Queue Action</th>
                </tr>
              </thead>
              <tbody>
                {currentList.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ padding: '1rem 0' }}>
                      <EmptyState
                        title="Queue is clear"
                        description="There are currently no transactions pending processing in this queue stage."
                      />
                    </td>
                  </tr>
                ) : (
                  currentList.map((t) => (
                    <tr key={t.transaction_id} style={{ cursor: 'pointer' }} onClick={() => onSelectTransaction(t)}>
                      <td className="mono" style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{t.transaction_id}</td>
                      <td style={{ fontWeight: 600 }}>₹{t.amount?.toLocaleString('en-IN')}</td>
                      <td className="mono" style={{ fontSize: '0.8rem' }}>{t.customer_id}</td>
                      <td><span className="badge badge-neutral">{t.failure_code}</span></td>
                      <td>
                        {t.crm_context?.is_vip && <span className="badge badge-success" style={{ marginRight: '0.3rem' }}>VIP</span>}
                        {t.crm_context?.dnd_requested && <span className="badge badge-danger">DND</span>}
                        {!t.crm_context?.is_vip && !t.crm_context?.dnd_requested && '-'}
                      </td>
                      <td>
                        {t.state === 'RECOVERED' ? (
                          <span className="badge badge-success">RECOVERED</span>
                        ) : t.state === 'ACTION_SELECTED' ? (
                          <span className="badge badge-info">ACTION SELECTED</span>
                        ) : (
                          <span className="badge badge-neutral">{t.state}</span>
                        )}
                      </td>
                      <td><strong>{t.selected_action || 'Pending'}</strong></td>
                      <td>₹{t.action_cost || 0}</td>
                      <td style={{ fontWeight: 700, color: (t.realized_utility || 0) >= 0 ? '#10b981' : '#ef4444' }}>
                        {t.realized_utility != null ? `₹${t.realized_utility.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td>
                        <button className="btn-primary" style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}>
                          Process Item
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
