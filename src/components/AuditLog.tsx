import React from 'react';
import { AuditLogProps } from '../types';
import { getActionIcon, formatTimestamp } from '../utils/helpers';

const AuditLog: React.FC<AuditLogProps> = ({ log, showDetails }) => {
  return (
    <div className="audit-log">
      <div className="log-header">
        <span className="log-icon">{getActionIcon(log.action)}</span>
        <span className="log-action">{log.action}</span>
        <span className="log-timestamp">{formatTimestamp(log.timestamp)}</span>
      </div>
      <div className="log-user">by {log.user}</div>
      {showDetails && (
        <div className="log-details">{log.details}</div>
      )}
    </div>
  );
};

export default AuditLog; 