// src/pages/UserList.js
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminUserAPI } from '../services/adminUserAPI';
import Pagination from '../components/common/Pagination';
import '../styles/pages/UserList.css';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const isFirstLoad = useRef(true);
  
  // 페이지당 표시할 유저 수
  const USERS_PER_PAGE = 12;

  // 초기 페이지 설정
  const [currentPage, setCurrentPage] = useState(1);

  // 컴포넌트 마운트 시 처리
  useEffect(() => {
    if (isFirstLoad.current) {
      // 이전 페이지가 유저 상세 페이지인지 확인
      const fromUserDetail = location.state?.from === 'userDetail';
      
      if (fromUserDetail) {
        // 유저 상세에서 왔으면 저장된 페이지 복원
        const savedPage = sessionStorage.getItem('userListPage');
        if (savedPage) {
          const pageNum = parseInt(savedPage, 10);
          console.log('Restoring page from user detail:', pageNum);
          setCurrentPage(pageNum);
        }
      } else {
        // 다른 페이지에서 왔으면 1페이지로 리셋
        console.log('Coming from other page, reset to page 1');
        setCurrentPage(1);
        sessionStorage.removeItem('userListPage');
      }
      
      isFirstLoad.current = false;
    }
  }, [location.state]);

  // 유저 데이터 로드
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const data = await adminUserAPI.getAllUsers();
        setUsers(data);
        setError(null);
      } catch (err) {
        setError('유저 목록을 불러오는데 실패했습니다.');
        console.error('유저 목록 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  // 페이지 변경 시 sessionStorage에 저장
  useEffect(() => {
    if (!isFirstLoad.current) {
      console.log('Saving page:', currentPage);
      sessionStorage.setItem('userListPage', currentPage.toString());
    }
  }, [currentPage]);

  // 검색 필터링
  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // 검색어가 변경되면 첫 페이지로 이동
  useEffect(() => {
    if (searchTerm) {
      setCurrentPage(1);
      sessionStorage.removeItem('userListPage');
    }
  }, [searchTerm]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  
  // 현재 페이지의 유저들
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    const endIndex = startIndex + USERS_PER_PAGE;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage]);

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    console.log('Page change requested:', newPage);
    setCurrentPage(newPage);
  };

  const viewUserDetails = (userId) => {
    // 페이지 이동 직전에 한 번 더 저장
    sessionStorage.setItem('userListPage', currentPage.toString());
    navigate(`/users/${userId}`);
  };

  if (loading) {
    return <div className="user-list-loading">유저 정보를 불러오는 중...</div>;
  }

  if (error) {
    return <div className="user-list-error">{error}</div>;
  }

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <h1>유저 관리</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="이름 또는 이메일로 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="user-card-grid">
        {paginatedUsers.length > 0 ? (
          paginatedUsers.map(user => (
            <div 
              key={user.user_id} 
              className="user-card"
              onClick={() => viewUserDetails(user.user_id)}
            >
              <div className="user-avatar">
                {user.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="user-info">
                <h3 className="user-name">{user.name}</h3>
                <p className="user-email">{user.email}</p>
                <p className="user-date">가입일: {new Date(user.registered_at).toLocaleDateString()}</p>
              </div>
              <div className="user-card-action">
                <button className="view-details-btn">상세 보기</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">검색 결과가 없습니다.</div>
        )}
      </div>

      {/* 페이지네이션 추가 */}
      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default UserList;