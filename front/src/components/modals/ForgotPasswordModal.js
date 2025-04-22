// src/components/modals/ForgotPasswordModal.js
import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faExclamationTriangle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../contexts/AuthContext';
import './LoginModal.css';

function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { forgotPassword } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('이메일을 입력해주세요.');
      setMessageType('error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await forgotPassword(email);
      
      setMessage('비밀번호 재설정 링크를 이메일로 보냈습니다.');
      setMessageType('success');
      setEmail(''); // 입력 필드 초기화
    } catch (error) {
      console.error('비밀번호 찾기 요청 오류:', error);
      
      if (error.response) {
        if (error.response.status === 404) {
          setMessage('존재하지 않는 이메일입니다.');
        } else if (error.response.status === 429) {
          setMessage('이미 요청한 이메일입니다. 잠시 후 다시 시도해주세요.');
        } else if (error.response.status === 500) {
          setMessage('메일 전송 오류가 발생했습니다. 나중에 다시 시도해주세요.');
        } else {
          setMessage(error.response.data.message || '요청 처리 중 오류가 발생했습니다.');
        }
      } else {
        setMessage('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
      }
      
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="login-modal">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <div className="modal-header">
          <h2>비밀번호 찾기</h2>
          <p>가입한 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.</p>
        </div>
        
        {message && (
          <div className={`message-container ${messageType === 'success' ? 'success-message' : 'error-container'}`}>
            <FontAwesomeIcon 
              icon={messageType === 'success' ? faCheckCircle : faExclamationTriangle} 
              className="message-icon" 
            />
            <span>{message}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              이메일
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              placeholder="가입한 이메일을 입력하세요"
            />
          </div>
          
          <button 
            type="submit" 
            className="login-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? '처리 중...' : '비밀번호 찾기'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordModal;