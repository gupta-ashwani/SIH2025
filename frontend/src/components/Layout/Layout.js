import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import "./Layout.css";

const Layout = ({ children }) => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/register';

  return (
    <div className="app-layout">
      {!isLandingPage && !isAuthPage && <Navbar />}
      <main className={`main-content ${isLandingPage ? 'landing-main' : ''} ${isAuthPage ? 'auth-main' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
