import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { X, Play, RefreshCw } from 'lucide-react';

interface SimulationModalProps {
  onClose: () => void;
  onSuccess: (txId: string) => void;
}

export const SimulationModal: React.FC<SimulationModalProps> = ({ onClose, onSuccess }) => {
  const [isDemoTxn884, setIsDemoTxn884] = useState(true);
  const [transactionId, setTransactionId] = useState(`txn_sim_${Math.floor(Math.random() * 9000 + 1000)}`);
  const [customerId, setCustomerId] = useState('cust_enterprise_901');
  const [amount, setAmount] = useState(3500);
  const [failureCode, setFailureCode] = useState('insufficient_funds');
  const [ltv, setLtv] = useState(25000);
  const [previousFailures, setPreviousFailures] = useState(4);
  const [isB2B, setIsB2B] = useState(true);
  const [ipCountry, setIpCountry] = useState('IN');
  const [cardCountry, setCardCountry] = useState('UK');
  const [crmNotes, setCrmNotes] = useState('Customer flagged as VIP account. User requested Do Not Disturb (DND) for automated retries.');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (isDemoTxn884) {
        await apiClient.runDemoTxn884();
        onSuccess('txn_884');
      } else {
        await apiClient.simulatePaymentFailure({
          transaction_id: transactionId,
          customer_id: customerId,
          amount: Number(amount),
          failure_code: failureCode,
          ltv: Number(ltv),
          previous_failures: Number(previousFailures),
          is_b2b: isB2B,
          ip_country: ipCountry,
          card_country: cardCountry,
          crm_notes: crmNotes
        });
        await apiClient.evaluateTransaction(transactionId);
        onSuccess(transactionId);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Simulation failed to execute.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Simulate Payment Failure Event
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Ingest a new simulated webhook transaction into the recovery pipeline.
            </p>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.6rem 0.85rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', backgroundColor: '#f1f5f9', padding: '0.3rem', borderRadius: '8px' }}>
            <button
              type="button"
              className={`btn-secondary`}
              style={{ flex: 1, backgroundColor: isDemoTxn884 ? '#ffffff' : 'transparent', border: isDemoTxn884 ? '1px solid var(--border-color)' : 'none', color: isDemoTxn884 ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
              onClick={() => setIsDemoTxn884(true)}
            >
              Benchmark Case (txn_884)
            </button>
            <button
              type="button"
              className={`btn-secondary`}
              style={{ flex: 1, backgroundColor: !isDemoTxn884 ? '#ffffff' : 'transparent', border: !isDemoTxn884 ? '1px solid var(--border-color)' : 'none', color: !isDemoTxn884 ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
              onClick={() => setIsDemoTxn884(false)}
            >
              Custom Simulation
            </button>
          </div>

          {isDemoTxn884 ? (
            <div style={{ backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#3730a3' }}>
              <strong>Pre-configured Frozen Benchmark Case: txn_884</strong>
              <ul style={{ paddingLeft: '1.2rem', marginTop: '0.4rem', lineHeight: '1.5' }}>
                <li>Amount: <strong>₹2,500</strong> | LTV: <strong>₹30,000</strong></li>
                <li>Previous Failures: <strong>4</strong> (Exceeds max automated retry threshold)</li>
                <li>CRM Notes: <em>"VIP account, DND requested"</em></li>
                <li>Expected Policy Result: <strong>Smart_Retry POLICY BLOCKED</strong></li>
                <li>Expected Winning Action: <strong>Escalate</strong> (Max EU = ₹1,970.00)</li>
              </ul>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Transaction ID</label>
                  <input className="header-search" style={{ width: '100%', marginTop: '0.2rem' }} value={transactionId} onChange={(e) => setTransactionId(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Customer ID</label>
                  <input className="header-search" style={{ width: '100%', marginTop: '0.2rem' }} value={customerId} onChange={(e) => setCustomerId(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Amount (₹)</label>
                  <input type="number" className="header-search" style={{ width: '100%', marginTop: '0.2rem' }} value={amount} onChange={(e) => setAmount(Number(e.target.value))} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>LTV (₹)</label>
                  <input type="number" className="header-search" style={{ width: '100%', marginTop: '0.2rem' }} value={ltv} onChange={(e) => setLtv(Number(e.target.value))} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Previous Failures</label>
                  <input type="number" className="header-search" style={{ width: '100%', marginTop: '0.2rem' }} value={previousFailures} onChange={(e) => setPreviousFailures(Number(e.target.value))} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Failure Code</label>
                  <select className="header-search" style={{ width: '100%', marginTop: '0.2rem' }} value={failureCode} onChange={(e) => setFailureCode(e.target.value)}>
                    <option value="insufficient_funds">insufficient_funds</option>
                    <option value="card_expired">card_expired</option>
                    <option value="authentication_failed">authentication_failed</option>
                    <option value="stolen_card">stolen_card</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Card Country</label>
                  <input className="header-search" style={{ width: '100%', marginTop: '0.2rem' }} value={cardCountry} onChange={(e) => setCardCountry(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>IP Country</label>
                  <input className="header-search" style={{ width: '100%', marginTop: '0.2rem' }} value={ipCountry} onChange={(e) => setIpCountry(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Unstructured CRM Notes</label>
                <textarea className="header-search" style={{ width: '100%', marginTop: '0.2rem', height: '60px', borderRadius: '8px' }} value={crmNotes} onChange={(e) => setCrmNotes(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isB2B} onChange={(e) => setIsB2B(e.target.checked)} /> B2B Corporate Account
                </label>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? <RefreshCw size={15} className="spin" /> : <Play size={15} />}
              <span>{submitting ? 'Simulating...' : 'Run Failure Simulation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
