import React from 'react';
import { Invoice } from '../types';
import InvoiceCard from './InvoiceCard';

interface InvoiceListProps {
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
  onSelectInvoice: (invoice: Invoice) => void;
  onStatusChange: (invoiceId: string, status: Invoice['status']) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ 
  invoices, 
  selectedInvoice, 
  onSelectInvoice, 
  onStatusChange 
}) => {
  return (
    <div className="invoice-list">
      <h2>📄 Invoices</h2>
      <div className="invoice-grid">
        {invoices.map(invoice => (
          <InvoiceCard
            key={invoice.id}
            invoice={invoice}
            isSelected={selectedInvoice?.id === invoice.id}
            onSelect={onSelectInvoice}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
};

export default InvoiceList; 