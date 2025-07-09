import React from 'react';
import { InvoiceCardProps } from '../types';
import { getStatusColor, getStatusIcon, formatCurrency, formatDate } from '../utils/helpers';

const InvoiceCard: React.FC<InvoiceCardProps> = ({ 
  invoice, 
  isSelected, 
  onSelect, 
  onStatusChange 
}) => {
  const handleStatusChange = (e: React.MouseEvent, newStatus: 'approved' | 'rejected') => {
    e.stopPropagation();
    onStatusChange(invoice.id, newStatus);
  };

  return (
    <div 
      className={`invoice-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(invoice)}
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
        <p><strong>Amount:</strong> {formatCurrency(invoice.amount)}</p>
        <p><strong>Date:</strong> {formatDate(invoice.date)}</p>
        <p><strong>Description:</strong> {invoice.description}</p>
      </div>
      <div className="invoice-actions">
        {invoice.status === 'pending' && (
          <>
            <button 
              onClick={(e) => handleStatusChange(e, 'approved')}
              className="approve-btn"
            >
              ✅ Approve
            </button>
            <button 
              onClick={(e) => handleStatusChange(e, 'rejected')}
              className="reject-btn"
            >
              ❌ Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default InvoiceCard; 