import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faExclamationTriangle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import './LoginModal.css'; // 동일한 스타일 사용

function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' 또는 'error'
  const [foundPassword, setFoundPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 이메일 유효성 검사
    if (!email) {
      setMessage('이메일을 입력해주세요.');
      setMessageType('error');
      return;
    }
    
    // localStorage에서 사용자 정보 확인
    try {
      const storedUserData = JSON.parse(localStorage.getItem('userData'));
      
      if (storedUserData && storedUserData.email === email) {
        // 비밀번호 찾기 성공
        setMessage('비밀번호를 찾았습니다.');
        setMessageType('success');
        setFoundPassword(storedUserData.password);
      } else {
        // 일치하는 이메일이 없음
        setMessage('등록되지 않은 이메일입니다.');
        setMessageType('error');
        setFoundPassword('');
      }
    } catch (error) {
      console.error('비밀번호 찾기 중 오류:', error);
      setMessage('오류가 발생했습니다. 다시 시도해주세요.');
      setMessageType('error');
      setFoundPassword('');
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
          <p>가입한 이메일을 입력하시면 비밀번호를 확인하실 수 있습니다.</p>
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
              placeholder="가입한 이메일을 입력하세요"
            />
          </div>
          
          {foundPassword && (
            <div className="password-result">
              <p>귀하의 비밀번호는:</p>
              <p className="found-password">{foundPassword}</p>
            </div>
          )}
          
          <button type="submit" className="login-submit-btn">
            비밀번호 찾기
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordModal;