// src/App.js 수정
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Home from './pages/Home';
import UserList from './pages/UserList';
import CocktailList from './pages/CocktailList';
import Settings from './pages/Settings';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './pages/ProtectedRoute';
import Login from './pages/Login'; // 새로 만들 로그인 페이지
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import './styles/style.css';
import './styles/user-list.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* 비밀번호 재설정 페이지는 사이드바 없이 표시 */}
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            {/* 로그인 페이지 - 사이드바 없이 표시 */}
            <Route path="/login" element={<Login />} />
            
            {/* 메인 라우트 - 모두 보호된 라우트로 변경 */}
            <Route path="/" element={
              <ProtectedRoute>
                <div className="container">
                  <Sidebar />
                  <main className="content">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/users" element={<UserList />} />
                      <Route path="/cocktails" element={<CocktailList />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            } />
            
            {/* 기본적으로 로그인 페이지로 리다이렉트 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;