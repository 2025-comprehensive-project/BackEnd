// src/components/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useContext(AuthContext);
  
  console.log("보호된 라우트 - 로그인 상태:", isLoggedIn); // 디버깅용
  
  // 로그인 상태가 아니면 홈으로 리다이렉트
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  
  // 로그인 상태라면 자식 컴포넌트 렌더링
  return children;
}

export default ProtectedRoute;