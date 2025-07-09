import React, { useState } from 'react';
import './App.css';
import { useInvoiceAudit } from './hooks/useInvoiceAudit';
import { calculateDashboardStats } from './utils/helpers';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import InvoiceList from './components/InvoiceList';
import AuditTrail from './components/AuditTrail';
import { Invoice } from './types';

function App() {
  const {
    invoices,
    auditLogs,
    updateInvoiceStatus,
    addInvoice,
    addAuditLog,
    getAuditLogsForInvoice
  } = useInvoiceAudit();

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const stats = calculateDashboardStats(invoices);

  const handleSelectInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleStatusChange = (invoiceId: string, status: Invoice['status']) => {
    updateInvoiceStatus(invoiceId, status);
  };

  return (
    <div className="App">
      <Header 
        totalInvoices={stats.totalInvoices}
        totalAmount={stats.totalAmount}
        pendingAmount={stats.pendingAmount}
      />
      
      <main className="App-main">
        <Dashboard stats={stats} />
        
        <div className="content-grid">
          <InvoiceList
            invoices={invoices}
            selectedInvoice={selectedInvoice}
            onSelectInvoice={handleSelectInvoice}
            onStatusChange={handleStatusChange}
          />
          
          <AuditTrail
            selectedInvoice={selectedInvoice}
            auditLogs={auditLogs}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
