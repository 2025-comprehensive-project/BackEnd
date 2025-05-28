// src/pages/Settings.js
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/pages/Settings.css';

function Settings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 관리자 정보 수정을 위한 상태 추가
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [infoMessageType, setInfoMessageType] = useState('');
  const [isInfoSubmitting, setIsInfoSubmitting] = useState(false);
  
  const { isLoggedIn, logout, changePassword, userData, updateAdminInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  // 사용자 정보 초기화
  useEffect(() => {
    if (userData) {
      setAdminName(userData.name || '');
      setAdminEmail(userData.email || '');
    }
  }, [userData]);

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

  // 관리자 정보 수정 함수
  const handleUpdateAdminInfo = async () => {
    const updateData = {};
    
    // 변경된 항목만 포함
    if (adminName !== userData.name) {
      updateData.admin_name = adminName;
    }
    
    if (adminEmail !== userData.email) {
      updateData.email = adminEmail;
    }
    
    // 변경사항이 없는 경우
    if (Object.keys(updateData).length === 0) {
      setInfoMessage('변경할 항목이 없습니다.');
      setInfoMessageType('error');
      return;
    }
    
    setIsInfoSubmitting(true);
    
    try {
      await updateAdminInfo(updateData);
      
      setInfoMessage('관리자 정보가 성공적으로 업데이트되었습니다.');
      setInfoMessageType('success');
    } catch (error) {
      console.error('관리자 정보 수정 오류:', error);
      
      if (error.response) {
        if (error.response.status === 400) {
          setInfoMessage('변경할 항목이 없습니다.');
        } else if (error.response.status === 409) {
          setInfoMessage('이미 사용 중인 이메일입니다.');
        } else if (error.response.status === 500) {
          setInfoMessage('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          setInfoMessage(error.response.data.message || '정보 수정 중 오류가 발생했습니다.');
        }
      } else {
        setInfoMessage('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
      }
      
      setInfoMessageType('error');
    } finally {
      setIsInfoSubmitting(false);
    }
  };

  return (
    <div className="settings-container">
      <header className="settings-header">
        <h1>환경 설정</h1>
      </header>

      {/* 관리자 정보 수정 섹션 추가 */}
      <section className="admin-info-section">
        <h2>관리자 정보 수정</h2>
        <div className="form-group">
          <label htmlFor="adminName">관리자 이름</label>
          <input
            type="text"
            id="adminName"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            disabled={isInfoSubmitting}
          />
        </div>
        <div className="form-group">
          <label htmlFor="adminEmail">이메일</label>
          <input
            type="email"
            id="adminEmail"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            disabled={isInfoSubmitting}
          />
        </div>
        <button 
          className="update-info-btn" 
          onClick={handleUpdateAdminInfo}
          disabled={isInfoSubmitting}
        >
          {isInfoSubmitting ? '처리 중...' : '정보 수정'}
        </button>
        {infoMessage && (
          <p className={`message ${infoMessageType === 'success' ? 'success-message' : 'error-message'}`}>
            {infoMessage}
          </p>
        )}
      </section>

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