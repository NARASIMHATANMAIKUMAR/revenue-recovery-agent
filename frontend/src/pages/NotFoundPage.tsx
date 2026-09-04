import React from 'react';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { NavRoute } from '../components/Sidebar';

interface NotFoundPageProps {
  onNavigate: (route: NavRoute) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '65vh',
        textAlign: 'center',
        padding: '2rem'
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
          boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.2)'
        }}
      >
        <ShieldAlert size={36} />
      </div>

      <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.25rem', fontFamily: "'JetBrains Mono', monospace" }}>
        404
      </h1>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        Page or Route Not Found
      </h2>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '460px', lineHeight: 1.5, marginBottom: '1.75rem' }}>
        The revenue recovery view or navigation route you are attempting to access does not exist or has been relocated.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button className="btn-primary" onClick={() => onNavigate('dashboard')}>
          <LayoutDashboard size={16} />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};
