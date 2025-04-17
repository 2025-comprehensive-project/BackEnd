import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import './LoginModal.css';
import ForgotPasswordModal from './ForgotPasswordModal';
import { useAuth } from '../contexts/AuthContext';

function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const res = await axios.post(
        'http://ceprj.gachon.ac.kr:60003/api/admin/login',
        { email, password },
        { withCredentials: true }
      );

      console.log('로그인 성공:', res.data);
      login(res.data); // 서버 응답을 AuthContext에 전달
      setEmail('');
      setPassword('');
      setErrorMessage('');
      onClose();
    } catch (err) {
      console.error('로그인 실패:', err.response?.data || err.message);
      setErrorMessage('이메일 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  const openForgotPassword = () => setShowForgotPassword(true);
  const closeForgotPassword = () => setShowForgotPassword(false);

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
                placeholder="비밀번호를 입력하세요"
              />
            </div>
            <div className="form-options">
              <div className="forgot-password" onClick={openForgotPassword}>
                비밀번호를 잊으셨나요?
              </div>
            </div>
            <button type="submit" className="login-submit-btn">
              로그인
            </button>
          </form>
        </div>
      </div>

      {/* 비밀번호 찾기 모달 */}
      <ForgotPasswordModal isOpen={showForgotPassword} onClose={closeForgotPassword} />
    </>
  );
}

export default LoginModal;
