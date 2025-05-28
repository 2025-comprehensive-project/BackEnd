import React from 'react';
import Sidebar from './Sidebar';
import '../../styles/layout/Style.css'; // 여기서 .container, .content 등 정의

function Layout({ children }) {
  return (
    <div className="container">
      <Sidebar />
      <main className="content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
