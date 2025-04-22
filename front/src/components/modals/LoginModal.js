// src/components/modals/LoginModal.js
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import './LoginModal.css';
import ForgotPasswordModal from './ForgotPasswordModal';

function LoginModal({ isOpen, onClose, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 기본 유효성 검사
    if (!email || !password) {
      setErrorMessage('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 로그인 시도
      await onLogin({ email, password });
      
      // 로그인 성공 시 입력값 초기화
      setEmail('');
      setPassword('');
      setErrorMessage('');
      onClose();
    } catch (error) {
      console.error("로그인 오류:", error);
      
      // 서버 응답에 따른 오류 메시지 표시
      if (error.response) {
        if (error.response.status === 401) {
          setErrorMessage('이메일 혹은 비밀번호가 틀립니다.');
        } else if (error.response.status === 500) {
          setErrorMessage('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          // 기타 오류는 서버에서 보낸 메시지 표시
          setErrorMessage(error.response.data.message || '로그인 중 오류가 발생했습니다.');
        }
      } else if (error.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우
        setErrorMessage('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
      } else {
        // 요청 설정 중 오류가 발생한 경우
        setErrorMessage('로그인 요청 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay">
        <div className="login-modal">
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
          <div className="modal-header">
            <h2>로그인</h2>
            <p>관리자 계정으로 로그인하세요.</p>
          </div>
          {errorMessage && (
            <div className="error-container">
              <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
              <span>{errorMessage}</span>
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
                placeholder="등록된 이메일을 입력하세요"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">
                <FontAwesomeIcon icon={faLock} className="input-icon" />
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="비밀번호를 입력하세요"
              />
            </div>
            <div className="form-options">
              <div className="forgot-password" onClick={openForgotPassword}>
                비밀번호를 잊으셨나요?
              </div>
            </div>
            <button 
              type="submit" 
              className="login-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>
      </div>

      {/* 비밀번호 찾기 모달 */}
      <ForgotPasswordModal 
        isOpen={showForgotPassword} 
        onClose={closeForgotPassword} 
      />
    </>
  );
}

export default LoginModal;