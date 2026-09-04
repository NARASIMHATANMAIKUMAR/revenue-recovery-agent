import React, { useState } from 'react';
import { Search, Bell, Calendar, PlusCircle, Filter, Menu } from 'lucide-react';

interface HeaderProps {
  onOpenSimulateModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSimulateModal, searchQuery, onSearchChange, onToggleMobileMenu }) => {
  const [dateRange] = useState('Aug 1 - Aug 31, 2026');

  return (
    <header className="top-header">
      {/* Left: Mobile Menu Toggle & Global Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {onToggleMobileMenu && (
          <button className="mobile-menu-toggle icon-btn" onClick={onToggleMobileMenu} title="Open Menu">
            <Menu size={20} />
          </button>
        )}

        <div className="header-search">
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search transactions, customers, actions... (Cmd+K)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="header-actions">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          backgroundColor: '#f8fafc',
          padding: '0.4rem 0.75rem',
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          <Calendar size={14} color="var(--text-muted)" />
          <span>{dateRange}</span>
        </div>

        <button className="icon-btn" title="Filters">
          <Filter size={16} />
        </button>

        <button className="icon-btn" title="Notifications" style={{ position: 'relative' }}>
          <Bell size={16} />
          <span style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '7px',
            height: '7px',
            backgroundColor: '#ef4444',
            borderRadius: '50%'
          }} />
        </button>

        <button className="btn-primary" onClick={onOpenSimulateModal}>
          <PlusCircle size={16} />
          <span>Simulate Payment Failure</span>
        </button>
      </div>
    </header>
  );
};
