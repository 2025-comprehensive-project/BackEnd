// src/components/modals/DeleteModelModal.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import Modal from '../common/Modal';
import '../../styles/common/DeleteConfirmModal.css';

function DeleteModelModal({ isOpen, onClose, onConfirm, modelType, version }) {
  const footer = (
    <>
      <button className="cancel-btn" onClick={onClose}>취소</button>
      <button className="delete-btn" onClick={onConfirm}>삭제</button>
    </>
  );

  const getModelTypeName = () => {
    switch(modelType) {
      case 'base':
        return '베이스 모델';
      case 'lora':
        return 'LoRA 모델';
      default:
        return '모델';
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="모델 삭제 확인" 
      footer={footer}
      className="delete-confirm-modal"
    >
      <div className="warning-icon">
        <FontAwesomeIcon icon={faExclamationTriangle} />
      </div>
      <p className="confirm-message">
        {getModelTypeName()} {version}을(를) 삭제하시겠습니까?
      </p>
      <p className="warning-text">
        이 작업은 되돌릴 수 없으며, 서버에서 모델 파일이 완전히 제거됩니다.
      </p>
    </Modal>
  );
}

export default DeleteModelModal;