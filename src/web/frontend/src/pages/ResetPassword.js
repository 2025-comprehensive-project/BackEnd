// src/pages/ResetPassword.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faExclamationTriangle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { authAPI } from '../services/api';
import '../styles/pages/ResetPassword.css';

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { token } = useParams(); // URL에서 토큰 파라미터 가져오기

  useEffect(() => {
    // 토큰이 없다면 홈으로 리다이렉트
    if (!token) {
      setMessage('유효하지 않은 비밀번호 재설정 링크입니다.');
      setMessageType('error');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 기본 유효성 검사
    if (!newPassword || !confirmPassword) {
      setMessage('모든 필드를 입력해주세요.');
      setMessageType('error');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMessage('비밀번호가 일치하지 않습니다.');
      setMessageType('error');
      return;
    }
    
    // 비밀번호 강도 검사 (선택적)
    if (newPassword.length < 8) {
      setMessage('비밀번호는 최소 8자 이상이어야 합니다.');
      setMessageType('error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 백엔드 API 호출하여 비밀번호 재설정
      // 이메일 파라미터를 제거하고 token과 비밀번호만 전송
      await authAPI.resetPassword(token, newPassword, confirmPassword);
      
      setMessage('비밀번호가 성공적으로 재설정되었습니다. 로그인 페이지로 이동합니다.');
      setMessageType('success');
      setResetSuccess(true);
      
      // 3초 후 로그인 페이지로 리다이렉트
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('비밀번호 재설정 오류:', error);
      
      if (error.response) {
        if (error.response.status === 400) {
          setMessage('토큰이 없거나 무효합니다.');
        } else if (error.response.status === 404) {
          setMessage('존재하지 않는 계정입니다.');
        } else if (error.response.status === 500) {
          setMessage('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          setMessage(error.response.data.message || '비밀번호 재설정 중 오류가 발생했습니다.');
        }
      } else {
        setMessage('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
      }
      
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-box">
        <h2>비밀번호 재설정</h2>
        
        {message && (
          <div className={`message ${messageType === 'success' ? 'success-message' : 'error-message'}`}>
            <FontAwesomeIcon 
              icon={messageType === 'success' ? faCheckCircle : faExclamationTriangle} 
              className="message-icon" 
            />
            <span>{message}</span>
          </div>
        )}
        
        {!resetSuccess && token && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="new-password">
                <FontAwesomeIcon icon={faLock} className="input-icon" />
                새 비밀번호
              </label>
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="새 비밀번호를 입력하세요"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirm-password">
                <FontAwesomeIcon icon={faLock} className="input-icon" />
                비밀번호 확인
              </label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="비밀번호를 다시 입력하세요"
              />
            </div>
            
            <button 
              type="submit" 
              className="reset-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? '처리 중...' : '비밀번호 재설정'}
            </button>
          </form>
        )}
        
        <div className="return-login">
          <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
            로그인 페이지로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;