// src/pages/ProtectedRoute.js 수정
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useContext(AuthContext);
  
  // 로그인 상태가 아니면 로그인 페이지로 리다이렉트
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  // 로그인 상태라면 자식 컴포넌트 렌더링
  return children;
}

export default ProtectedRoute;