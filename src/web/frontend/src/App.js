// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import UserList from './pages/UserList';
import UserDetail from './pages/UserDetail';
import CocktailList from './pages/CocktailList';
import Settings from './pages/Settings';
import MetadataManager from './pages/MetadataManager';
import AIManager from './pages/AIManager';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './pages/ProtectedRoute';
import Login from './pages/Login';
import Layout from './components/layout/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import './styles/layout/Style.css';
import './styles/pages/UserList.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* 로그인 / 비밀번호 재설정 */}
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/login" element={<Login />} />

            {/* 보호된 라우트들 (Sidebar + Layout 공통 적용) */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout><Home /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Layout><UserList /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/:userId"
              element={
                <ProtectedRoute>
                  <Layout><UserDetail /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/cocktails"
              element={
                <ProtectedRoute>
                  <Layout><CocktailList /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout><Settings /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/metadata"
              element={
                <ProtectedRoute>
                  <Layout><MetadataManager /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai"
              element={
                <ProtectedRoute>
                  <Layout><AIManager /></Layout>
                </ProtectedRoute>
              }
            />

            {/* 잘못된 경로 → 로그인 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
