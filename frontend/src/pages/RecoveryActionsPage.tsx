import React from 'react';
import { Zap, Send, CreditCard, PhoneCall, Octagon, ShieldAlert, DollarSign } from 'lucide-react';

export const RecoveryActionsPage: React.FC = () => {
  const actions = [
    {
      name: 'Smart_Retry',
      icon: Zap,
      cost: '₹0.00',
      color: '#3b82f6',
      bgColor: '#eff6ff',
      description: 'Automated background payment gateway retry at optimal network timing windows.',
      scenarios: 'Soft bank network drops, transient issuer timeouts, insufficient funds on standard accounts.',
      policies: 'Blocked if previous_failures >= 4, DND requested by customer, or fraudulent/stolen card.',
      objective: 'Maximize low-cost automated recovery without incurring manual intervention costs.',
      mlInvolvement: 'ML predicts P(recovery) based on failure code and failure history.'
    },
    {
      name: 'Payment_Link',
      icon: Send,
      cost: '₹5.00',
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
      description: 'Dispatches an automated SMS/WhatsApp payment link with alternative payment options.',
      scenarios: 'Authentication failures, 3DS verification drops, customer intent confirmed in CRM notes.',
      policies: 'Blocked if customer requested Do Not Disturb (DND) or stolen card reported.',
      objective: 'Provide friction-free self-serve link for customer to complete payment.',
      mlInvolvement: 'ML evaluates customer responsiveness and channel engagement probability.'
    },
    {
      name: 'Update_Method',
      icon: CreditCard,
      cost: '₹2.00',
      color: '#06b6d4',
      bgColor: '#ecfeff',
      description: 'Triggers a card/UPI method update request to replace expired or revoked payment credentials.',
      scenarios: 'Card expired error codes, revoked UPI mandates, mandate re-registration required.',
      policies: 'Blocked if card is flagged as stolen or fraudulent.',
      objective: 'Secure updated long-term payment mandate to protect ongoing customer LTV.',
      mlInvolvement: 'ML predicts probability of mandate update vs customer churn risk.'
    },
    {
      name: 'Escalate',
      icon: PhoneCall,
      cost: '₹250.00',
      color: '#f59e0b',
      bgColor: '#fffbe6',
      description: 'Assigns a dedicated high-touch Account Manager or Sales Rep outreach task.',
      scenarios: 'VIP accounts, B2B corporate enterprise invoices, high-LTV customers exceeding automated retry thresholds.',
      policies: 'Always policy-eligible for high-value accounts unless explicitly forbidden by regulatory block.',
      objective: 'High-touch personal engagement to save high-LTV enterprise customer relationships.',
      mlInvolvement: 'Evaluated against high intervention cost (₹250) to ensure EU is strictly positive before dispatch.'
    },
    {
      name: 'STOP',
      icon: Octagon,
      cost: '₹0.00',
      color: '#ef4444',
      bgColor: '#fef2f2',
      description: 'Ceases all automated recovery attempts and flags transaction as unrecoverable/terminal.',
      scenarios: 'Stolen card reported, confirmed fraud indicators, zero expected utility across all candidate actions.',
      policies: 'Mandatory policy action when fraud or stolen card rules trigger.',
      objective: 'Prevent wasteful execution expenditure and protect customer experience from harassment.',
      mlInvolvement: 'Default baseline candidate when recovery probability is 0% or costs exceed expected recovery value.'
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Recovery Action Catalog & Policy Constraints
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
          Available recovery actions, direct execution costs, policy guardrails, and Expected Utility optimization parameters.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <div key={act.name} className="card" style={{ borderLeft: `5px solid ${act.color}`, padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: act.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: act.color }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {act.name}
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Execution Cost: <strong style={{ color: act.color }}>{act.cost}</strong>
                    </span>
                  </div>
                </div>

                <span className="badge badge-info" style={{ backgroundColor: act.bgColor, color: act.color, border: `1px solid ${act.color}40` }}>
                  Canonical Action Cost: {act.cost}
                </span>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: '1.5' }}>
                {act.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem', fontSize: '0.82rem' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>Target Failure Scenarios:</strong>
                  <span style={{ color: 'var(--text-secondary)' }}>{act.scenarios}</span>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <strong style={{ color: '#b91c1c', display: 'block', marginBottom: '0.2rem' }}>Policy Guardrail Restrictions:</strong>
                  <span style={{ color: 'var(--text-secondary)' }}>{act.policies}</span>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <strong style={{ color: '#047857', display: 'block', marginBottom: '0.2rem' }}>Financial Objective:</strong>
                  <span style={{ color: 'var(--text-secondary)' }}>{act.objective}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
