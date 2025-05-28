// src/components/common/Modal.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import '../../styles/common/Modal.css';

function Modal({ isOpen, onClose, title, children, footer, className = '' }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className={`modal-container ${className}`}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="modal-content">
          {children}
        </div>
        
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;