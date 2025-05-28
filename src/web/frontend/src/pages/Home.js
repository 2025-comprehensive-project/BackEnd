// src/pages/Home.js
import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSignOutAlt,
  faClock,
  faUser,
  faCalendarAlt,
  faGlassMartini,
  faUserCheck
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/Home.css';
import { AuthContext } from '../contexts/AuthContext';
import { DataContext } from '../contexts/DataContext';

function Home() {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const { isLoggedIn, userData, logout } = useContext(AuthContext);
  const { 
    users, 
    cocktails, 
    getWeeklyNewUsers,  // 변경: getTodayNewUsers -> getWeeklyNewUsers
    getWeeklyNewCocktails,
    loading,
    refreshData
  } = useContext(DataContext);
  
  const navigate = useNavigate();

  // 시간 업데이트
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);

      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      const dayName = dayNames[now.getDay()];
      setCurrentDate(`${year}년 ${month}월 ${day}일 (${dayName})`);
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  // 데이터 업데이트를 정기적으로 확인
  useEffect(() => {
    // 30초마다 데이터 새로고침
    const refreshInterval = setInterval(() => {
      refreshData();
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [refreshData]);

  const goToUsers = () => {
    navigate('/users');
  };

  const goToCocktails = () => {
    navigate('/cocktails');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <>
      <header className="content-header">
        <h1>대시보드</h1>
        {isLoggedIn && (
          <div className="user-profile">
            <span className="user-name">
              <FontAwesomeIcon icon={faUser} /> {userData?.name || '관리자'}님
            </span>
            <button className="login-btn" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} /> 로그아웃
            </button>
          </div>
        )}
      </header>

      <div className="dashboard-container">
        {/* 요약 정보 섹션 */}
        <section className="summary-grid">
          <div className="summary-card summary-total-users">
            <div className="summary-icon">
              <FontAwesomeIcon icon={faUser} />
            </div>
            <div className="summary-content">
              <h3>총 사용자</h3>
              <p id="total-users">{loading ? '로딩 중...' : users.length}</p>
            </div>
          </div>
          <div className="summary-card summary-total-cocktails">
            <div className="summary-icon">
              <FontAwesomeIcon icon={faGlassMartini} />
            </div>
            <div className="summary-content">
              <h3>총 칵테일</h3>
              <p id="total-cocktails">{loading ? '로딩 중...' : cocktails.length}</p>
            </div>
          </div>
          <div className="summary-card summary-new-users">
            <div className="summary-icon">
              <FontAwesomeIcon icon={faUserCheck} />
            </div>
            <div className="summary-content">
              <h3>신규 유저 (이번 주)</h3>
              <p id="new-users">{loading ? '로딩 중...' : getWeeklyNewUsers()}</p> {/* 변경: getTodayNewUsers -> getWeeklyNewUsers */}
            </div>
          </div>
          <div className="summary-card summary-new-cocktails">
            <div className="summary-icon">
              <FontAwesomeIcon icon={faGlassMartini} />
            </div>
            <div className="summary-content">
              <h3>신규 칵테일 (이번 주)</h3>
              <p id="new-cocktails">{loading ? '로딩 중...' : getWeeklyNewCocktails()}</p>
            </div>
          </div>
        </section>

        {/* 목록 섹션 - 좌우 배치 */}
        <section className="lists">
          {/* 유저 목록 */}
          <div className="list-container">
            <h2>유저 목록</h2>
            <UserTable users={users.slice(0, 5)} loading={loading} />
            <button className="more-btn" onClick={goToUsers}>더 보기</button>
          </div>

          {/* 칵테일 목록 */}
          <div className="list-container">
            <h2>칵테일 목록</h2>
            <CocktailTable cocktails={cocktails.slice(0, 5)} loading={loading} />
            <button className="more-btn" onClick={goToCocktails}>더 보기</button>
          </div>
        </section>

        {/* 하단 시간 표시 */}
        <div className="time-display">
          <div className="time-container">
            <FontAwesomeIcon icon={faClock} />
            <span id="current-time">{currentTime}</span>
          </div>
          <div className="date-container">
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span id="current-date">{currentDate}</span>
          </div>
        </div>
      </div>
    </>
  );
}

// 유저 테이블 컴포넌트 - 로딩 상태 추가
function UserTable({ users, loading }) {
  if (loading) {
    return <div className="loading-table">데이터를 불러오는 중...</div>;
  }
  
  if (!users || users.length === 0) {
    return <div className="empty-table">표시할 유저 정보가 없습니다.</div>;
  }
  
  return (
    <div className="table-responsive">
      <table id="user-table">
        <thead>
          <tr>
            <th>이름</th>
            <th>이메일</th>
            <th>가입일</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.user_id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{new Date(user.registered_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 칵테일 테이블 컴포넌트 - 로딩 상태 추가
function CocktailTable({ cocktails, loading }) {
  if (loading) {
    return <div className="loading-table">데이터를 불러오는 중...</div>;
  }
  
  if (!cocktails || cocktails.length === 0) {
    return <div className="empty-table">표시할 칵테일 정보가 없습니다.</div>;
  }
  
  return (
    <div className="table-responsive">
      <table id="cocktail-table">
        <thead>
          <tr>
            <th>이름</th>
            <th>메서드</th>
            <th>타입</th>
          </tr>
        </thead>
        <tbody>
          {cocktails.map(cocktail => (
            <tr key={cocktail.recipe_id}>
              <td>{cocktail.name}</td>
              <td>{cocktail.method}</td>
              <td>{cocktail.type === 'basic' ? '기본' : '유저'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Home;