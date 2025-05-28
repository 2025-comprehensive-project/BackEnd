// src/components/layout/Sidebar.js
import React, { useContext, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faUsers, 
  faCocktail, 
  faCog, 
  faDatabase,
  faRobot // AI 아이콘 추가
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../contexts/AuthContext';
import LoginModal from '../modals/LoginModal';
import Weather from './Weather';
import '../../styles/layout/Sidebar.css';

function Sidebar() {
  const { isLoggedIn, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 환경 설정 클릭 처리
  const handleSettingsClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setShowLoginModal(true);
    }
  };

  // 로그인 처리
  const handleLogin = async (user) => {
    try {
      await login(user);
      setShowLoginModal(false);
      navigate('/settings');
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-header">
          <NavLink to="/" className="brand-link">
            <h3>FLAPPER MOONSHINE</h3>
            <h2>관리자 페이지</h2>
          </NavLink>
        </div>
        <ul className="menu">
          <li className={location.pathname === '/' ? 'active' : ''}>
            <NavLink to="/" className="menu-item">
              <FontAwesomeIcon icon={faHome} className="menu-icon" />
              <span className="menu-text">홈</span>
            </NavLink>
          </li>
          <li className={location.pathname.startsWith('/users') ? 'active' : ''}>
            <NavLink to="/users" className="menu-item">
              <FontAwesomeIcon icon={faUsers} className="menu-icon" />
              <span className="menu-text">유저 관리</span>
            </NavLink>
          </li>
          <li className={location.pathname === '/cocktails' ? 'active' : ''}>
            <NavLink to="/cocktails" className="menu-item">
              <FontAwesomeIcon icon={faCocktail} className="menu-icon" />
              <span className="menu-text">칵테일 레시피 관리</span>
            </NavLink>
          </li>
          <li className={location.pathname === '/metadata' ? 'active' : ''}>
            <NavLink to="/metadata" className="menu-item">
              <FontAwesomeIcon icon={faDatabase} className="menu-icon" />
              <span className="menu-text">메타데이터 관리</span>
            </NavLink>
          </li>
          {/* AI 관리 메뉴 추가 */}
          <li className={location.pathname === '/ai' ? 'active' : ''}>
            <NavLink to="/ai" className="menu-item">
              <FontAwesomeIcon icon={faRobot} className="menu-icon" />
              <span className="menu-text">AI 관리</span>
            </NavLink>
          </li>
          <li className={location.pathname === '/settings' ? 'active' : ''}>
            <NavLink 
              to="/settings" 
              className="menu-item" 
              onClick={handleSettingsClick}
            >
              <FontAwesomeIcon icon={faCog} className="menu-icon" />
              <span className="menu-text">환경설정</span>
            </NavLink>
          </li>
        </ul>
      </div>
      
      <div className="sidebar-footer">
        <Weather />
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </aside>
  );
}

export default Sidebar;