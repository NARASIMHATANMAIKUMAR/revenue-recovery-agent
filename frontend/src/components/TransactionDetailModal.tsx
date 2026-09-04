import React, { useState } from 'react';
import { TransactionRecord, EvaluateResponse } from '../types';
import { EUBreakdown } from './EUBreakdown';
import { apiClient } from '../api/client';
import { X, Play, CheckCircle2, AlertOctagon, User, ShieldAlert, ArrowRight, DollarSign, Mail, Phone } from 'lucide-react';

interface TransactionDetailModalProps {
  transaction: TransactionRecord;
  onClose: () => void;
  onRefresh: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ transaction: initialTx, onClose, onRefresh }) => {
  const [tx, setTx] = useState<TransactionRecord>(initialTx);
  const [evaluation, setEvaluation] = useState<EvaluateResponse | null>(null);
  const [loadingEval, setLoadingEval] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEvaluate = async () => {
    setLoadingEval(true);
    setError(null);
    try {
      const res = await apiClient.evaluateTransaction(tx.transaction_id);
      setEvaluation(res);
      setTx(res.transaction);
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Evaluation failed.');
    } finally {
      setLoadingEval(false);
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    setError(null);
    try {
      await apiClient.executeAction(tx.transaction_id);
      const updated = await apiClient.getTransactionDetail(tx.transaction_id);
      setTx(updated);
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Execution failed.');
    } finally {
      setExecuting(false);
    }
  };

  const handleVerify = async (outcome: 'RECOVERED' | 'FAILED_AGAIN' | 'CHURNED') => {
    setVerifying(true);
    setError(null);
    try {
      await apiClient.verifyOutcome(tx.transaction_id, outcome);
      const updated = await apiClient.getTransactionDetail(tx.transaction_id);
      setTx(updated);
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  // Safe status badge helper
  const getStatusBadge = (state: string) => {
    switch (state) {
      case 'RECOVERED':
        return <span className="badge badge-success"><CheckCircle2 size={12} /> RECOVERED</span>;
      case 'CHURNED':
      case 'FAILED_AGAIN':
        return <span className="badge badge-danger"><AlertOctagon size={12} /> {state}</span>;
      case 'VERIFICATION_PENDING':
        return <span className="badge badge-warning">VERIFICATION PENDING</span>;
      case 'ACTION_EXECUTED':
        return <span className="badge badge-info">ACTION EXECUTED</span>;
      case 'ACTION_SELECTED':
        return <span className="badge badge-info">ACTION SELECTED</span>;
      default:
        return <span className="badge badge-neutral">{state}</span>;
    }
  };

  // State Timeline Nodes
  const timelineStages = [
    'PAYMENT_FAILED',
    'CONTEXT_GATHERED',
    'EVALUATED',
    'ACTION_SELECTED',
    'ACTION_EXECUTED',
    'VERIFICATION_PENDING',
    tx.state === 'CHURNED' ? 'CHURNED' : tx.state === 'FAILED_AGAIN' ? 'FAILED_AGAIN' : 'RECOVERED'
  ];

  const getStageIndex = (st: string) => {
    if (st === 'RECOVERED' || st === 'FAILED_AGAIN' || st === 'CHURNED') return 6;
    switch (st) {
      case 'PAYMENT_FAILED': return 0;
      case 'CONTEXT_GATHERED': return 1;
      case 'EVALUATED': return 2;
      case 'ACTION_SELECTED': return 3;
      case 'ACTION_EXECUTED': return 4;
      case 'VERIFICATION_PENDING': return 5;
      default: return 0;
    }
  };

  const currentStageIdx = getStageIndex(tx.state);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 className="mono" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {tx.transaction_id}
              </h2>
              {getStatusBadge(tx.state)}
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Customer: <strong className="mono">{tx.customer_id}</strong> • Failure Reason: <strong>{tx.failure_code}</strong>
            </p>
          </div>

          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.6rem 0.85rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {/* 7-Stage State Lifecycle Timeline */}
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Atomic Decision Pipeline Stage:
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflowX: 'auto', gap: '0.3rem' }}>
            {timelineStages.map((stage, idx) => {
              const isDone = idx <= currentStageIdx;
              const isCurrent = idx === currentStageIdx;

              return (
                <React.Fragment key={stage}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', minWidth: '70px' }}>
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: isCurrent ? '#4f46e5' : isDone ? '#10b981' : '#cbd5e1',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}>
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? '#4f46e5' : 'var(--text-secondary)', textAlign: 'center', textTransform: 'uppercase' }}>
                      {stage.replace('_', ' ')}
                    </span>
                  </div>
                  {idx < timelineStages.length - 1 && (
                    <div style={{ flex: 1, height: '2px', backgroundColor: idx < currentStageIdx ? '#10b981' : '#cbd5e1', minWidth: '15px' }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Metadata Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          {/* Financials */}
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <DollarSign size={14} color="var(--accent-primary)" /> Financial Overview
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              ₹{tx.amount?.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              LTV: <strong>₹{tx.ltv?.toLocaleString('en-IN')}</strong> • Failures: <strong>{tx.previous_failures}</strong>
            </div>
          </div>

          {/* Context Flags */}
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <User size={14} color="var(--accent-primary)" /> Customer Context & Contact
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {tx.is_b2b && <span className="badge badge-info">B2B Account</span>}
              {tx.crm_context?.is_vip && <span className="badge badge-success">VIP Customer</span>}
              {tx.crm_context?.dnd_requested && <span className="badge badge-danger">DND Requested</span>}
              {tx.signals?.is_country_mismatch && <span className="badge badge-warning">IP Mismatch</span>}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
              Card: <strong>{tx.card_country}</strong> | IP: <strong>{tx.ip_country}</strong>
            </div>

            {/* Clickable Contact Links */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.6rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
              <a
                href={`mailto:${tx.customer_id.toLowerCase()}@enterprise.com`}
                style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}
                title="Send email to customer"
              >
                <Mail size={12} /> {tx.customer_id.toLowerCase()}@enterprise.com
              </a>
              <a
                href={`tel:+919876543210`}
                style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}
                title="Call customer support phone"
              >
                <Phone size={12} /> +91 98765 43210
              </a>
            </div>
          </div>

          {/* CRM Notes */}
          <div className="card" style={{ padding: '1rem', gridColumn: 'span 2' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldAlert size={14} color="var(--accent-primary)" /> Unstructured CRM Agent Notes
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '0.4rem', fontStyle: 'italic', backgroundColor: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              "{tx.crm_notes || 'No agent notes recorded.'}"
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ backgroundColor: '#f1f5f9', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Operational Actions & Recovery Triggers
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Selected Action: <strong>{tx.selected_action || 'None'}</strong> • Cost: <strong>₹{tx.action_cost || 0}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {(!tx.selected_action || tx.state === 'PAYMENT_FAILED') && (
              <button className="btn-primary" onClick={handleEvaluate} disabled={loadingEval}>
                <Play size={15} /> {loadingEval ? 'Evaluating...' : 'Evaluate Policy & EU'}
              </button>
            )}

            {tx.selected_action && (tx.state === 'ACTION_SELECTED' || tx.state === 'EVALUATED') && (
              <button className="btn-primary" onClick={handleExecute} disabled={executing}>
                <ArrowRight size={15} /> {executing ? 'Executing...' : `Execute ${tx.selected_action}`}
              </button>
            )}

            {tx.state === 'VERIFICATION_PENDING' && (
              <>
                <button className="btn-success" onClick={() => handleVerify('RECOVERED')} disabled={verifying}>
                  <CheckCircle2 size={14} /> Verify Recovered
                </button>
                <button className="btn-secondary" style={{ color: '#dc2626' }} onClick={() => handleVerify('FAILED_AGAIN')} disabled={verifying}>
                  Verify Retry Failed
                </button>
                <button className="btn-secondary" style={{ color: '#b91c1c' }} onClick={() => handleVerify('CHURNED')} disabled={verifying}>
                  Verify Churned
                </button>
              </>
            )}
          </div>
        </div>

        {/* Candidate Actions EU Breakdown */}
        {evaluation?.candidate_scores ? (
          <EUBreakdown
            scores={evaluation.candidate_scores}
            selectedAction={evaluation.selected_action}
            selectedBy={evaluation.selected_by}
          />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
            <button className="btn-secondary" onClick={handleEvaluate} disabled={loadingEval}>
              {loadingEval ? 'Loading Evaluation Breakdown...' : 'Load Decision Engine Breakdown'}
            </button>
          </div>
        )}

        {/* Realized Utility Financial Outcome */}
        {(tx.state === 'RECOVERED' || tx.state === 'FAILED_AGAIN' || tx.state === 'CHURNED') && (
          <div style={{ marginTop: '1.25rem', backgroundColor: tx.state === 'RECOVERED' ? '#ecfdf5' : '#fef2f2', border: `1px solid ${tx.state === 'RECOVERED' ? '#a7f3d0' : '#fecaca'}`, padding: '1rem', borderRadius: '10px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: tx.state === 'RECOVERED' ? '#047857' : '#991b1b', marginBottom: '0.4rem' }}>
              Final Realized Financial Accounting:
            </h4>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', flexWrap: 'wrap' }}>
              <div>Revenue Recovered: <strong>₹{tx.revenue_recovered?.toLocaleString('en-IN') || 0}</strong></div>
              <div>Action Cost: <strong>₹{tx.action_cost || 0}</strong></div>
              <div>Churn Loss: <strong>₹{tx.churn_loss?.toLocaleString('en-IN') || 0}</strong></div>
              <div>Realized Utility: <strong style={{ fontSize: '1rem', color: (tx.realized_utility || 0) >= 0 ? '#047857' : '#dc2626' }}>₹{tx.realized_utility?.toLocaleString('en-IN') || 0}</strong></div>
            </div>
            {tx.baseline_utility === null && (
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', marginTop: '0.4rem' }}>
                Counterfactual Baseline Utility: Not available for individual single transaction evaluation.
              </div>
            )}
          </div>
        )}

        {/* Audit Trail History */}
        {tx.audit_trail && tx.audit_trail.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
              Transaction Audit Trail:
            </h4>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>From State</th>
                    <th>To State</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {tx.audit_trail.map((entry, i) => (
                    <tr key={i}>
                      <td className="mono" style={{ fontSize: '0.78rem' }}>{entry.timestamp}</td>
                      <td><span className="badge badge-neutral">{entry.from_state}</span></td>
                      <td><span className="badge badge-info">{entry.to_state}</span></td>
                      <td style={{ fontSize: '0.8rem' }}>{entry.details || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
