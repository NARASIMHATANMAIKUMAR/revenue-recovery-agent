import React, { useState, useEffect } from 'react';
import { Sidebar, NavRoute } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { TransactionsPage } from './pages/TransactionsPage';
import { RecoveryQueuePage } from './pages/RecoveryQueuePage';
import { RecoveryActionsPage } from './pages/RecoveryActionsPage';
import { ExecutionLogPage } from './pages/ExecutionLogPage';
import { VerificationPage } from './pages/VerificationPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { ModelsPage } from './pages/ModelsPage';
import { AnalyticsPages } from './pages/AnalyticsPages';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { SimulationModal } from './components/SimulationModal';
import { ToastContainer, ToastMessage } from './components/ToastContainer';
import { ObservabilityMetrics, TransactionRecord } from './types';
import { apiClient } from './api/client';

const ROUTE_TITLES: Record<NavRoute, string> = {
  dashboard: 'Dashboard | VALTIX',
  transactions: 'Payment Operations | VALTIX',
  queue: 'Recovery Queue | VALTIX',
  actions: 'Recovery Actions | VALTIX',
  'execution-log': 'Execution Log | VALTIX',
  verification: 'Outcome Verification | VALTIX',
  performance: 'Performance Analytics | VALTIX',
  'action-insights': 'Action Insights | VALTIX',
  'customer-insights': 'Customer Insights | VALTIX',
  'financial-impact': 'Financial Impact | VALTIX',
  policies: 'Policies & Governance | VALTIX',
  models: 'Models & ML | VALTIX',
  'audit-trail': 'Audit Trail | VALTIX',
  settings: 'Settings & Simulator | VALTIX',
};

const VALID_ROUTES: NavRoute[] = [
  'dashboard', 'transactions', 'queue', 'actions', 'execution-log',
  'verification', 'performance', 'action-insights', 'customer-insights',
  'financial-impact', 'policies', 'models', 'audit-trail', 'settings'
];

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<NavRoute>('dashboard');
  const [metrics, setMetrics] = useState<ObservabilityMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshMetrics = async () => {
    try {
      const data = await apiClient.getMetrics();
      setMetrics(data);
      return data;
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
      addToast('error', 'Network Error', 'Failed to connect to VALTIX backend engine.');
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    refreshMetrics();
  }, []);

  useEffect(() => {
    document.title = ROUTE_TITLES[currentRoute] || 'VALTIX — Value-Aware Revenue Recovery Intelligence';
  }, [currentRoute]);

  const handleNavigate = (route: NavRoute) => {
    setCurrentRoute(route);
    setIsMobileMenuOpen(false);
    if (route === 'dashboard') {
      refreshMetrics();
    }
  };

  const handleOpenTransaction = (tx: TransactionRecord) => {
    setSelectedTx(tx);
  };

  const handleSimulateSuccess = async (txId: string) => {
    try {
      const detail = await apiClient.getTransactionDetail(txId);
      setSelectedTx(detail);
      refreshMetrics();
      addToast('success', 'Simulation Triggered', `Payment failure simulated for ${txId}`);
    } catch (err) {
      console.error('Error fetching simulated transaction:', err);
      addToast('error', 'Simulation Failed', 'Could not retrieve simulated transaction detail.');
    }
  };

  const isUnknownRoute = !VALID_ROUTES.includes(currentRoute);

  return (
    <div className="app-layout">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Persistent Sidebar & Mobile Navigation Drawer */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        isOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Wrapper Area */}
      <div className="main-wrapper">
        {/* Top Header */}
        <Header
          onOpenSimulateModal={() => setShowSimulateModal(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Content View Routing */}
        <main className="content-area">
          {isUnknownRoute && <NotFoundPage onNavigate={handleNavigate} />}

          {!isUnknownRoute && currentRoute === 'dashboard' && (
            <Dashboard
              metrics={metrics}
              loading={loadingMetrics}
              onRefreshMetrics={refreshMetrics}
              onNavigate={handleNavigate}
              onSelectTransaction={handleOpenTransaction}
            />
          )}

          {!isUnknownRoute && currentRoute === 'transactions' && (
            <TransactionsPage
              onSelectTransaction={handleOpenTransaction}
              searchQuery={searchQuery}
            />
          )}

          {!isUnknownRoute && currentRoute === 'queue' && (
            <RecoveryQueuePage onSelectTransaction={handleOpenTransaction} />
          )}

          {!isUnknownRoute && currentRoute === 'actions' && <RecoveryActionsPage />}

          {!isUnknownRoute && currentRoute === 'execution-log' && (
            <ExecutionLogPage onSelectTransaction={handleOpenTransaction} />
          )}

          {!isUnknownRoute && currentRoute === 'verification' && (
            <VerificationPage onSelectTransaction={handleOpenTransaction} />
          )}

          {!isUnknownRoute && currentRoute === 'performance' && (
            <AnalyticsPages metrics={metrics} type="performance" />
          )}

          {!isUnknownRoute && currentRoute === 'action-insights' && (
            <AnalyticsPages metrics={metrics} type="action-insights" />
          )}

          {!isUnknownRoute && currentRoute === 'customer-insights' && (
            <AnalyticsPages metrics={metrics} type="customer-insights" />
          )}

          {!isUnknownRoute && currentRoute === 'financial-impact' && (
            <AnalyticsPages metrics={metrics} type="financial-impact" />
          )}

          {!isUnknownRoute && currentRoute === 'policies' && <PoliciesPage />}

          {!isUnknownRoute && currentRoute === 'models' && <ModelsPage />}

          {!isUnknownRoute && currentRoute === 'audit-trail' && (
            <AuditTrailPage onSelectTransaction={handleOpenTransaction} />
          )}

          {!isUnknownRoute && currentRoute === 'settings' && (
            <SettingsPage
              onRefreshMetrics={refreshMetrics}
              onOpenSimulateModal={() => setShowSimulateModal(true)}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {selectedTx && (
        <TransactionDetailModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onRefresh={() => {
            refreshMetrics();
          }}
        />
      )}

      {showSimulateModal && (
        <SimulationModal
          onClose={() => setShowSimulateModal(false)}
          onSuccess={handleSimulateSuccess}
        />
      )}
    </div>
  );
};

export default App;

