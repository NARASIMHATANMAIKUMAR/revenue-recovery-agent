import React from 'react';
import { StateLifecycle } from '../types';

interface StateBadgeProps {
  state: StateLifecycle;
}

export const StateBadge: React.FC<StateBadgeProps> = ({ state }) => {
  const stateColors: Record<StateLifecycle, { bg: string; text: string; border: string }> = {
    PAYMENT_FAILED: { bg: '#37415120', text: '#9ca3af', border: '#4b5563' },
    CONTEXT_GATHERED: { bg: '#0284c720', text: '#38bdf8', border: '#0284c7' },
    EVALUATED: { bg: '#7c3aed20', text: '#a78bfa', border: '#7c3aed' },
    ACTION_SELECTED: { bg: '#f59e0b20', text: '#fbbf24', border: '#f59e0b' },
    ACTION_EXECUTED: { bg: '#2563eb20', text: '#60a5fa', border: '#2563eb' },
    VERIFICATION_PENDING: { bg: '#d9770620', text: '#fcd34d', border: '#d97706' },
    RECOVERED: { bg: '#05966920', text: '#34d399', border: '#059669' },
    FAILED_AGAIN: { bg: '#dc262620', text: '#f87171', border: '#dc2626' },
    CHURNED: { bg: '#4b556320', text: '#9ca3af', border: '#6b7280' },
  };

  const style = stateColors[state] || stateColors.PAYMENT_FAILED;

  return (
    <span
      className="badge mono"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
      }}
    >
      {state}
    </span>
  );
};
