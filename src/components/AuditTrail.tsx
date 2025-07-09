import React from 'react';
import { Invoice, AuditLog } from '../types';
import AuditLogComponent from './AuditLog';

interface AuditTrailProps {
  selectedInvoice: Invoice | null;
  auditLogs: AuditLog[];
}

const AuditTrail: React.FC<AuditTrailProps> = ({ selectedInvoice, auditLogs }) => {
  const filteredLogs = selectedInvoice 
    ? auditLogs.filter(log => log.invoiceId === selectedInvoice.id)
    : [];

  return (
    <div className="audit-trail">
      <h2>📋 Audit Trail</h2>
      {selectedInvoice ? (
        <div>
          <div className="selected-invoice">
            <h3>Invoice {selectedInvoice.number}</h3>
            <p>Status: {selectedInvoice.status}</p>
          </div>
          <div className="audit-logs">
            {filteredLogs.length > 0 ? (
              filteredLogs.map(log => (
                <AuditLogComponent
                  key={log.id}
                  log={log}
                  showDetails={true}
                />
              ))
            ) : (
              <p>No audit logs found for this invoice.</p>
            )}
          </div>
        </div>
      ) : (
        <p>Select an invoice to view its audit trail</p>
      )}
    </div>
  );
};

export default AuditTrail; 