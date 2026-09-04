import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  ListTodo,
  Zap,
  History,
  CheckCircle2,
  TrendingUp,
  BarChart2,
  Users,
  FileSpreadsheet,
  ShieldCheck,
  Cpu,
  Settings,
  X
} from 'lucide-react';

import { ValtixLogo } from './ValtixLogo';

export type NavRoute =
  | 'dashboard'
  | 'transactions'
  | 'queue'
  | 'actions'
  | 'execution-log'
  | 'verification'
  | 'performance'
  | 'action-insights'
  | 'customer-insights'
  | 'financial-impact'
  | 'policies'
  | 'models'
  | 'audit-trail'
  | 'settings';

interface SidebarProps {
  currentRoute: NavRoute;
  onNavigate: (route: NavRoute) => void;
  isOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, onNavigate, isOpen = false, onCloseMobile }) => {
  const handleItemClick = (route: NavRoute) => {
    onNavigate(route);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="mobile-backdrop"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-header" style={{ padding: '1.25rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <ValtixLogo size={36} showTagline={true} />
          {onCloseMobile && (
            <button className="mobile-close-btn icon-btn" onClick={onCloseMobile} title="Close Menu">
              <X size={18} color="#94a3b8" />
            </button>
          )}
        </div>

        {/* Nav Menu */}
        <div className="sidebar-nav">
          <div className="sidebar-section-title">MAIN</div>
          <button
            className={`sidebar-item ${currentRoute === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleItemClick('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <div className="sidebar-section-title">OPERATIONS</div>
          <button
            className={`sidebar-item ${currentRoute === 'transactions' ? 'active' : ''}`}
            onClick={() => handleItemClick('transactions')}
          >
            <Receipt size={18} />
            <span>Transactions</span>
          </button>

          <button
            className={`sidebar-item ${currentRoute === 'queue' ? 'active' : ''}`}
            onClick={() => handleItemClick('queue')}
          >
            <ListTodo size={18} />
            <span>Recovery Queue</span>
          </button>

          <button
            className={`sidebar-item ${currentRoute === 'actions' ? 'active' : ''}`}
            onClick={() => handleItemClick('actions')}
          >
            <Zap size={18} />
            <span>Recovery Actions</span>
          </button>

          <button
            className={`sidebar-item ${currentRoute === 'execution-log' ? 'active' : ''}`}
            onClick={() => handleItemClick('execution-log')}
          >
            <History size={18} />
            <span>Execution Log</span>
          </button>

          <button
            className={`sidebar-item ${currentRoute === 'verification' ? 'active' : ''}`}
            onClick={() => handleItemClick('verification')}
          >
            <CheckCircle2 size={18} />
            <span>Verification</span>
          </button>

          <div className="sidebar-section-title">ANALYTICS</div>
          <button
            className={`sidebar-item ${currentRoute === 'performance' ? 'active' : ''}`}
            onClick={() => handleItemClick('performance')}
          >
            <TrendingUp size={18} />
            <span>Performance</span>
          </button>

          <button
            className={`sidebar-item ${currentRoute === 'action-insights' ? 'active' : ''}`}
            onClick={() => handleItemClick('action-insights')}
          >
            <BarChart2 size={18} />
            <span>Action Insights</span>
          </button>

          <button
            className={`sidebar-item ${currentRoute === 'customer-insights' ? 'active' : ''}`}
            onClick={() => handleItemClick('customer-insights')}
          >
            <Users size={18} />
            <span>Customer Insights</span>
          </button>

          <button
            className={`sidebar-item ${currentRoute === 'financial-impact' ? 'active' : ''}`}
            onClick={() => handleItemClick('financial-impact')}
          >
            <FileSpreadsheet size={18} />
            <span>Financial Impact</span>
          </button>

          <div className="sidebar-section-title">GOVERNANCE</div>
          <button
            className={`sidebar-item ${currentRoute === 'policies' ? 'active' : ''}`}
            onClick={() => handleItemClick('policies')}
          >
            <ShieldCheck size={18} />
            <span>Policies</span>
          </button>

          <button
            className={`sidebar-item ${currentRoute === 'models' ? 'active' : ''}`}
            onClick={() => handleItemClick('models')}
          >
            <Cpu size={18} />
            <span>Models & ML</span>
          </button>

          <button
            className={`sidebar-item ${currentRoute === 'audit-trail' ? 'active' : ''}`}
            onClick={() => handleItemClick('audit-trail')}
          >
            <History size={18} />
            <span>Audit Trail</span>
          </button>

          <div className="sidebar-section-title">SYSTEM</div>
          <button
            className={`sidebar-item ${currentRoute === 'settings' ? 'active' : ''}`}
            onClick={() => handleItemClick('settings')}
          >
            <Settings size={18} />
            <span>Settings & Simulator</span>
          </button>
        </div>

        {/* User Footer */}
        <div className="sidebar-footer">
          <div className="user-avatar">OP</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              RevOps Operator
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>VALTIX Intelligence Platform</div>
          </div>
        </div>
      </aside>
    </>
  );
};
