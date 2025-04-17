import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './Settings.css';

function Settings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' 또는 'error'
  const { isLoggedIn, logout, changePassword } = useContext(AuthContext);
  const navigate = useNavigate();

  // 로그인 상태 확인
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const handleChangePassword = () => {
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

    // 비밀번호 변경 시도
    const passwordChanged = changePassword(currentPassword, newPassword);

    if (passwordChanged) {
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
    } else {
      setMessage('현재 비밀번호가 일치하지 않습니다.');
      setMessageType('error');
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
          />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">새 비밀번호</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmNewPassword">새 비밀번호 확인</label>
          <input
            type="password"
            id="confirmNewPassword"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
        </div>
        <button className="change-password-btn" onClick={handleChangePassword}>
          비밀번호 변경
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