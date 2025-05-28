// src/components/common/EnhancedPagination.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

function EnhancedPagination({ currentPage, totalPages, onPageChange }) {
  // 페이지네이션 컨테이너 스타일
  const paginationStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    margin: '20px 0'
  };
  
  // 기본 버튼 스타일
  const buttonStyle = {
    padding: '10px 16px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontWeight: '500',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };
  
  // 비활성화된 버튼 스타일
  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#90caf9',
    opacity: 0.7,
    cursor: 'not-allowed',
    boxShadow: 'none'
  };
  
  // 페이지 정보 스타일
  const pageInfoStyle = {
    margin: '0 10px',
    fontSize: '1.1em',
    color: '#333',
    fontWeight: '500'
  };

  // 아이콘 스타일
  const leftIconStyle = {
    marginRight: '8px'
  };
  
  const rightIconStyle = {
    marginLeft: '8px'
  };
  
  return (
    <div style={paginationStyle}>
      <button 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
        style={currentPage === 1 ? disabledButtonStyle : buttonStyle}
      >
        <FontAwesomeIcon icon={faChevronLeft} style={leftIconStyle} /> 
        <span>이전</span>
      </button>
      
      <span style={pageInfoStyle}>
        {currentPage} 페이지 / {totalPages || 1}
      </span>
      
      <button 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages || totalPages === 0}
        style={(currentPage === totalPages || totalPages === 0) ? disabledButtonStyle : buttonStyle}
      >
        <span>다음</span> 
        <FontAwesomeIcon icon={faChevronRight} style={rightIconStyle} />
      </button>
    </div>
  );
}

export default EnhancedPagination;