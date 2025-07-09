import React, { useState } from 'react';
import './App.css';

interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  description: string;
  vendor: string;
}

interface AuditLog {
  id: string;
  invoiceId: string;
  action: string;
  timestamp: string;
  user: string;
  details: string;
}

function App() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      number: 'INV-001',
      date: '2024-01-15',
      amount: 1500.00,
      status: 'pending',
      description: 'Office supplies and equipment',
      vendor: 'OfficeMax Inc.'
    },
    {
      id: '2',
      number: 'INV-002',
      date: '2024-01-20',
      amount: 2500.00,
      status: 'approved',
      description: 'Software licensing fees',
      vendor: 'Microsoft Corp.'
    },
    {
      id: '3',
      number: 'INV-003',
      date: '2024-01-25',
      amount: 800.00,
      status: 'rejected',
      description: 'Marketing materials',
      vendor: 'PrintPro Services'
    }
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: '1',
      invoiceId: '1',
      action: 'created',
      timestamp: '2024-01-15T10:30:00Z',
      user: 'john.doe@company.com',
      details: 'Invoice created for office supplies'
    },
    {
      id: '2',
      invoiceId: '2',
      action: 'approved',
      timestamp: '2024-01-21T14:15:00Z',
      user: 'jane.smith@company.com',
      details: 'Software licensing approved by finance team'
    },
    {
      id: '3',
      invoiceId: '3',
      action: 'rejected',
      timestamp: '2024-01-26T09:45:00Z',
      user: 'mike.johnson@company.com',
      details: 'Marketing materials rejected - budget exceeded'
    }
  ]);

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);

  const addAuditLog = (invoiceId: string, action: string, details: string) => {
    const newLog: AuditLog = {
      id: Date.now().toString(),
      invoiceId,
      action,
      timestamp: new Date().toISOString(),
      user: 'current.user@company.com',
      details
    };
    setAuditLogs([...auditLogs, newLog]);
  };

  const updateInvoiceStatus = (invoiceId: string, newStatus: Invoice['status']) => {
    setInvoices(invoices.map(invoice => 
      invoice.id === invoiceId 
        ? { ...invoice, status: newStatus }
        : invoice
    ));
    
    const action = newStatus === 'approved' ? 'approved' : 
                   newStatus === 'rejected' ? 'rejected' : 'updated';
    addAuditLog(invoiceId, action, `Invoice status changed to ${newStatus}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'pending': return '⏳';
      default: return '📄';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'created': return '📝';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'updated': return '🔄';
      default: return '📋';
    }
  };

  const filteredAuditLogs = selectedInvoice 
    ? auditLogs.filter(log => log.invoiceId === selectedInvoice.id)
    : auditLogs;

  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const pendingAmount = invoices
    .filter(invoice => invoice.status === 'pending')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>📋 Invoice Audit System</h1>
          <p>Manage and audit your invoices with full transparency</p>
          <div className="header-stats">
            <span className="header-stat">
              <strong>{invoices.length}</strong> Invoices
            </span>
            <span className="header-stat">
              <strong>${totalAmount.toLocaleString()}</strong> Total
            </span>
            <span className="header-stat">
              <strong>${pendingAmount.toLocaleString()}</strong> Pending
            </span>
          </div>
        </div>
      </header>

      <main className="App-main">
        <div className="dashboard">
          <div className="stats">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <h3>Total Invoices</h3>
              <p>{invoices.length}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <h3>Pending</h3>
              <p>{invoices.filter(inv => inv.status === 'pending').length}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <h3>Approved</h3>
              <p>{invoices.filter(inv => inv.status === 'approved').length}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">❌</div>
              <h3>Rejected</h3>
              <p>{invoices.filter(inv => inv.status === 'rejected').length}</p>
            </div>
          </div>

          <div className="content">
            <div className="invoices-section">
              <div className="section-header">
                <h2>📄 Invoices</h2>
                <div className="section-actions">
                  <button className="action-btn">
                    <span>➕</span> Add Invoice
                  </button>
                </div>
              </div>
              <div className="invoices-grid">
                {invoices.map(invoice => (
                  <div 
                    key={invoice.id} 
                    className={`invoice-card ${selectedInvoice?.id === invoice.id ? 'selected' : ''}`}
                    onClick={() => setSelectedInvoice(invoice)}
                  >
                    <div className="invoice-header">
                      <span className="invoice-number">{invoice.number}</span>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(invoice.status) }}
                      >
                        {getStatusIcon(invoice.status)} {invoice.status}
                      </span>
                    </div>
                    <div className="invoice-details">
                      <p><strong>Vendor:</strong> {invoice.vendor}</p>
                      <p><strong>Amount:</strong> ${invoice.amount.toLocaleString()}</p>
                      <p><strong>Date:</strong> {invoice.date}</p>
                      <p><strong>Description:</strong> {invoice.description}</p>
                    </div>
                    <div className="invoice-actions">
                      {invoice.status === 'pending' && (
                        <>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              updateInvoiceStatus(invoice.id, 'approved');
                            }}
                            className="approve-btn"
                          >
                            ✅ Approve
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              updateInvoiceStatus(invoice.id, 'rejected');
                            }}
                            className="reject-btn"
                          >
                            ❌ Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="audit-section">
              <div className="section-header">
                <h2>📊 Audit Trail</h2>
                <div className="section-actions">
                  <button 
                    onClick={() => setShowAuditModal(!showAuditModal)}
                    className="toggle-btn"
                  >
                    {showAuditModal ? '👁️ Hide Details' : '👁️ Show Details'}
                  </button>
                </div>
              </div>
              
              <div className="audit-logs">
                {filteredAuditLogs.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <p>No audit logs found</p>
                    <small>Select an invoice to view its audit trail</small>
                  </div>
                ) : (
                  filteredAuditLogs.map(log => (
                    <div key={log.id} className="audit-log">
                      <div className="log-header">
                        <div className="log-action-group">
                          <span className="log-action-icon">
                            {getActionIcon(log.action)}
                          </span>
                          <span className="log-action">{log.action.toUpperCase()}</span>
                        </div>
                        <span className="log-timestamp">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="log-details">
                        <p><strong>User:</strong> {log.user}</p>
                        {showAuditModal && (
                          <p><strong>Details:</strong> {log.details}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
