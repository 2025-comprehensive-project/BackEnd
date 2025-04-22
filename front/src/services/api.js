// src/services/api.js
import axios from 'axios';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://ceprj.gachon.ac.kr:60003', // 환경변수로 관리하거나 실제 서버 URL로 변경
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
  // 로그인
  login: async (email, password) => {
    try {
      const response = await api.post('/api/admin/login', { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 로그아웃
  logout: async () => {
    try {
      const response = await api.post('/api/admin/logout');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 관리자 정보 조회
  getAdminInfo: async () => {
    try {
      const response = await api.get('/api/admin/info');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 비밀번호 변경
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

  // 비밀번호 찾기 - 이메일 전송
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/api/admin/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 비밀번호 재설정 - 토큰으로 비밀번호 재설정
  resetPassword: async (token, email, newPassword) => {
    try {
      const response = await api.post('/api/admin/reset-password', {
        token,
        email,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api;