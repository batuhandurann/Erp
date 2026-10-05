import React, { useState } from 'react';
import { AppProvider, useApp, AppView } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

// Views
import { LoginView } from './components/auth/LoginView';
import { DashboardView } from './components/dashboard/DashboardView';
import { QuoteListView } from './components/quotes/QuoteListView';
import { ProformaListView } from './components/proformas/ProformaListView';
import { ContractListView } from './components/contracts/ContractListView';
import { SaleListView } from './components/sales/SaleListView';
import { ProductTrackerView } from './components/inventory/ProductTrackerView';
import { ProductCatalogView } from './components/products/ProductCatalogView';
import { CustomerListView } from './components/customers/CustomerListView';
import { FinanceView } from './components/finance/FinanceView';
import { ReportsView } from './components/reports/ReportsView';
import { UsersView } from './components/users/UsersView';
import { SettingsView } from './components/settings/SettingsView';
import { AuditLogView } from './components/audit/AuditLogView';

// Modals
import { QuoteCreateModal } from './components/quotes/QuoteCreateModal';
import { QuoteDetailModal } from './components/quotes/QuoteDetailModal';
import { ProformaDetailModal } from './components/proformas/ProformaDetailModal';
import { ContractDetailModal } from './components/contracts/ContractDetailModal';
import { SaleDetailModal } from './components/sales/SaleDetailModal';
import { ProductSerialDetailModal } from './components/inventory/ProductSerialDetailModal';
import { CustomerDetailModal } from './components/customers/CustomerDetailModal';
import { DocumentViewerModal } from './components/common/DocumentViewerModal';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

const AppContent: React.FC = () => {
  const { activeView, setActiveView, isAuthenticated } = useApp();

  // If user is not authenticated, render dedicated corporate Login Panel
  if (!isAuthenticated) {
    return <LoginView />;
  }

  // Modal states
  const [isQuoteCreateOpen, setIsQuoteCreateOpen] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [selectedProformaId, setSelectedProformaId] = useState<string | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [selectedSerialId, setSelectedSerialId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Global Search entity selector handler
  const handleSelectSearchEntity = (type: string, id: string) => {
    switch (type) {
      case 'quote':
        setSelectedQuoteId(id);
        break;
      case 'proforma':
        setSelectedProformaId(id);
        break;
      case 'contract':
        setSelectedContractId(id);
        break;
      case 'sale':
        setSelectedSaleId(id);
        break;
      case 'serial':
        setSelectedSerialId(id);
        break;
      case 'customer':
        setSelectedCustomerId(id);
        break;
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardView
            onOpenNewQuote={() => setIsQuoteCreateOpen(true)}
            onOpenQuoteDetail={id => setSelectedQuoteId(id)}
            onOpenProformaDetail={id => setSelectedProformaId(id)}
            onOpenContractDetail={id => setSelectedContractId(id)}
            onOpenSerialDetail={id => setSelectedSerialId(id)}
          />
        );
      case 'quotes':
        return (
          <QuoteListView
            onOpenCreateModal={() => setIsQuoteCreateOpen(true)}
            onOpenDetailModal={id => setSelectedQuoteId(id)}
            onOpenProformaDetail={id => setSelectedProformaId(id)}
          />
        );
      case 'proformas':
        return (
          <ProformaListView
            onOpenDetailModal={id => setSelectedProformaId(id)}
          />
        );
      case 'contracts':
        return (
          <ContractListView
            onOpenDetailModal={id => setSelectedContractId(id)}
          />
        );
      case 'sales':
        return (
          <SaleListView
            onOpenDetailModal={id => setSelectedSaleId(id)}
          />
        );
      case 'inventory':
        return (
          <ProductTrackerView
            onOpenSerialDetail={id => setSelectedSerialId(id)}
          />
        );
      case 'products':
        return <ProductCatalogView />;
      case 'customers':
        return (
          <CustomerListView
            onOpenDetailModal={id => setSelectedCustomerId(id)}
          />
        );
      case 'finance':
        return <FinanceView />;
      case 'reports':
        return <ReportsView />;
      case 'users':
        return <UsersView />;
      case 'settings':
        return <SettingsView />;
      case 'audit':
        return <AuditLogView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header onOpenNewQuoteModal={() => setIsQuoteCreateOpen(true)} />

        {/* Dynamic Viewport */}
        <main className="flex-1 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <QuoteCreateModal
        isOpen={isQuoteCreateOpen}
        onClose={() => setIsQuoteCreateOpen(false)}
        onCreated={quoteId => {
          setSelectedQuoteId(quoteId);
          setActiveView('quotes');
        }}
      />

      <QuoteDetailModal
        quoteId={selectedQuoteId}
        onClose={() => setSelectedQuoteId(null)}
        onOpenProforma={proformaId => {
          setSelectedProformaId(proformaId);
          setActiveView('proformas');
        }}
        onOpenContract={contractId => {
          setSelectedContractId(contractId);
          setActiveView('contracts');
        }}
      />

      <ProformaDetailModal
        proformaId={selectedProformaId}
        onClose={() => setSelectedProformaId(null)}
        onOpenContract={contractId => {
          setSelectedContractId(contractId);
          setActiveView('contracts');
        }}
        onOpenSale={saleId => {
          setSelectedSaleId(saleId);
          setActiveView('sales');
        }}
      />

      <ContractDetailModal
        contractId={selectedContractId}
        onClose={() => setSelectedContractId(null)}
        onOpenSale={saleId => {
          setSelectedSaleId(saleId);
          setActiveView('sales');
        }}
      />

      <SaleDetailModal
        saleId={selectedSaleId}
        onClose={() => setSelectedSaleId(null)}
        onOpenSerial={serialId => {
          setSelectedSerialId(serialId);
          setActiveView('inventory');
        }}
      />

      <ProductSerialDetailModal
        serialId={selectedSerialId}
        onClose={() => setSelectedSerialId(null)}
        onOpenCustomer={customerId => {
          setSelectedCustomerId(customerId);
          setActiveView('customers');
        }}
        onOpenSale={saleId => {
          setSelectedSaleId(saleId);
          setActiveView('sales');
        }}
      />

      <CustomerDetailModal
        customerId={selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
        onOpenQuote={quoteId => {
          setSelectedQuoteId(quoteId);
          setActiveView('quotes');
        }}
        onOpenProforma={proformaId => {
          setSelectedProformaId(proformaId);
          setActiveView('proformas');
        }}
        onOpenContract={contractId => {
          setSelectedContractId(contractId);
          setActiveView('contracts');
        }}
        onOpenSerial={serialId => {
          setSelectedSerialId(serialId);
          setActiveView('inventory');
        }}
      />

      <DocumentViewerModal />

      <GlobalSearchModal onSelectEntity={handleSelectSearchEntity} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
