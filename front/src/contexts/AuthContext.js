// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  // 초기화 (로컬 스토리지에서 이전 로그인 정보 불러오기)
  useEffect(() => {
    const storedLogin = localStorage.getItem('isLoggedIn');
    const storedUser = localStorage.getItem('userData');

    if (storedLogin === 'true' && storedUser) {
      setIsLoggedIn(true);
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  // 로그인 성공 시 호출: 서버 응답으로 상태 업데이트
  const login = useCallback((serverUser) => {
    setIsLoggedIn(true);
    setUserData(serverUser);

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify(serverUser));

    return true;
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserData(null);
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('userData');
  }, []);

  const value = {
    isLoggedIn,
    userData,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth 훅
export const useAuth = () => useContext(AuthContext);
