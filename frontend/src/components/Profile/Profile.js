import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { profileService } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";
import FacultyProfile from "../Faculty/FacultyProfile";
import DepartmentProfile from "../Department/DepartmentProfile";
import CollegeProfile from "../College/CollegeProfile";
import InstituteProfile from "../Institute/InstituteProfile";
import SuperAdminProfile from "../SuperAdmin/SuperAdminProfile";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUser) {
      // Verify that the user is accessing their own profile
      if (currentUser.id !== id) {
        setError("Unauthorized access to profile");
        setLoading(false);
        return;
      }
      setLoading(false);
    }
  }, [id, currentUser]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <main className="dashboard-content">
          <div className="loading-container">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <p>Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <main className="dashboard-content">
          <div className="error-container">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Error Loading Profile</h3>
            <p>{error}</p>
            <button className="cta-btn" onClick={() => navigate(-1)}>
              <i className="fas fa-arrow-left"></i>
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="dashboard-container">
        <main className="dashboard-content">
          <div className="error-container">
            <div className="error-icon">
              <i className="fas fa-user-times"></i>
            </div>
            <h3>Not Authenticated</h3>
            <p>Please log in to view your profile.</p>
            <button className="cta-btn" onClick={() => navigate("/login")}>
              <i className="fas fa-sign-in-alt"></i>
              Login
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Render the appropriate profile component based on user role
  switch (currentUser.role) {
    case "faculty":
      return <FacultyProfile />;
    case "department":
      return <DepartmentProfile />;
    case "college":
      return <CollegeProfile />;
    case "institute":
      return <InstituteProfile />;
    case "superadmin":
      return <SuperAdminProfile />;
    default:
      return (
        <div className="dashboard-container">
          <main className="dashboard-content">
            <div className="error-container">
              <div className="error-icon">
                <i className="fas fa-question-circle"></i>
              </div>
              <h3>Unknown Role</h3>
              <p>Your user role is not recognized. Please contact support.</p>
              <button className="cta-btn" onClick={() => navigate("/dashboard")}>
                <i className="fas fa-home"></i>
                Go to Dashboard
              </button>
            </div>
          </main>
        </div>
      );
  }
};

export default Profile;
