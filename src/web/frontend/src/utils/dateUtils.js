// src/utils/dateUtils.js
export const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    
    const targetDate = new Date(dateString);
    const now = new Date();
    
    // 시간 차이 계산 (밀리초)
    const diff = targetDate - now;
    
    if (diff <= 0) {
      return '완료';
    }
    
    // 시간, 분, 초 계산
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분 남음`;
    } else if (minutes > 0) {
      return `${minutes}분 ${seconds}초 남음`;
    } else {
      return `${seconds}초 남음`;
    }
  };
  
  export const formatDateTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };