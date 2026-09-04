import React, { useEffect, useState } from 'react';
import { ObservabilityMetrics, TransactionRecord } from '../types';
import { MetricCard } from '../components/MetricCard';
import { ActionDistributionChart } from '../components/ActionDistributionChart';
import { apiClient } from '../api/client';
import { TrendingUp, DollarSign, AlertTriangle, Activity, Zap, ArrowRight, ShieldCheck, ListTodo, Receipt } from 'lucide-react';

interface DashboardProps {
  metrics: ObservabilityMetrics | null;
  loading: boolean;
  onRefreshMetrics: () => Promise<void | ObservabilityMetrics>;
  onNavigate: (route: any) => void;
  onSelectTransaction: (tx: TransactionRecord) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  metrics,
  loading,
  onRefreshMetrics,
  onNavigate,
  onSelectTransaction
}) => {
  const [recentTxs, setRecentTxs] = useState<TransactionRecord[]>([]);

  useEffect(() => {
    if (!metrics) {
      onRefreshMetrics();
    }
    apiClient.getTransactions().then((res) => {
      setRecentTxs(res.slice(0, 8)); // Top 8 recent
    }).catch(console.error);
  }, [metrics, onRefreshMetrics]);

  if (loading || !metrics) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading executive financial metrics & recovery dashboard...
      </div>
    );
  }

  const { financial_summary, action_distribution } = metrics;

  return (
    <div>
      {/* Page Title & Operational Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Good morning 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.2rem' }}>
            Here's what's happening with your VALTIX revenue recovery intelligence today.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={() => onNavigate('queue')}>
            <ListTodo size={16} />
            <span>View Recovery Queue</span>
          </button>
          <button className="btn-secondary" onClick={() => onNavigate('transactions')}>
            <Receipt size={16} />
            <span>View Transactions</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid-cols-4" style={{ marginBottom: '1.75rem' }}>
        <MetricCard
          title="Realized Utility"
          value={`₹${financial_summary.realized_utility.toLocaleString('en-IN')}`}
          subValue={`+₹${financial_summary.net_improvement.toLocaleString('en-IN')} vs Baseline`}
          icon={TrendingUp}
          color="#10b981"
          highlight={true}
        />

        <MetricCard
          title="Baseline Utility"
          value={`₹${financial_summary.baseline_utility.toLocaleString('en-IN')}`}
          subValue="Traditional Retry Policy"
          icon={Activity}
          color="#3b82f6"
        />

        <MetricCard
          title="Revenue Recovered"
          value={`₹${financial_summary.revenue_recovered.toLocaleString('en-IN')}`}
          subValue={`${financial_summary.recovery_rate_pct}% Recovery Rate`}
          icon={DollarSign}
          color="#8b5cf6"
        />

        <MetricCard
          title="Churn Loss Prevented"
          value={`₹${financial_summary.churn_loss.toLocaleString('en-IN')}`}
          subValue="Prevented Customer Churn Exposure"
          icon={AlertTriangle}
          color="#ef4444"
        />
      </div>

      {/* Analytics Row */}
      <div className="grid-cols-2" style={{ marginBottom: '1.75rem' }}>
        <ActionDistributionChart distribution={action_distribution} />

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Financial Optimization Summary
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.65rem', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Benchmark Failures</span>
                <strong style={{ color: 'var(--text-primary)' }}>{financial_summary.total_transactions}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.65rem', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Action Execution Cost</span>
                <strong style={{ color: '#f59e0b' }}>₹{financial_summary.action_cost.toLocaleString('en-IN')}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.65rem', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Net Financial Improvement</span>
                <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>
                  +₹{financial_summary.net_improvement.toLocaleString('en-IN')}
                </strong>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#eef2ff',
            border: '1px solid #c7d2fe',
            borderRadius: '10px',
            padding: '1rem',
            marginTop: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem'
          }}>
            <Zap size={24} color="#4f46e5" />
            <div style={{ fontSize: '0.85rem', color: '#3730a3', flex: 1 }}>
              <strong>Expected Utility Engine Active</strong>
              <br />
              Policy-constrained decision engine increased net financial utility by <strong>+62.5%</strong> over standard static retries.
            </div>
            <button className="btn-secondary" style={{ backgroundColor: '#ffffff', fontSize: '0.78rem' }} onClick={() => onNavigate('models')}>
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Failed Payment Recovery Audit
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Real-time failure events, policy checks & Expected Utility recommendations
            </p>
          </div>
          <button className="btn-secondary" style={{ fontSize: '0.8rem' }} onClick={() => onNavigate('transactions')}>
            <span>View All Transactions</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>Customer</th>
                <th>Failure Reason</th>
                <th>Status</th>
                <th>Selected Action</th>
                <th>Action Cost</th>
                <th>Realized Utility</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentTxs.map((t) => (
                <tr key={t.transaction_id} style={{ cursor: 'pointer' }} onClick={() => onSelectTransaction(t)}>
                  <td className="mono" style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{t.transaction_id}</td>
                  <td style={{ fontWeight: 600 }}>₹{t.amount?.toLocaleString('en-IN')}</td>
                  <td className="mono" style={{ fontSize: '0.8rem' }}>{t.customer_id}</td>
                  <td><span className="badge badge-neutral">{t.failure_code}</span></td>
                  <td>
                    {t.state === 'RECOVERED' ? (
                      <span className="badge badge-success">RECOVERED</span>
                    ) : t.state === 'ACTION_SELECTED' ? (
                      <span className="badge badge-info">ACTION SELECTED</span>
                    ) : (
                      <span className="badge badge-neutral">{t.state}</span>
                    )}
                  </td>
                  <td><strong>{t.selected_action || '-'}</strong></td>
                  <td>₹{t.action_cost || 0}</td>
                  <td style={{ fontWeight: 700, color: (t.realized_utility || 0) >= 0 ? '#10b981' : '#ef4444' }}>
                    {t.realized_utility != null ? `₹${t.realized_utility.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td>
                    <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
