import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { Settings, Play, RefreshCw, CheckCircle2, ShieldCheck, Database } from 'lucide-react';

interface SettingsPageProps {
  onRefreshMetrics: () => Promise<void | any>;
  onOpenSimulateModal: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onRefreshMetrics, onOpenSimulateModal }) => {
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleRunDemoTxn884 = async () => {
    setLoadingDemo(true);
    setMessage(null);
    try {
      await apiClient.runDemoTxn884();
      await onRefreshMetrics();
      setMessage('Successfully initialized and evaluated test case transaction txn_884!');
    } catch (err: any) {
      setMessage('Failed to execute demo transaction.');
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          System Settings & Simulation Tools
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
          Configure API endpoints, database seeding options, and payment failure simulation test environments.
        </p>
      </div>

      {message && (
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} />
          <span>{message}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Simulation Tools */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Play size={18} color="#4f46e5" /> Test Failure Simulation Tools
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Trigger payment failure webhooks to test Policy Engine eligibility, ML probability lookups, and Expected Utility action selection.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={onOpenSimulateModal}>
              <Play size={16} />
              <span>Simulate Payment Failure</span>
            </button>

            <button className="btn-secondary" onClick={handleRunDemoTxn884} disabled={loadingDemo}>
              <RefreshCw size={15} className={loadingDemo ? 'spin' : ''} />
              <span>{loadingDemo ? 'Running...' : 'Re-Run Benchmark txn_884'}</span>
            </button>
          </div>
        </div>

        {/* Database & Environment Info */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Database size={18} color="#3b82f6" /> Database & System Environment
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem', fontSize: '0.85rem' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Database Provider</span>
              <strong style={{ color: 'var(--text-primary)' }}>SQLite (SQLAlchemy 2.0)</strong>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Frozen Benchmark Set</span>
              <strong style={{ color: 'var(--text-primary)' }}>1,000 Transactions</strong>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'block' }}>API Framework</span>
              <strong style={{ color: 'var(--text-primary)' }}>FastAPI (Uvicorn / Python 3.10+)</strong>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Frontend Stack</span>
              <strong style={{ color: 'var(--text-primary)' }}>React 18 + TypeScript + Vite</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
