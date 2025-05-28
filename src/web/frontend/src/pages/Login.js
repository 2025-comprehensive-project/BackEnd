  // src/pages/Login.js
  import React, { useState, useContext, useEffect } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
  import { 
    faEnvelope, 
    faLock, 
    faExclamationTriangle,
    faGlassMartini
  } from '@fortawesome/free-solid-svg-icons';
  import { AuthContext } from '../contexts/AuthContext';
  import ForgotPasswordModal from '../components/modals/ForgotPasswordModal';
  import '../styles/pages/Login.css';

  function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const { isLoggedIn, login } = useContext(AuthContext);
    const navigate = useNavigate();
    
    // 이미 로그인 되어 있으면 홈으로 리다이렉트
    useEffect(() => {
      if (isLoggedIn) {
        navigate('/');
      }
      
      // 저장된 이메일 불러오기
      const savedEmail = localStorage.getItem('rememberedEmail');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }, [isLoggedIn, navigate]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // 기본 유효성 검사
      if (!email || !password) {
        setErrorMessage('이메일과 비밀번호를 모두 입력해주세요.');
        return;
      }
      
      // 이메일 저장 처리
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      setIsSubmitting(true);
      
      try {
        // 로그인 시도
        await login({ email, password });
        // 로그인 성공 시 홈으로 리다이렉트 (useEffect에서 처리)
      } catch (error) {
        console.error("로그인 오류:", error);
        
        // 서버 응답에 따른 오류 메시지 표시
        if (error.response) {
          if (error.response.status === 401) {
            setErrorMessage('이메일 혹은 비밀번호가 틀립니다.');
          } else if (error.response.status === 500) {
            setErrorMessage('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
          } else {
            setErrorMessage(error.response.data.message || '로그인 중 오류가 발생했습니다.');
          }
        } else if (error.request) {
          setErrorMessage('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
        } else {
          setErrorMessage('로그인 요청 중 오류가 발생했습니다.');
        }
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="login-page">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="login-container">
          {/* 브랜드 로고 섹션 */}
          <div className="brand-logo">
            <FontAwesomeIcon icon={faGlassMartini} className="logo-icon" />
            <h1>FLAPPER MOONSHINE</h1>
            <p>관리자 대시보드</p>
          </div>
          
          <div className="login-header">
            <h1>관리자 로그인</h1>
            <p>계속하려면 로그인하세요</p>
          </div>
          
          {errorMessage && (
            <div className="error-container">
              <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
              <span>{errorMessage}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="login-form">
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
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me">아이디 기억하기</label>
              </div>
              
              <div className="forgot-password" onClick={() => setShowForgotPassword(true)}>
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
          
          {/* 하단 정보 */}
          <div className="login-footer">
            <div className="version">버전 1.0.0</div>
            <div className="copyright">© 2025 FLAPPER MOONSHINE. All rights reserved.</div>
          </div>
        </div>
        
        {/* 비밀번호 찾기 모달 */}
        <ForgotPasswordModal 
          isOpen={showForgotPassword} 
          onClose={() => setShowForgotPassword(false)} 
        />
      </div>
    );
  }

  export default Login;