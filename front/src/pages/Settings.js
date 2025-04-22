// src/pages/Settings.js
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './Settings.css';

function Settings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoggedIn, logout, changePassword } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const handleChangePassword = async () => {
    // 입력 검증
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setMessage('모든 필드를 입력해주세요.');
      setMessageType('error');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setMessage('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      setMessageType('error');
      return;
    }

    setIsSubmitting(true);

    try {
      // 비밀번호 변경 시도
      await changePassword(currentPassword, newPassword);
      
      setMessage('비밀번호가 성공적으로 변경되었습니다. 3초 후 로그아웃됩니다.');
      setMessageType('success');
      
      // 입력 필드 초기화
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      
      // 3초 후 로그아웃 및 홈으로 이동
      setTimeout(() => {
        logout();
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      
      if (error.response) {
        if (error.response.status === 400) {
          setMessage('비밀번호가 일치하지 않습니다.');
        } else if (error.response.status === 403) {
          setMessage('현재 비밀번호가 올바르지 않습니다.');
        } else if (error.response.status === 404) {
          setMessage('해당하는 관리자가 존재하지 않습니다.');
        } else if (error.response.status === 500) {
          setMessage('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          setMessage(error.response.data.message || '비밀번호 변경 중 오류가 발생했습니다.');
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
    <div className="settings-container">
      <header className="settings-header">
        <h1>환경 설정</h1>
      </header>

      <section className="password-change-section">
        <h2>비밀번호 변경</h2>
        <div className="form-group">
          <label htmlFor="currentPassword">현재 비밀번호</label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">새 비밀번호</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmNewPassword">새 비밀번호 확인</label>
          <input
            type="password"
            id="confirmNewPassword"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <button 
          className="change-password-btn" 
          onClick={handleChangePassword}
          disabled={isSubmitting}
        >
          {isSubmitting ? '처리 중...' : '비밀번호 변경'}
        </button>
        {message && (
          <p className={`message ${messageType === 'success' ? 'success-message' : 'error-message'}`}>
            {message}
          </p>
        )}
      </section>
    </div>
  );
}

export default Settings;