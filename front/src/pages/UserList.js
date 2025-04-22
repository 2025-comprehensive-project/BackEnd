// src/pages/UserList.js
import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { DataContext } from '../contexts/DataContext';

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

function UserList() {
  const { users, addUser, updateUser, deleteUser } = useContext(DataContext);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 5;

  const filteredUsers = users.filter(user =>
    (user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === '' || user.status === statusFilter)
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return -1;
    if (a[sortBy] > b[sortBy]) return 1;
    return 0;
  });

  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const totalPages = Math.ceil(sortedUsers.length / USERS_PER_PAGE);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handleDelete = (userId) => {
    if (window.confirm('이 사용자를 삭제하시겠습니까?')) {
      deleteUser(userId);
    }
  };

  return (
    <>
      <header className="content-header">
        <h1>유저 목록</h1>
        <button className="add-user-btn">
          <FontAwesomeIcon icon={faUserPlus} /> 유저 추가
        </button>
      </header>

      <div className="filter-options">
        <div className="filter-group">
          <label htmlFor="search-input">검색:</label>
          <input
            type="text"
            id="search-input"
            placeholder="이름 또는 이메일로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="status-filter">상태:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">전체</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
            <option value="pending">대기</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="sort-by">정렬:</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">이름</option>
            <option value="email">이메일</option>
            <option value="joined">가입일</option>
          </select>
        </div>
      </div>

      <table className="user-table">
        <thead>
          <tr>
            <th>이름</th>
            <th>이메일</th>
            <th>상태</th>
            <th>가입일</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{getStatusInKorean(user.status)}</td>
              <td>{user.joined}</td>
              <td>
                <button className="action-btn edit-btn" data-id={user.id}>수정</button>
                <button 
                  className="action-btn delete-btn" 
                  data-id={user.id}
                  onClick={() => handleDelete(user.id)}
                >삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button
          id="prev-page"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          <FontAwesomeIcon icon={faChevronLeft} /> 이전
        </button>
        <span id="page-info">{currentPage} / {totalPages}</span>
        <button
          id="next-page"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          다음 <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </>
  );
}

export default UserList;