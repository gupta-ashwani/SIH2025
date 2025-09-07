import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Layout.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  // Don't show navbar on auth pages
  if (
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/"
  ) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo and Brand */}
        <div className="navbar-brand">
          <Link
            to={
              currentUser
                ? currentUser.role === "student"
                  ? `/students/dashboard/${currentUser._id || currentUser.id}`
                  : `/dashboard/${currentUser.role}`
                : "/login"
            }
            className="brand-link"
            onClick={closeMenu}
          >
            <div className="brand-logo">
              <span className="logo-icon">
                <i className="fas fa-graduation-cap"></i>
              </span>
              <span className="brand-text">Smart Student Hub</span>
            </div>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`navbar-toggle ${isOpen ? "active" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Menu */}
        <div className={`navbar-menu ${isOpen ? "active" : ""}`}>
          <div className="navbar-nav">
            {currentUser && (
              <>
                {/* Student Navigation */}
                {currentUser.role === "student" &&
                  (currentUser._id || currentUser.id) && (
                    <>
                      <Link
                        to={`/students/dashboard/${
                          currentUser._id || currentUser.id
                        }`}
                        className="nav-link"
                        onClick={closeMenu}
                      >
                        <span className="nav-icon">
                          <i className="fas fa-tachometer-alt"></i>
                        </span>
                        Dashboard
                      </Link>
                      <Link
                        to={`/students/upload/${
                          currentUser._id || currentUser.id
                        }`}
                        className="nav-link"
                        onClick={closeMenu}
                      >
                        <span className="nav-icon">
                          <i className="fas fa-upload"></i>
                        </span>
                        Upload
                      </Link>
                      <Link
                        to={`/students/portfolio/${
                          currentUser._id || currentUser.id
                        }`}
                        className="nav-link"
                        onClick={closeMenu}
                      >
                        <span className="nav-icon">
                          <i className="fas fa-folder-open"></i>
                        </span>
                        Portfolio
                      </Link>
                      <Link
                        to={`/students/analytics/${
                          currentUser._id || currentUser.id
                        }`}
                        className="nav-link"
                        onClick={closeMenu}
                      >
                        <span className="nav-icon">
                          <i className="fas fa-chart-line"></i>
                        </span>
                        Analytics
                      </Link>
                    </>
                  )}

                {/* Other Roles Navigation */}
                {currentUser.role !== "student" && (
                  <Link
                    to={`/dashboard/${currentUser.role}`}
                    className="nav-link"
                    onClick={closeMenu}
                  >
                    <span className="nav-icon">
                      <i className="fas fa-home"></i>
                    </span>
                    Dashboard
                  </Link>
                )}
              </>
            )}
          </div>

          {/* User Menu */}
          {currentUser && (
            <div className="navbar-user">
              <div className="user-info">
                <div className="user-avatar">
                  {currentUser.name?.first?.[0] ||
                    currentUser.email?.[0] ||
                    "U"}
                </div>
                <div className="user-details">
                  <span className="user-name">
                    {currentUser.name?.first || currentUser.email || "User"}
                  </span>
                  <span className="user-role">
                    {currentUser.role?.charAt(0).toUpperCase() +
                      currentUser.role?.slice(1)}
                  </span>
                </div>
              </div>
              <button
                className="logout-btn"
                onClick={handleLogout}
                aria-label="Logout"
              >
                <span className="logout-icon">
                  <i className="fas fa-sign-out-alt"></i>
                </span>
                <span className="logout-text">Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* Overlay for mobile menu */}
        {isOpen && <div className="navbar-overlay" onClick={closeMenu}></div>}
      </div>
    </nav>
  );
};

export default Navbar;
