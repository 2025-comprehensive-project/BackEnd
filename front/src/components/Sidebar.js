// src/components/Sidebar.js
import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUsers, faCocktail, faCog } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../contexts/AuthContext';
import LoginModal from './LoginModal';
import Weather from './Weather'; // 날씨 컴포넌트 임포트
import './Sidebar.css';

function Sidebar() {
  const { isLoggedIn, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // React Router v6에서는 이런 방식으로 활성 링크 스타일을 지정합니다
  const getNavLinkClass = ({ isActive }) => {
    return isActive ? "menu-item active" : "menu-item";
  };

  // 환경 설정 클릭 처리
  const handleSettingsClick = (e) => {
    // 로그인하지 않은 경우
    if (!isLoggedIn) {
      e.preventDefault(); // 기본 동작(페이지 이동) 방지
      // 알림 대신 로그인 모달 표시
      setShowLoginModal(true);
    }
    // 로그인한 경우에는 기본 동작 수행 (페이지 이동)
  };

  // 로그인 처리
  const handleLogin = (user) => {
    const loginSuccess = login(user);
    if (loginSuccess) {
      setShowLoginModal(false);
      // 로그인 성공 시 환경 설정 페이지로 이동
      navigate('/settings');
    } else {
      alert('로그인 실패: 이메일 또는 비밀번호를 확인하세요.');
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-header">
          <h2>관리자 페이지</h2>
        </div>
        
        {/* 메뉴 항목 */}
        <ul className="menu">
          <li key="home">
            <NavLink to="/" className={getNavLinkClass} end>
              <FontAwesomeIcon icon={faHome} className="menu-icon" />
              <span className="menu-text">홈</span>
            </NavLink>
          </li>
          <li key="users">
            <NavLink to="/users" className={getNavLinkClass}>
              <FontAwesomeIcon icon={faUsers} className="menu-icon" />
              <span className="menu-text">유저</span>
            </NavLink>
          </li>
          <li key="cocktails">
            <NavLink to="/cocktails" className={getNavLinkClass}>
              <FontAwesomeIcon icon={faCocktail} className="menu-icon" />
              <span className="menu-text">칵테일</span>
            </NavLink>
          </li>
          <li key="settings">
            <NavLink 
              to="/settings" 
              className={getNavLinkClass} 
              onClick={handleSettingsClick}
            >
              <FontAwesomeIcon icon={faCog} className="menu-icon" />
              <span className="menu-text">환경 설정</span>
            </NavLink>
          </li>
        </ul>
      </div>
      
      {/* 날씨 위젯 - 아래쪽으로 배치 */}
      <div className="sidebar-footer">
        <Weather />
      </div>

      {/* 로그인 모달 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </aside>
  );
}

export default Sidebar;