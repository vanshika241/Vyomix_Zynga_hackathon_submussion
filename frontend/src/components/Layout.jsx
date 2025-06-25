import React from 'react';
import { Outlet } from 'react-router-dom';
import Logo from './Logo';
import Header from './Header';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-8 py-6 flex flex-col">
      {/* Logo */}
      

      {/* Header (Step Progress) */}
      <Header />

      {/* Page-specific content */}
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
