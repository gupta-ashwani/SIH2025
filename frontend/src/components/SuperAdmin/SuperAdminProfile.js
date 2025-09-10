import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { profileService } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";
import "./SuperAdmin.css";

const SuperAdminProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [superAdmin, setSuperAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    if (currentUser && currentUser.role === 'superadmin') {
      fetchSuperAdminProfile();
    }
  }, [id, currentUser]);

  const fetchSuperAdminProfile = async () => {
    try {
      setLoading(true);
      const response = await profileService.getCurrentProfile();
      setSuperAdmin(response.data.profile);
      setEditedData(response.data.profile);
    } catch (error) {
      console.error("Profile error:", error);
      setError(error.response?.data?.error || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await profileService.updateCurrentProfile(editedData);
      setSuperAdmin(editedData);
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
      setError("Failed to update profile");
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setEditedData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setEditedData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handlePermissionChange = (permission, checked) => {
    setEditedData((prev) => {
      const permissions = prev.permissions || [];
      if (checked) {
        return {
          ...prev,
          permissions: [...permissions, permission]
        };
      } else {
        return {
          ...prev,
          permissions: permissions.filter(p => p !== permission)
        };
      }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name) => {
    if (!name) return "SA";
    const { first, last } = name;
    return `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`;
  };

  const getPermissionLabel = (permission) => {
    const labels = {
      full_access: "Full Access",
      institution_management: "Institution Management",
      user_management: "User Management",
      analytics_access: "Analytics Access",
      reports_access: "Reports Access"
    };
    return labels[permission] || permission;
  };

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

  return (
    <div className="dashboard-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              <span className="profile-initials">
                {getInitials(superAdmin?.name)}
              </span>
            </div>
            <div className="profile-basic-info">
              <h1 className="profile-name">
                {superAdmin?.name?.first} {superAdmin?.name?.last}
              </h1>
              <p className="profile-id">Super Admin</p>
              <p className="profile-department">
                Platform Administrator
              </p>
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-value">
                    {superAdmin?.permissions?.length || 0}
                  </span>
                  <span className="stat-label">Permissions</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {superAdmin?.status}
                  </span>
                  <span className="stat-label">Status</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {formatDate(superAdmin?.createdAt).split(' ')[2]}
                  </span>
                  <span className="stat-label">Since</span>
                </div>
              </div>
            </div>
          </div>
          <div className="profile-actions">
            {!isEditing ? (
              <button
                className="edit-profile-btn"
                onClick={() => setIsEditing(true)}
              >
                <i className="fas fa-edit"></i>
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button className="save-btn" onClick={handleSaveProfile}>
                  <i className="fas fa-save"></i>
                  Save
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedData(superAdmin);
                  }}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Navigation */}
      <div className="profile-navigation">
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === "personal" ? "active" : ""}`}
            onClick={() => setActiveTab("personal")}
          >
            <i className="fas fa-user"></i>
            Personal Info
          </button>
          <button
            className={`nav-tab ${activeTab === "contact" ? "active" : ""}`}
            onClick={() => setActiveTab("contact")}
          >
            <i className="fas fa-address-book"></i>
            Contact Info
          </button>
          <button
            className={`nav-tab ${activeTab === "permissions" ? "active" : ""}`}
            onClick={() => setActiveTab("permissions")}
          >
            <i className="fas fa-shield-alt"></i>
            Permissions
          </button>
          <button
            className={`nav-tab ${activeTab === "activity" ? "active" : ""}`}
            onClick={() => setActiveTab("activity")}
          >
            <i className="fas fa-history"></i>
            Activity Log
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {activeTab === "personal" && (
          <div className="personal-info-section">
            <h2 className="section-title">Personal Information</h2>
            <div className="profile-grid">
              <div className="profile-field">
                <label>First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData?.name?.first || ""}
                    onChange={(e) =>
                      handleInputChange("name.first", e.target.value)
                    }
                    className="profile-input"
                  />
                ) : (
                  <span className="profile-value">
                    {superAdmin?.name?.first || "Not specified"}
                  </span>
                )}
              </div>
              <div className="profile-field">
                <label>Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData?.name?.last || ""}
                    onChange={(e) =>
                      handleInputChange("name.last", e.target.value)
                    }
                    className="profile-input"
                  />
                ) : (
                  <span className="profile-value">
                    {superAdmin?.name?.last || "Not specified"}
                  </span>
                )}
              </div>
              <div className="profile-field">
                <label>Email Address</label>
                <span className="profile-value">{superAdmin?.email}</span>
              </div>
              <div className="profile-field">
                <label>Status</label>
                {isEditing ? (
                  <select
                    value={editedData?.status || ""}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                    className="profile-input"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                ) : (
                  <span className="profile-value">
                    <span className={`status-badge ${superAdmin?.status?.toLowerCase()}`}>
                      {superAdmin?.status}
                    </span>
                  </span>
                )}
              </div>
              <div className="profile-field">
                <label>Account Created</label>
                <span className="profile-value">
                  {formatDate(superAdmin?.createdAt)}
                </span>
              </div>
              <div className="profile-field">
                <label>Last Updated</label>
                <span className="profile-value">
                  {formatDate(superAdmin?.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="personal-info-section">
            <h2 className="section-title">Contact Information</h2>
            <div className="profile-grid">
              <div className="profile-field">
                <label>Email Address</label>
                <span className="profile-value">{superAdmin?.email}</span>
              </div>
              <div className="profile-field">
                <label>Contact Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedData?.contactNumber || ""}
                    onChange={(e) =>
                      handleInputChange("contactNumber", e.target.value)
                    }
                    className="profile-input"
                    placeholder="+91-9876543210"
                  />
                ) : (
                  <span className="profile-value">
                    {superAdmin?.contactNumber || "Not specified"}
                  </span>
                )}
              </div>
              <div className="profile-field">
                <label>Role</label>
                <span className="profile-value">Super Administrator</span>
              </div>
              <div className="profile-field">
                <label>Access Level</label>
                <span className="profile-value">Platform Level</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "permissions" && (
          <div className="personal-info-section">
            <h2 className="section-title">Permissions & Access Control</h2>
            <div className="permissions-section">
              <div className="permissions-grid">
                {[
                  "full_access",
                  "institution_management",
                  "user_management",
                  "analytics_access",
                  "reports_access"
                ].map((permission) => (
                  <div key={permission} className="permission-item">
                    <div className="permission-checkbox">
                      {isEditing ? (
                        <input
                          type="checkbox"
                          id={permission}
                          checked={editedData?.permissions?.includes(permission) || false}
                          onChange={(e) =>
                            handlePermissionChange(permission, e.target.checked)
                          }
                        />
                      ) : (
                        <input
                          type="checkbox"
                          id={permission}
                          checked={superAdmin?.permissions?.includes(permission) || false}
                          disabled
                        />
                      )}
                      <label htmlFor={permission}>
                        {getPermissionLabel(permission)}
                      </label>
                    </div>
                    <div className="permission-description">
                      {permission === "full_access" && "Complete access to all platform features and data"}
                      {permission === "institution_management" && "Manage institutions, approve/reject registrations"}
                      {permission === "user_management" && "Manage users, roles, and permissions"}
                      {permission === "analytics_access" && "Access to platform analytics and reports"}
                      {permission === "reports_access" && "Generate and view system reports"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="personal-info-section">
            <h2 className="section-title">Recent Activity Log</h2>
            <div className="activity-section">
              <div className="activity-list">
                <div className="activity-item">
                  <span className="activity-icon">✅</span>
                  <div className="activity-content">
                    <p>Approved University of Technology institution registration</p>
                    <span className="activity-time">2 hours ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <span className="activity-icon">👤</span>
                  <div className="activity-content">
                    <p>Created new super admin account for Dr. Jane Smith</p>
                    <span className="activity-time">1 day ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <span className="activity-icon">📊</span>
                  <div className="activity-content">
                    <p>Generated monthly platform analytics report</p>
                    <span className="activity-time">3 days ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <span className="activity-icon">🔧</span>
                  <div className="activity-content">
                    <p>Updated platform configuration settings</p>
                    <span className="activity-time">1 week ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <span className="activity-icon">🚫</span>
                  <div className="activity-content">
                    <p>Rejected Engineering College registration (incomplete documentation)</p>
                    <span className="activity-time">2 weeks ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminProfile;
