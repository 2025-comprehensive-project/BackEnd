// src/components/modals/DeleteConfirmModal.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import Modal from '../common/Modal';
import '../../styles/common/DeleteConfirmModal.css';

function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  const footer = (
    <>
      <button className="cancel-btn" onClick={onClose}>취소</button>
      <button className="delete-btn" onClick={onConfirm}>삭제</button>
    </>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title || '삭제 확인'} 
      footer={footer}
      className="delete-confirm-modal"
    >
      <div className="warning-icon">
        <FontAwesomeIcon icon={faExclamationTriangle} />
      </div>
      <p className="confirm-message">{message || '정말 삭제하시겠습니까?'}</p>
      <p className="warning-text">이 작업은 되돌릴 수 없습니다.</p>
    </Modal>
  );
}

export default DeleteConfirmModal;