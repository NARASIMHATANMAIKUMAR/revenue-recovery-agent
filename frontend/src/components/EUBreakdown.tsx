import React from 'react';
import { CandidateActionScore, ActionType } from '../types';
import { CheckCircle, AlertOctagon, Info } from 'lucide-react';

interface EUBreakdownProps {
  scores: CandidateActionScore[];
  selectedAction?: ActionType;
  selectedBy?: string;
  policyReason?: string | null;
}

export const EUBreakdown: React.FC<EUBreakdownProps> = ({ scores, selectedAction }) => {
  if (!scores || scores.length === 0) {
    return (
      <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        No candidate action evaluations available.
      </div>
    );
  }

  return (
    <div style={{ marginTop: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          Candidate Action Expected Utility Breakdown
        </h4>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Policy Eligibility Check → Expected Utility Optimization
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {scores.map((s) => {
          const isSelected = s.action === selectedAction;
          const isEligible = s.is_eligible !== false; // Default true if not explicitly false

          return (
            <div
              key={s.action}
              style={{
                backgroundColor: !isEligible ? '#fef2f2' : isSelected ? '#eef2ff' : '#ffffff',
                border: `1px solid ${!isEligible ? '#fecaca' : isSelected ? '#6366f1' : 'var(--border-color)'}`,
                borderRadius: '10px',
                padding: '1rem 1.15rem',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 4px 12px rgba(99, 102, 241, 0.12)' : 'var(--shadow-sm)'
              }}
            >
              {/* Header Line */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: !isEligible ? '#991b1b' : isSelected ? '#4338ca' : 'var(--text-primary)',
                    textDecoration: !isEligible ? 'line-through' : 'none'
                  }}>
                    {s.action}
                  </span>

                  {isSelected && (
                    <span className="badge badge-success" style={{ backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                      <CheckCircle size={13} /> MAX EU SELECTED
                    </span>
                  )}

                  {!isEligible && (
                    <span className="badge badge-danger">
                      <AlertOctagon size={13} /> POLICY BLOCKED
                    </span>
                  )}
                </div>

                {/* EU Value safely formatted */}
                <div>
                  {isEligible && s.expected_utility != null ? (
                    <div style={{
                      fontWeight: 800,
                      fontSize: '1.05rem',
                      color: s.expected_utility >= 0 ? '#059669' : '#dc2626'
                    }}>
                      EU = ₹{s.expected_utility.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: 600, fontStyle: 'italic' }}>
                      Not evaluated
                    </div>
                  )}
                </div>
              </div>

              {/* Blocked Reason */}
              {!isEligible && s.block_reason && (
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  padding: '0.45rem 0.75rem',
                  marginTop: '0.4rem',
                  fontSize: '0.8rem',
                  color: '#b91c1c',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <Info size={14} />
                  <span><strong>Policy Reason:</strong> {s.block_reason}</span>
                </div>
              )}

              {/* Formula Breakdown */}
              {isEligible && s.formula_breakdown && (
                <div className="mono" style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  backgroundColor: isSelected ? '#ffffff' : '#f8fafc',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  margin: '0.5rem 0'
                }}>
                  {s.formula_breakdown}
                </div>
              )}

              {!isEligible && (
                <div style={{ fontSize: '0.78rem', color: '#7f1d1d', fontStyle: 'italic', marginTop: '0.3rem' }}>
                  Formula: Not evaluated due to policy constraint override.
                </div>
              )}

              {/* Probabilities and Costs */}
              {isEligible && (
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                  <span>
                    P(rec): <strong style={{ color: '#4f46e5' }}>
                      {s.p_recovery != null ? `${(s.p_recovery * 100).toFixed(0)}%` : 'N/A'}
                    </strong>
                  </span>
                  <span>
                    P(churn|fail): <strong style={{ color: '#dc2626' }}>
                      {s.p_churn_given_fail != null ? `${(s.p_churn_given_fail * 100).toFixed(0)}%` : 'N/A'}
                    </strong>
                  </span>
                  <span>
                    Execution Cost: <strong>
                      {s.action_cost != null ? `₹${s.action_cost}` : '₹0'}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
