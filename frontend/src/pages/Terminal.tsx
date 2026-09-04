import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { EvaluateResponse, StateLifecycle, ObservabilityMetrics } from '../types';
import { StateBadge } from '../components/StateBadge';
import { EUBreakdown } from '../components/EUBreakdown';
import { Play, Sparkles, AlertCircle, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

interface TerminalProps {
  onRefreshMetrics?: () => Promise<void | ObservabilityMetrics>;
}

export const Terminal: React.FC<TerminalProps> = ({ onRefreshMetrics }) => {
  const [evalResult, setEvalResult] = useState<EvaluateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRunDemoTxn884 = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await apiClient.runDemoTxn884();
      setEvalResult(res);
      if (onRefreshMetrics) {
        await onRefreshMetrics();
      }
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || err.message || 'API request failed';
      setErrorMessage(`Error running demo txn_884: ${detail}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!evalResult) return;
    setErrorMessage(null);
    try {
      await apiClient.executeAction(evalResult.transaction_id);
      const updated = await apiClient.getTransactionDetail(evalResult.transaction_id);
      setEvalResult((prev) => prev ? { ...prev, state: updated.state, transaction: updated } : null);
      if (onRefreshMetrics) {
        await onRefreshMetrics();
      }
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || err.message || 'Action execution failed';
      setErrorMessage(`Execution error: ${detail}`);
    }
  };

  const handleVerify = async (outcome: string) => {
    if (!evalResult) return;
    setErrorMessage(null);
    try {
      await apiClient.verifyOutcome(evalResult.transaction_id, outcome);
      const updated = await apiClient.getTransactionDetail(evalResult.transaction_id);
      setEvalResult((prev) => prev ? { ...prev, state: updated.state, transaction: updated } : null);
      
      // Broadly update shared top-level dashboard metrics
      if (onRefreshMetrics) {
        await onRefreshMetrics();
      }
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || err.message || 'Outcome verification failed';
      setErrorMessage(`Verification error: ${detail}`);
    }
  };

  const stages: StateLifecycle[] = [
    'PAYMENT_FAILED',
    'CONTEXT_GATHERED',
    'EVALUATED',
    'ACTION_SELECTED',
    'ACTION_EXECUTED',
    'VERIFICATION_PENDING',
    'RECOVERED'
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Agent Execution Terminal
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Simulate payment failure ingestion, context resolution, policy check & EU math
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={handleRunDemoTxn884}
          disabled={loading}
          style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', padding: '0.85rem 1.75rem' }}
        >
          <Sparkles size={18} />
          {loading ? 'Evaluating txn_884...' : 'Run Live Demo: txn_884'}
        </button>
      </div>

      {errorMessage && (
        <div style={{
          backgroundColor: '#ef444415',
          border: '1px solid #ef444450',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#fca5a5'
        }}>
          <AlertTriangle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
          <div>
            <strong>HTTP API Error:</strong> {errorMessage}
          </div>
        </div>
      )}

      {evalResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* State Pipeline Stepper */}
          <div className="card">
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase' }}>
              State Lifecycle Pipeline
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {stages.map((st, idx) => {
                return (
                  <React.Fragment key={st}>
                    <StateBadge state={st} />
                    {idx < stages.length - 1 && <ArrowRight size={14} color="#4b5563" />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Transaction Metadata & Context */}
          <div className="grid-cols-2">
            <div className="card">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: '#60a5fa' }}>
                Transaction & Signal Context
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
                <div>ID: <strong className="mono">{evalResult.transaction_id}</strong></div>
                <div>Amount: <strong>₹{evalResult.transaction.amount.toLocaleString('en-IN')}</strong></div>
                <div>Failure Code: <span className="mono" style={{ color: '#f87171' }}>{evalResult.transaction.failure_code}</span></div>
                <div>LTV: <strong>₹{evalResult.transaction.ltv.toLocaleString('en-IN')}</strong></div>
                <div>Previous Failures: <strong>{evalResult.transaction.previous_failures}</strong></div>
                <div>Is B2B: <strong>{evalResult.transaction.is_b2b ? 'Yes' : 'No'}</strong></div>
                <div>IP / Card Country: <strong>{evalResult.transaction.ip_country} / {evalResult.transaction.card_country}</strong></div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: '#a78bfa' }}>
                Unstructured CRM Context (LLM Extracted)
              </h3>
              <div style={{ backgroundColor: 'var(--bg-primary)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <em>"{evalResult.transaction.crm_notes}"</em>
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                <span className="badge" style={{ backgroundColor: evalResult.transaction.crm_context?.is_vip ? '#8b5cf630' : '#37415130', color: evalResult.transaction.crm_context?.is_vip ? '#c4b5fd' : '#9ca3af' }}>
                  VIP Account: {evalResult.transaction.crm_context?.is_vip ? 'TRUE' : 'FALSE'}
                </span>
                <span className="badge" style={{ backgroundColor: evalResult.transaction.crm_context?.dnd_requested ? '#ef444430' : '#37415130', color: evalResult.transaction.crm_context?.dnd_requested ? '#fca5a5' : '#9ca3af' }}>
                  DND Requested: {evalResult.transaction.crm_context?.dnd_requested ? 'TRUE' : 'FALSE'}
                </span>
              </div>
            </div>
          </div>

          {/* Expected Utility Math Breakdown & Candidate Actions */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Decision Engine & Action Scoring
            </h3>
            <EUBreakdown
              scores={evalResult.candidate_scores}
              selectedAction={evalResult.selected_action}
              selectedBy={evalResult.selected_by}
              policyReason={evalResult.policy_override_reason}
            />

            {/* Financial Realization Section */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                Financial Realization Accounting:
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                <div>
                  Realized Utility:{' '}
                  {evalResult.transaction.realized_utility !== null && evalResult.transaction.realized_utility !== undefined ? (
                    <strong style={{ color: evalResult.transaction.realized_utility >= 0 ? '#34d399' : '#f87171' }}>
                      ₹{evalResult.transaction.realized_utility.toLocaleString('en-IN')}
                    </strong>
                  ) : (
                    <em style={{ color: '#f59e0b' }}>Awaiting verification</em>
                  )}
                </div>

                <div>
                  Baseline Realized Utility:{' '}
                  {evalResult.transaction.baseline_utility !== null && evalResult.transaction.baseline_utility !== undefined ? (
                    <strong>₹{evalResult.transaction.baseline_utility.toLocaleString('en-IN')}</strong>
                  ) : (
                    <em style={{ color: '#9ca3af' }}>Baseline realized utility: Not available for this transaction</em>
                  )}
                </div>

                {evalResult.transaction.action_cost !== null && evalResult.transaction.action_cost !== undefined && (
                  <div>Action Cost: <strong>₹{evalResult.transaction.action_cost}</strong></div>
                )}
              </div>
            </div>

            {/* Action Execution Controls */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {evalResult.state === 'ACTION_SELECTED' && (
                <button className="btn-primary" onClick={handleExecute}>
                  <Play size={16} /> Execute Selected Action ({evalResult.selected_action})
                </button>
              )}

              {evalResult.state === 'VERIFICATION_PENDING' && (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Set Outcome Verification:</span>
                  <button className="btn-secondary" onClick={() => handleVerify('RECOVERED')} style={{ color: '#34d399', borderColor: '#059669' }}>
                    <CheckCircle2 size={16} /> Mark Recovered
                  </button>
                  <button className="btn-secondary" onClick={() => handleVerify('FAILED_AGAIN')} style={{ color: '#f87171', borderColor: '#dc2626' }}>
                    Mark Failed Again
                  </button>
                  <button className="btn-secondary" onClick={() => handleVerify('CHURNED')} style={{ color: '#9ca3af', borderColor: '#4b5563' }}>
                    Mark Churned
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!evalResult && !loading && (
        <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <AlertCircle size={36} color="#6b7280" style={{ marginBottom: '1rem' }} />
          <h3>No Active Terminal Simulation</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Click <strong>Run Live Demo: txn_884</strong> to simulate the live frozen benchmark transaction.
          </p>
        </div>
      )}
    </div>
  );
};
