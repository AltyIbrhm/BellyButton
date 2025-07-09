import { useState, useCallback } from 'react';
import { Invoice, AuditLog } from '../types';

export const useInvoiceAudit = () => {
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

  const addAuditLog = useCallback((invoiceId: string, action: string, details: string) => {
    const newLog: AuditLog = {
      id: Date.now().toString(),
      invoiceId,
      action,
      timestamp: new Date().toISOString(),
      user: 'current.user@company.com',
      details
    };
    setAuditLogs(prev => [...prev, newLog]);
  }, []);

  const updateInvoiceStatus = useCallback((invoiceId: string, newStatus: Invoice['status']) => {
    setInvoices(prev => prev.map(invoice => 
      invoice.id === invoiceId 
        ? { ...invoice, status: newStatus }
        : invoice
    ));
    
    const action = newStatus === 'approved' ? 'approved' : 
                   newStatus === 'rejected' ? 'rejected' : 'updated';
    addAuditLog(invoiceId, action, `Invoice status changed to ${newStatus}`);
  }, [addAuditLog]);

  const addInvoice = useCallback((invoice: Omit<Invoice, 'id'>) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: Date.now().toString()
    };
    setInvoices(prev => [...prev, newInvoice]);
    addAuditLog(newInvoice.id, 'created', `Invoice ${newInvoice.number} created`);
  }, [addAuditLog]);

  const getAuditLogsForInvoice = useCallback((invoiceId: string) => {
    return auditLogs.filter(log => log.invoiceId === invoiceId);
  }, [auditLogs]);

  return {
    invoices,
    auditLogs,
    updateInvoiceStatus,
    addInvoice,
    addAuditLog,
    getAuditLogsForInvoice
  };
}; 