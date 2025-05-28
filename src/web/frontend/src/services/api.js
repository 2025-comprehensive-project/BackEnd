// src/services/api.js
import axios from 'axios';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:60003',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 요청 인터셉터 - JWT 토큰을 헤더에 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 인증 관련 API 함수들
export const authAPI = {
  // 1. 로그인
  login: async (email, password) => {
    try {
      const response = await api.post('/api/admin/login', { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 2. 로그아웃
  logout: async () => {
    try {
      const response = await api.post('/api/admin/logout');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 3. 관리자 정보 조회 (수정됨)
  getAdminInfo: async () => {
    try {
      const response = await api.get('/api/admin/info');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 4. 관리자 정보 수정 (새로 추가)
  updateAdminInfo: async (updateData) => {
    try {
      const response = await api.patch('/api/admin/info', updateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 5. 비밀번호 변경 (수정됨)
  changePassword: async (currentPassword, newPassword, newPasswordConfirm) => {
    try {
      const response = await api.patch('/api/admin/password', {
        currentPassword,
        newPassword,
        newPasswordConfirm
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 6. 비밀번호 찾기 - 재설정 링크 전송 (수정됨)
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/api/admin/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 7. 비밀번호 재설정 (수정됨)
  resetPassword: async (token, newPassword, newPasswordConfirm) => {
    try {
      const response = await api.post('/api/admin/reset-password', {
        token,
        newPassword,
        newPasswordConfirm
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api;