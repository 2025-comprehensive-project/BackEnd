import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faSignOutAlt, faClock, faUser } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';
import './Home.css';
import { AuthContext } from '../contexts/AuthContext';
import { DataContext } from '../contexts/DataContext'; // DataContext 추가

function Home() {
  const [currentTime, setCurrentTime] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isLoggedIn, userData, login, logout } = useContext(AuthContext);
  const { users, cocktails, getTodayNewUsers, getWeeklyNewCocktails } = useContext(DataContext); // DataContext 값 가져오기
  const navigate = useNavigate();

  // 디버깅용 - 로그인 상태 확인
  useEffect(() => {
    console.log("홈 컴포넌트 - 로그인 상태:", isLoggedIn);
    console.log("홈 컴포넌트 - 사용자 데이터:", userData);
  }, [isLoggedIn, userData]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  const goToUsers = () => {
    navigate('/users');
  };

  const goToCocktails = () => {
    navigate('/cocktails');
  };

  const handleLogin = (user) => {
    console.log("홈: 로그인 시도:", user);
    
    // localStorage에 저장된 사용자 정보 확인 (디버깅용)
    const storedUser = localStorage.getItem('userData');
    console.log("홈: 저장된 사용자 정보:", storedUser ? JSON.parse(storedUser) : "없음");
    
    const loginSuccess = login(user);
    
    console.log("홈: 로그인 결과:", loginSuccess);
    
    if (loginSuccess) {
      console.log("홈: 로그인 성공!");
      setShowLoginModal(false);
    } else {
      console.log("홈: 로그인 실패!");
      // alert 제거 - 에러 메시지는 모달 내부에서 처리
    }
    
    return loginSuccess; // 성공 여부를 리턴
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <header className="content-header">
        <h1>대시보드</h1>
        {isLoggedIn ? (
          <div className="user-profile">
            <span className="user-name">
              <FontAwesomeIcon icon={faUser} /> {userData?.name || '관리자'}님
            </span>
            <button className="login-btn" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} /> 로그아웃
            </button>
          </div>
        ) : (
          <button className="login-btn" onClick={() => setShowLoginModal(true)}>
            <FontAwesomeIcon icon={faSignInAlt} /> 로그인
          </button>
        )}
      </header>

      <section className="summary">
        <div className="summary-item">
          <h3>총 사용자</h3>
          <p id="total-users">{users.length}</p> {/* 실제 유저 수로 변경 */}
        </div>
        <div className="summary-item">
          <h3>총 칵테일</h3>
          <p id="total-cocktails">{cocktails.length}</p> {/* 실제 칵테일 수로 변경 */}
        </div>
        <div className="summary-item">
          <h3>신규 회원 (오늘)</h3>
          <p id="new-users">{getTodayNewUsers()}</p> {/* 오늘 가입한 유저 수 */}
        </div>
        <div className="summary-item">
          <h3>신규 칵테일 (이번 주)</h3>
          <p id="new-cocktails">{getWeeklyNewCocktails()}</p> {/* 이번 주 추가된 칵테일 수 */}
        </div>
      </section>

      <section className="lists">
        <div className="list-container">
          <h2>유저 목록</h2>
          <UserTable users={users.slice(0, 5)} /> {/* 최대 5명의 유저만 표시 */}
          <button className="more-btn" onClick={goToUsers}>더 보기</button>
        </div>
        <div className="list-container">
          <h2>기존 칵테일 목록</h2>
          <CocktailTable cocktails={cocktails.slice(0, 5)} /> {/* 최대 5개의 칵테일만 표시 */}
          <button className="more-btn" onClick={goToCocktails}>더 보기</button>
        </div>
      </section>

      <div className="time-display">
        <FontAwesomeIcon icon={faClock} />
        <span id="current-time">{currentTime}</span>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </>
  );
}

// 유저 테이블 컴포넌트 - props를 통해 데이터 전달받음
function UserTable({ users }) {
  // 상태 값을 한글로 변환하는 함수
  const getStatusInKorean = (status) => {
    switch(status) {
      case 'active':
        return '활성';
      case 'inactive':
        return '비활성';
      case 'pending':
        return '대기';
      default:
        return status;
    }
  };

  return (
    <table id="user-table">
      <thead>
        <tr>
          <th>이름</th>
          <th>이메일</th>
          <th>상태</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{getStatusInKorean(user.status)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// 칵테일 테이블 컴포넌트 - props를 통해 데이터 전달받음
function CocktailTable({ cocktails }) {
  return (
    <table id="cocktail-table">
      <thead>
        <tr>
          <th>이름</th>
          <th>카테고리</th>
          <th>맛 설명</th>
          <th>알코올 도수</th>
        </tr>
      </thead>
      <tbody>
        {cocktails.map(cocktail => (
          <tr key={cocktail.id}>
            <td>{cocktail.name}</td>
            <td>{cocktail.category}</td>
            <td>{cocktail.flavor}</td>
            <td>{cocktail.abv}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Home;