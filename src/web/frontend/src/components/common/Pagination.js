// src/components/common/Pagination.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import '../../styles/common/Pagination.css';

function Pagination({ currentPage, totalPages, onPageChange }) {
  // 이전 버튼과 다음 버튼의 스타일을 직접 설정
  const buttonTextStyle = {
    color: '#333' // 원하는 색상으로 변경 (검정에 가까운 회색)
  };
  
  // 비활성화된 버튼 텍스트 스타일
  const disabledButtonTextStyle = {
    color: '#999' // 원하는 색상으로 변경 (연한 회색)
  };

  return (
    <div className="pagination">
      <button 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
        aria-label="이전 페이지"
      >
        <FontAwesomeIcon icon={faChevronLeft} style={currentPage === 1 ? disabledButtonTextStyle : buttonTextStyle} /> 
        <span style={currentPage === 1 ? disabledButtonTextStyle : buttonTextStyle}>이전</span>
      </button>
      
      <span className="page-info">
        {currentPage} 페이지 / {totalPages || 1}
      </span>
      
      <button 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages || totalPages === 0}
        aria-label="다음 페이지"
      >
        <span style={(currentPage === totalPages || totalPages === 0) ? disabledButtonTextStyle : buttonTextStyle}>다음</span> 
        <FontAwesomeIcon icon={faChevronRight} style={(currentPage === totalPages || totalPages === 0) ? disabledButtonTextStyle : buttonTextStyle} />
      </button>
    </div>
  );
}

export default Pagination;