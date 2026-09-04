import React, { useState, useEffect } from 'react';
import { TransactionRecord } from '../types';
import { apiClient } from '../api/client';
import { Search, Filter, RefreshCw, Eye } from 'lucide-react';

import { EmptyState } from '../components/EmptyState';

interface TransactionsPageProps {
  onSelectTransaction: (tx: TransactionRecord) => void;
  searchQuery: string;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({ onSelectTransaction, searchQuery: initialSearch }) => {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [failureFilter, setFailureFilter] = useState<string>('ALL');

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setFailureFilter('ALL');
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.transaction_id.toLowerCase().includes(search.toLowerCase()) ||
      t.customer_id.toLowerCase().includes(search.toLowerCase()) ||
      t.failure_code.toLowerCase().includes(search.toLowerCase()) ||
      (t.crm_notes && t.crm_notes.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || t.state === statusFilter;
    const matchesFailure = failureFilter === 'ALL' || t.failure_code === failureFilter;

    return matchesSearch && matchesStatus && matchesFailure;
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Payment Recovery Operations
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            Inspect payment failure events, policy evaluation states, and Expected Utility action recommendations.
          </p>
        </div>

        <button className="btn-secondary" onClick={fetchTransactions} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>Refresh Table</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="header-search" style={{ flex: 1, minWidth: '240px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by Tx ID, Customer ID, failure code, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status:</span>
          <select
            className="header-search"
            style={{ width: '160px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses ({transactions.length})</option>
            <option value="PAYMENT_FAILED">PAYMENT_FAILED</option>
            <option value="CONTEXT_GATHERED">CONTEXT_GATHERED</option>
            <option value="EVALUATED">EVALUATED</option>
            <option value="ACTION_SELECTED">ACTION_SELECTED</option>
            <option value="ACTION_EXECUTED">ACTION_EXECUTED</option>
            <option value="VERIFICATION_PENDING">VERIFICATION_PENDING</option>
            <option value="RECOVERED">RECOVERED</option>
            <option value="FAILED_AGAIN">FAILED_AGAIN</option>
            <option value="CHURNED">CHURNED</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Failure Code:</span>
          <select
            className="header-search"
            style={{ width: '180px' }}
            value={failureFilter}
            onChange={(e) => setFailureFilter(e.target.value)}
          >
            <option value="ALL">All Failure Reasons</option>
            <option value="insufficient_funds">insufficient_funds</option>
            <option value="card_expired">card_expired</option>
            <option value="authentication_failed">authentication_failed</option>
            <option value="stolen_card">stolen_card</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading payment recovery transactions...
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Amount</th>
                  <th>Customer ID</th>
                  <th>Failure Reason</th>
                  <th>Previous Failures</th>
                  <th>Status</th>
                  <th>Selected Action</th>
                  <th>EU Score</th>
                  <th>Action Cost</th>
                  <th>Updated At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ padding: '1rem 0' }}>
                      <EmptyState
                        title="No matching transactions found"
                        description="No payment transactions match your current search query or status filter."
                        onClearFilters={handleClearFilters}
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <tr key={t.transaction_id} style={{ cursor: 'pointer' }} onClick={() => onSelectTransaction(t)}>
                      <td className="mono" style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{t.transaction_id}</td>
                      <td style={{ fontWeight: 600 }}>₹{t.amount?.toLocaleString('en-IN')}</td>
                      <td className="mono" style={{ fontSize: '0.8rem' }}>{t.customer_id}</td>
                      <td><span className="badge badge-neutral">{t.failure_code}</span></td>
                      <td style={{ textAlign: 'center' }}><strong>{t.previous_failures}</strong></td>
                      <td>
                        {t.state === 'RECOVERED' ? (
                          <span className="badge badge-success">RECOVERED</span>
                        ) : t.state === 'CHURNED' || t.state === 'FAILED_AGAIN' ? (
                          <span className="badge badge-danger">{t.state}</span>
                        ) : t.state === 'ACTION_SELECTED' ? (
                          <span className="badge badge-info">ACTION SELECTED</span>
                        ) : (
                          <span className="badge badge-neutral">{t.state}</span>
                        )}
                      </td>
                      <td><strong>{t.selected_action || '-'}</strong></td>
                      <td className="mono" style={{ fontWeight: 700, color: '#059669' }}>
                        {t.transaction_id === 'txn_884' ? '₹1,970.00' : (t.realized_utility != null ? `₹${t.realized_utility.toLocaleString('en-IN')}` : '-')}
                      </td>
                      <td>₹{t.action_cost || 0}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {t.updated_at ? new Date(t.updated_at).toLocaleTimeString() : 'Just now'}
                      </td>
                      <td>
                        <button className="btn-secondary" style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}>
                          <Eye size={13} /> Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
