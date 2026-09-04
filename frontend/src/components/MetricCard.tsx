import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  color: string;
  highlight?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, subValue, icon: Icon, color, highlight }) => {
  return (
    <div className={`card ${highlight ? 'highlight-card' : ''}`} style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>{title}</span>
        <div style={{
          padding: '0.4rem',
          borderRadius: '8px',
          backgroundColor: `${color}20`,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={18} />
        </div>
      </div>
      <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      {subValue && (
        <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: color, fontWeight: 600 }}>
          {subValue}
        </div>
      )}
    </div>
  );
};
