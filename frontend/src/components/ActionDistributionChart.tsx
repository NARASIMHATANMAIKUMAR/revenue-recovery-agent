import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ActionDistribution } from '../types';

interface ActionDistributionChartProps {
  distribution: ActionDistribution;
}

const COLORS = {
  Smart_Retry: '#4f46e5',
  Payment_Link: '#8b5cf6',
  Update_Method: '#06b6d4',
  Escalate: '#f59e0b',
  STOP: '#ef4444',
};

export const ActionDistributionChart: React.FC<ActionDistributionChartProps> = ({ distribution }) => {
  const data = [
    { name: 'Smart Retry', count: distribution.Smart_Retry, key: 'Smart_Retry' },
    { name: 'Payment Link', count: distribution.Payment_Link, key: 'Payment_Link' },
    { name: 'Update Method', count: distribution.Update_Method, key: 'Update_Method' },
    { name: 'Escalate', count: distribution.Escalate, key: 'Escalate' },
    { name: 'STOP', count: distribution.STOP, key: 'STOP' },
  ];

  return (
    <div className="card" style={{ height: '340px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
        Target Action Distribution (N = {distribution.total})
      </h3>
      <div style={{ flex: 1, width: '100%', minHeight: '220px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              formatter={(val: number) => [`${val} transactions`, 'Action Volume']}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.key as keyof typeof COLORS]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
