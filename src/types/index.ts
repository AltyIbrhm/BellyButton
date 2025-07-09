export interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  description: string;
  vendor: string;
}

export interface AuditLog {
  id: string;
  invoiceId: string;
  action: string;
  timestamp: string;
  user: string;
  details: string;
}

export interface DashboardStats {
  totalInvoices: number;
  pendingInvoices: number;
  approvedInvoices: number;
  rejectedInvoices: number;
  totalAmount: number;
  pendingAmount: number;
}

export interface InvoiceCardProps {
  invoice: Invoice;
  isSelected: boolean;
  onSelect: (invoice: Invoice) => void;
  onStatusChange: (invoiceId: string, status: Invoice['status']) => void;
}

export interface AuditLogProps {
  log: AuditLog;
  showDetails: boolean;
}

export interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  color?: string;
}

export interface HeaderStatsProps {
  totalInvoices: number;
  totalAmount: number;
  pendingAmount: number;
} 