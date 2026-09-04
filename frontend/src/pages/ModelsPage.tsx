import React from 'react';
import { Cpu, TrendingUp, AlertTriangle, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export const ModelsPage: React.FC = () => {
  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Decision Intelligence & ML Prediction Models
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
          Mathematical separation of outcome prediction, policy filtering, and financial Expected Utility optimization.
        </p>
      </div>

      {/* Core Architectural Distinction Banner */}
      <div className="grid-cols-3" style={{ marginBottom: '1.75rem' }}>
        <div className="card" style={{ borderTop: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#1d4ed8' }}>
            <Cpu size={18} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>1. ML Prediction Layer</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Predicts candidate recovery probabilities <strong>P(recovery | a)</strong> and failure churn risks <strong>P(churn | fail, a)</strong> based on failure codes, history, and customer LTV.
          </p>
          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>
            ROLE: Predicts Outcomes Only
          </div>
        </div>

        <div className="card" style={{ borderTop: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#b91c1c' }}>
            <ShieldCheck size={18} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>2. Policy Filter Layer</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Enforces hard compliance rules (Max retries, DND, fraud). Ineligible actions are strictly filtered out before Expected Utility scoring.
          </p>
          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', fontWeight: 700, color: '#dc2626' }}>
            ROLE: Filters Allowed Options
          </div>
        </div>

        <div className="card" style={{ borderTop: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#047857' }}>
            <TrendingUp size={18} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>3. Expected Utility Engine</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Combines ML probabilities, financial transaction amounts, LTV exposure, and execution costs to select the single action with maximum positive EU.
          </p>
          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>
            ROLE: Selects Optimal Action
          </div>
        </div>
      </div>

      {/* Expected Utility Formula Card */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          Expected Utility (EU) Decision Formulation
        </h3>

        <div className="mono" style={{ backgroundColor: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.92rem', color: '#4f46e5', fontWeight: 600, marginBottom: '1rem' }}>
          EU(action) = [ P(recovery | a) × Amount ] - [ (1 - P(recovery | a)) × P(churn | fail, a) × LTV × margin ] - Action_Cost(a)
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.82rem' }}>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>P(recovery | a):</strong>
            <p style={{ color: 'var(--text-secondary)' }}>Estimated probability of recovering payment given candidate action.</p>
          </div>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Amount:</strong>
            <p style={{ color: 'var(--text-secondary)' }}>Invoice or payment amount (₹) to be recovered.</p>
          </div>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>P(churn | fail, a):</strong>
            <p style={{ color: 'var(--text-secondary)' }}>Probability of customer churning if recovery attempt fails under action.</p>
          </div>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>LTV × margin:</strong>
            <p style={{ color: 'var(--text-secondary)' }}>Customer Lifetime Value financial risk exposure.</p>
          </div>
        </div>
      </div>

      {/* Baseline Lookups Table */}
      <div className="card">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          ML Baseline Probability Lookup Matrix
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Frozen lookup matrix exported from Phase 1 model baseline artifact (`backend/ml_artifacts/baseline_lookup.json`).
        </p>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Failure Reason Code</th>
                <th>Candidate Action</th>
                <th>P(Recovery)</th>
                <th>P(Churn | Fail)</th>
                <th>Direct Action Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowSpan={4} style={{ fontWeight: 700 }}>insufficient_funds</td>
                <td>Smart_Retry</td>
                <td><strong style={{ color: '#4f46e5' }}>55%</strong></td>
                <td><span style={{ color: '#dc2626' }}>8%</span></td>
                <td>₹0.00</td>
              </tr>
              <tr>
                <td>Payment_Link</td>
                <td><strong style={{ color: '#4f46e5' }}>65%</strong></td>
                <td><span style={{ color: '#dc2626' }}>5%</span></td>
                <td>₹5.00</td>
              </tr>
              <tr>
                <td>Escalate</td>
                <td><strong style={{ color: '#4f46e5' }}>90%</strong></td>
                <td><span style={{ color: '#dc2626' }}>1%</span></td>
                <td>₹250.00</td>
              </tr>
              <tr>
                <td>Update_Method</td>
                <td><strong style={{ color: '#4f46e5' }}>40%</strong></td>
                <td><span style={{ color: '#dc2626' }}>10%</span></td>
                <td>₹2.00</td>
              </tr>

              <tr style={{ borderTop: '2px solid var(--border-color)' }}>
                <td rowSpan={4} style={{ fontWeight: 700 }}>card_expired</td>
                <td>Smart_Retry</td>
                <td><strong style={{ color: '#4f46e5' }}>10%</strong></td>
                <td><span style={{ color: '#dc2626' }}>15%</span></td>
                <td>₹0.00</td>
              </tr>
              <tr>
                <td>Payment_Link</td>
                <td><strong style={{ color: '#4f46e5' }}>50%</strong></td>
                <td><span style={{ color: '#dc2626' }}>8%</span></td>
                <td>₹5.00</td>
              </tr>
              <tr>
                <td>Escalate</td>
                <td><strong style={{ color: '#4f46e5' }}>85%</strong></td>
                <td><span style={{ color: '#dc2626' }}>2%</span></td>
                <td>₹250.00</td>
              </tr>
              <tr>
                <td>Update_Method</td>
                <td><strong style={{ color: '#4f46e5' }}>88%</strong></td>
                <td><span style={{ color: '#dc2626' }}>2%</span></td>
                <td>₹2.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
