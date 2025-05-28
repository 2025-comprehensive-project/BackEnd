// src/components/common/StatusMessage.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExclamationTriangle, 
  faCheckCircle,
  faSpinner,
  faInfoCircle,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/common/StatusMessage.css';

function StatusMessage({ type = 'info', message, className = '', onClose }) {
  if (!message) return null;
  
  let icon, messageClass;
  
  switch(type) {
    case 'error':
      icon = faExclamationTriangle;
      messageClass = 'error-message';
      break;
    case 'success':
      icon = faCheckCircle;
      messageClass = 'success-message';
      break;
    case 'loading':
      icon = faSpinner;
      messageClass = 'loading-message';
      break;
    default:
      icon = faInfoCircle;
      messageClass = 'info-message';
  }
  
  return (
    <div className={`status-message ${messageClass} ${className}`}>
      <div className="message-content">
        {icon && <FontAwesomeIcon icon={icon} spin={type === 'loading'} className="message-icon" />}
        <span>{message}</span>
      </div>
      {onClose && (
        <button className="close-message-btn" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      )}
    </div>
  );
}

export const ErrorMessage = ({ message, className, onClose }) => (
  <StatusMessage type="error" message={message} className={className} onClose={onClose} />
);

export const SuccessMessage = ({ message, className, onClose }) => (
  <StatusMessage type="success" message={message} className={className} onClose={onClose} />
);

export const LoadingMessage = ({ message = '데이터를 불러오는 중...', className }) => (
  <StatusMessage type="loading" message={message} className={className} />
);

export const InfoMessage = ({ message, className, onClose }) => (
  <StatusMessage type="info" message={message} className={className} onClose={onClose} />
);

export default StatusMessage;