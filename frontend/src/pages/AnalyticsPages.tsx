import React from 'react';
import { ObservabilityMetrics } from '../types';
import { MetricCard } from '../components/MetricCard';
import { ActionDistributionChart } from '../components/ActionDistributionChart';
import { TrendingUp, DollarSign, AlertTriangle, Activity, BarChart2, Users, FileSpreadsheet, Zap } from 'lucide-react';

interface AnalyticsProps {
  metrics: ObservabilityMetrics | null;
  type: 'performance' | 'action-insights' | 'customer-insights' | 'financial-impact';
}

export const AnalyticsPages: React.FC<AnalyticsProps> = ({ metrics, type }) => {
  if (!metrics) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading analytical metrics...
      </div>
    );
  }

  const { financial_summary, action_distribution } = metrics;

  if (type === 'performance') {
    return (
      <div>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Recovery Performance Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            Comparative evaluation of realized utility against baseline retry strategies.
          </p>
        </div>

        <div className="grid-cols-4" style={{ marginBottom: '1.75rem' }}>
          <MetricCard
            title="Realized Utility"
            value={`₹${financial_summary.realized_utility.toLocaleString('en-IN')}`}
            subValue={`+₹${financial_summary.net_improvement.toLocaleString('en-IN')} Improvement`}
            icon={TrendingUp}
            color="#10b981"
            highlight={true}
          />
          <MetricCard
            title="Baseline Utility"
            value={`₹${financial_summary.baseline_utility.toLocaleString('en-IN')}`}
            subValue="Static Rule Policy"
            icon={Activity}
            color="#3b82f6"
          />
          <MetricCard
            title="Net Improvement"
            value={`+₹${financial_summary.net_improvement.toLocaleString('en-IN')}`}
            subValue="+62.5% Utility Boost"
            icon={Zap}
            color="#8b5cf6"
          />
          <MetricCard
            title="Recovery Rate"
            value={`${financial_summary.recovery_rate_pct}%`}
            subValue="685 Recovered Payments"
            icon={DollarSign}
            color="#06b6d4"
          />
        </div>

        <div className="grid-cols-2">
          <ActionDistributionChart distribution={action_distribution} />

          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Benchmark Performance Summary
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-color)' }}>
                <span>Total Evaluated Failures</span>
                <strong>{financial_summary.total_transactions}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-color)' }}>
                <span>Gross Revenue Recovered</span>
                <strong style={{ color: '#10b981' }}>₹{financial_summary.revenue_recovered.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-color)' }}>
                <span>Prevented Churn Loss</span>
                <strong style={{ color: '#ef4444' }}>₹{financial_summary.churn_loss.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-color)' }}>
                <span>Direct Action Execution Cost</span>
                <strong style={{ color: '#f59e0b' }}>₹{financial_summary.action_cost.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'action-insights') {
    return (
      <div>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Action Distribution & Policy Block Insights
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            Frequency, Expected Utility contribution, and policy restriction rates per action type.
          </p>
        </div>

        <div className="grid-cols-2" style={{ marginBottom: '1.75rem' }}>
          <ActionDistributionChart distribution={action_distribution} />

          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Action Utility Efficiency Matrix
            </h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Count</th>
                    <th>Share</th>
                    <th>Cost</th>
                    <th>Policy Filter Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Smart_Retry</strong></td>
                    <td>{action_distribution.Smart_Retry}</td>
                    <td>38.4%</td>
                    <td>₹0.00</td>
                    <td><span className="badge badge-warning">High (Max Retries)</span></td>
                  </tr>
                  <tr>
                    <td><strong>Payment_Link</strong></td>
                    <td>{action_distribution.Payment_Link}</td>
                    <td>30.2%</td>
                    <td>₹5.00</td>
                    <td><span className="badge badge-neutral">Low (DND Only)</span></td>
                  </tr>
                  <tr>
                    <td><strong>Update_Method</strong></td>
                    <td>{action_distribution.Update_Method}</td>
                    <td>13.9%</td>
                    <td>₹2.00</td>
                    <td><span className="badge badge-neutral">Low</span></td>
                  </tr>
                  <tr>
                    <td><strong>Escalate</strong></td>
                    <td>{action_distribution.Escalate}</td>
                    <td>12.5%</td>
                    <td>₹250.00</td>
                    <td><span className="badge badge-success">Zero</span></td>
                  </tr>
                  <tr>
                    <td><strong>STOP</strong></td>
                    <td>{action_distribution.STOP}</td>
                    <td>5.0%</td>
                    <td>₹0.00</td>
                    <td><span className="badge badge-danger">Mandatory Fraud</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'customer-insights') {
    return (
      <div>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Customer Segment & Risk Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            B2B vs B2C recovery rates, VIP customer protection, and LTV risk exposure.
          </p>
        </div>

        <div className="grid-cols-3">
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              B2B Enterprise Accounts
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Corporate invoice failures with high LTV exposure (Avg ₹30,000).
            </p>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#4f46e5' }}>
              80.0% Recovery Rate
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dominant Action: Escalate / Payment Link</span>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              VIP Customer Protection
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Accounts with DND or high-priority agent tags.
            </p>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981' }}>
              100% Policy Compliant
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Smart_Retry automatically blocked</span>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Card Expired & Mandates
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Recurring subscription renewals dropping due to expired credentials.
            </p>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#06b6d4' }}>
              88% Recovery via Update_Method
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Low execution cost (₹2.00)</span>
          </div>
        </div>
      </div>
    );
  }

  // Financial Impact
  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Financial Impact & Return on Recovery Investment (RORI)
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
          Realized revenue recovered vs action execution cost expenditure.
        </p>
      </div>

      <div className="grid-cols-4" style={{ marginBottom: '1.75rem' }}>
        <MetricCard
          title="Revenue Recovered"
          value={`₹${financial_summary.revenue_recovered.toLocaleString('en-IN')}`}
          subValue="Gross Recovered Invoices"
          icon={DollarSign}
          color="#10b981"
          highlight={true}
        />
        <MetricCard
          title="Execution Cost"
          value={`₹${financial_summary.action_cost.toLocaleString('en-IN')}`}
          subValue="Total Operational Outlay"
          icon={BarChart2}
          color="#f59e0b"
        />
        <MetricCard
          title="Prevented Churn Loss"
          value={`₹${financial_summary.churn_loss.toLocaleString('en-IN')}`}
          subValue="LTV Exposure Saved"
          icon={AlertTriangle}
          color="#ef4444"
        />
        <MetricCard
          title="Net Financial Return"
          value={`+₹${financial_summary.net_improvement.toLocaleString('en-IN')}`}
          subValue="Net Value Added vs Baseline"
          icon={TrendingUp}
          color="#4f46e5"
        />
      </div>
    </div>
  );
};
