import React from 'react';
import { HeaderStatsProps } from '../types';
import { formatCurrency } from '../utils/helpers';

const Header: React.FC<HeaderStatsProps> = ({ totalInvoices, totalAmount, pendingAmount }) => {
  return (
    <header className="App-header">
      <div className="header-content">
        <h1>📋 Invoice Audit System</h1>
        <p>Manage and audit your invoices with full transparency</p>
        <div className="header-stats">
          <span className="header-stat">
            <strong>{totalInvoices}</strong> Invoices
          </span>
          <span className="header-stat">
            <strong>{formatCurrency(totalAmount)}</strong> Total
          </span>
          <span className="header-stat">
            <strong>{formatCurrency(pendingAmount)}</strong> Pending
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header; 