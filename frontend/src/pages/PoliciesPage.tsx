import React from 'react';
import { ShieldCheck, AlertOctagon, Lock, Info, ArrowRight } from 'lucide-react';

export const PoliciesPage: React.FC = () => {
  const policies = [
    {
      id: 'RULE_MAX_RETRY_COUNT_EXCEEDED',
      name: 'Maximum Automated Retry Count Exceeded',
      targetAction: 'Smart_Retry',
      condition: 'previous_failures >= 4',
      impact: 'Smart_Retry is strictly POLICY BLOCKED. Probability modeling and EU calculation are bypassed.',
      rationale: 'Retrying cards repeatedly after 4 consecutive bank declines causes customer annoyance, triggers card issuer security blocks, and increases churn probability without improving recovery rate.'
    },
    {
      id: 'RULE_DND_REQUESTED',
      name: 'Do Not Disturb (DND) Compliance Override',
      targetAction: 'Smart_Retry & Payment_Link',
      condition: 'crm_context.dnd_requested == true',
      impact: 'Automated background retries and SMS payment links are strictly POLICY BLOCKED.',
      rationale: 'Customer explicitly requested zero automated notifications. Violating DND preferences results in high customer dissatisfaction and immediate cancellation.'
    },
    {
      id: 'RULE_FRAUD_TERMINAL',
      name: 'Stolen Card & Fraud Terminal Rule',
      targetAction: 'All Recovery Actions (Forces STOP)',
      condition: 'failure_code == "stolen_card" OR is_stolen == true',
      impact: 'All recovery actions are filtered out. Selected action is forced to STOP.',
      rationale: 'Retrying or sending links for stolen cards violates payment gateway compliance, risks chargebacks, and incurs unnecessary gateway fees.'
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Policy Engine Guardrails & Governance
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
          Deterministic compliance guardrails enforced prior to machine learning predictions and Expected Utility optimization.
        </p>
      </div>

      {/* Decision Hierarchy Banner */}
      <div className="card" style={{ backgroundColor: '#eef2ff', borderColor: '#c7d2fe', marginBottom: '1.75rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
          <ShieldCheck size={20} color="#4f46e5" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#3730a3' }}>
            Architectural Principle: Strict Policy Precedence
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '0.75rem', backgroundColor: '#ffffff', padding: '0.85rem 1.25rem', borderRadius: '10px', border: '1px solid #c7d2fe' }}>
          <div style={{ fontWeight: 800, color: '#b91c1c', fontSize: '0.95rem' }}>
            1. POLICY ENGINE (Hard Constraint)
          </div>
          <ArrowRight size={16} color="var(--text-muted)" />
          <div style={{ fontWeight: 800, color: '#1d4ed8', fontSize: '0.95rem' }}>
            2. CONTEXT & ML PREDICTIONS
          </div>
          <ArrowRight size={16} color="var(--text-muted)" />
          <div style={{ fontWeight: 800, color: '#047857', fontSize: '0.95rem' }}>
            3. EXPECTED UTILITY OPTIMIZATION
          </div>
        </div>

        <p style={{ fontSize: '0.83rem', color: '#4338ca', marginTop: '0.75rem', lineHeight: '1.5' }}>
          Policies act as non-negotiable legal, regulatory, and business guardrails. If an action is blocked by a policy rule, it is strictly filtered out of the eligible candidate set. The system <strong>never</strong> evaluates ML probabilities or Expected Utility for policy-blocked actions.
        </p>
      </div>

      {/* Policy Rules List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {policies.map((p) => (
          <div key={p.id} className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="mono" style={{ fontWeight: 800, color: '#b91c1c', backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                  {p.id}
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {p.name}
                </h3>
              </div>

              <span className="badge badge-danger">
                <Lock size={12} /> HARD GUARDRAIL
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem', marginTop: '0.75rem', fontSize: '0.83rem' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>Condition Trigger:</strong>
                <code className="mono" style={{ color: '#4f46e5' }}>{p.condition}</code>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <strong style={{ color: '#b91c1c', display: 'block', marginBottom: '0.2rem' }}>Action Impact:</strong>
                <span>{p.impact}</span>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', gridColumn: 'span 2' }}>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>Business Rationale:</strong>
                <span style={{ color: 'var(--text-secondary)' }}>{p.rationale}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
