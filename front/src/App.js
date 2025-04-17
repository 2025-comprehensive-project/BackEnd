// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import UserList from './components/UserList';
import CocktailList from './components/CocktailList';
import Settings from './components/Settings';
import ProtectedRoute from './components/ProtectedRoute'; 
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext'; // DataContext 임포트 추가
import './style.css';
import './user-list.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider> {/* DataProvider 추가 */}
          <div className="container">
            <Sidebar />
            <main className="content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/users" element={<UserList />} />
                <Route path="/cocktails" element={<CocktailList />} />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
          </div>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;