import { Invoice, AuditLog, DashboardStats } from '../types';

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'approved': return '#10b981';
    case 'rejected': return '#ef4444';
    case 'pending': return '#f59e0b';
    default: return '#6b7280';
  }
};

export const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'approved': return '✅';
    case 'rejected': return '❌';
    case 'pending': return '⏳';
    default: return '📄';
  }
};

export const getActionIcon = (action: string): string => {
  switch (action.toLowerCase()) {
    case 'created': return '📝';
    case 'approved': return '✅';
    case 'rejected': return '❌';
    case 'updated': return '🔄';
    default: return '📋';
  }
};

export const calculateDashboardStats = (invoices: Invoice[]): DashboardStats => {
  const totalInvoices = invoices.length;
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;
  const approvedInvoices = invoices.filter(inv => inv.status === 'approved').length;
  const rejectedInvoices = invoices.filter(inv => inv.status === 'rejected').length;
  
  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const pendingAmount = invoices
    .filter(invoice => invoice.status === 'pending')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  return {
    totalInvoices,
    pendingInvoices,
    approvedInvoices,
    rejectedInvoices,
    totalAmount,
    pendingAmount
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}; 