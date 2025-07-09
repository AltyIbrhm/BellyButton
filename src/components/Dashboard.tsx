import React from 'react';
import { DashboardStats } from '../types';
import StatsCard from './StatsCard';

interface DashboardProps {
  stats: DashboardStats;
}

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  return (
    <div className="stats">
      <StatsCard
        title="Total Invoices"
        value={stats.totalInvoices}
        icon="📊"
      />
      <StatsCard
        title="Pending"
        value={stats.pendingInvoices}
        icon="⏳"
      />
      <StatsCard
        title="Approved"
        value={stats.approvedInvoices}
        icon="✅"
      />
      <StatsCard
        title="Rejected"
        value={stats.rejectedInvoices}
        icon="❌"
      />
    </div>
  );
};

export default Dashboard; 