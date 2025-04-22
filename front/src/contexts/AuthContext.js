// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 앱 시작시 토큰 확인 및 사용자 정보 로드
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    const loadUserData = async () => {
      if (token) {
        try {
          const data = await authAPI.getAdminInfo();
          setUserData(data.admin);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('토큰이 유효하지 않습니다:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    loadUserData();
  }, []);

  // 로그인 함수
  const login = useCallback(async (user) => {
    try {
      const response = await authAPI.login(user.email, user.password);
      
      // 토큰 저장
      localStorage.setItem('token', response.token);
      
      // 사용자 정보 로드
      const userInfo = await authAPI.getAdminInfo();
      setUserData(userInfo.admin);
      setIsLoggedIn(true);
      return true;
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error; // 에러를 상위로 전달하여 UI에서 처리할 수 있게 함
    }
  }, []);

  // 로그아웃 함수
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('로그아웃 API 호출 오류:', error);
      // API 호출 실패와 관계없이 클라이언트에서는 로그아웃 처리 진행
    } finally {
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setUserData(null);
    }
  }, []);

  // 비밀번호 변경 함수
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      await authAPI.changePassword(
        currentPassword, 
        newPassword, 
        newPassword // 확인용 비밀번호도 동일하게 전송
      );
      return true;
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      throw error; // 에러를 상위로 전달
    }
  }, []);

  // 비밀번호 찾기 함수
  const forgotPassword = useCallback(async (email) => {
    try {
      await authAPI.forgotPassword(email);
      return true;
    } catch (error) {
      console.error('비밀번호 찾기 요청 오류:', error);
      throw error; // 에러를 상위로 전달
    }
  }, []);

  const value = {
    isLoggedIn,
    userData,
    loading,
    login,
    logout,
    changePassword,
    forgotPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};