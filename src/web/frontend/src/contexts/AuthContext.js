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
          // admin_name 필드 추가
          setUserData({
            id: data.admin.admin_id,
            email: data.admin.email,
            name: data.admin.admin_name || '관리자' // admin_name이 없으면 기본값
          });
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
      setUserData({
        id: userInfo.admin.admin_id,
        email: userInfo.admin.email,
        name: userInfo.admin.admin_name || '관리자'
      });
      setIsLoggedIn(true);
      return true;
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
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

  // 관리자 정보 업데이트 함수 (새로 추가)
  const updateAdminInfo = useCallback(async (updateData) => {
    try {
      await authAPI.updateAdminInfo(updateData);
      
      // 업데이트 성공 후 새로운 정보 가져오기
      const updatedInfo = await authAPI.getAdminInfo();
      setUserData({
        id: updatedInfo.admin.admin_id,
        email: updatedInfo.admin.email,
        name: updatedInfo.admin.admin_name || '관리자'
      });
      
      return true;
    } catch (error) {
      console.error('관리자 정보 업데이트 오류:', error);
      throw error;
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
      throw error;
    }
  }, []);

  // 비밀번호 찾기 함수
  const forgotPassword = useCallback(async (email) => {
    try {
      await authAPI.forgotPassword(email);
      return true;
    } catch (error) {
      console.error('비밀번호 찾기 요청 오류:', error);
      throw error;
    }
  }, []);

  const value = {
    isLoggedIn,
    userData,
    loading,
    login,
    logout,
    updateAdminInfo, // 새로 추가
    changePassword,
    forgotPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};