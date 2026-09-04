import React from 'react';
import { SearchX, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onClearFilters?: () => void;
  icon?: React.ReactNode;
  actionText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'No items match your current search or filter criteria. Try adjusting your query.',
  onClearFilters,
  icon,
  actionText = 'Reset Search & Filters'
}) => {
  return (
    <div
      style={{
        padding: '3.5rem 2rem',
        textAlign: 'center',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px border-dashed var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '1rem 0'
      }}
    >
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '14px',
          backgroundColor: '#eef2ff',
          color: '#4f46e5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}
      >
        {icon || <SearchX size={26} />}
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: 1.5, marginBottom: '1.25rem' }}>
        {description}
      </p>

      {onClearFilters && (
        <button className="btn-secondary" onClick={onClearFilters} style={{ fontSize: '0.85rem' }}>
          <RefreshCw size={14} />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
