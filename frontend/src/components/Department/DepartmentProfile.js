import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { profileService } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";
import "./Department.css";

const DepartmentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    if (currentUser && currentUser.role === 'department') {
      fetchDepartmentProfile();
    }
  }, [id, currentUser]);

  const fetchDepartmentProfile = async () => {
    try {
      setLoading(true);
      const response = await profileService.getCurrentProfile();
      setDepartment(response.data.profile);
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
      setDepartment(editedData);
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
      setError("Failed to update profile");
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
    if (!name) return "D";
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="department-dashboard">
        <div className="dashboard-content">
          <div className="loading-container">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="department-dashboard">
        <div className="dashboard-content">
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
        </div>
      </div>
    );
  }

  return (
    <div className="department-dashboard">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              <span className="profile-initials">
                {getInitials(department?.name)}
              </span>
            </div>
            <div className="profile-basic-info">
              <h1 className="profile-name">{department?.name}</h1>
              <p className="profile-id">Department Code: {department?.code}</p>
              <p className="profile-department">
                {department?.college?.name} - {department?.institute?.name}
              </p>
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-value">
                    {department?.faculties?.length || 0}
                  </span>
                  <span className="stat-label">Faculty</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {department?.hod ? "1" : "0"}
                  </span>
                  <span className="stat-label">HOD</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {department?.status}
                  </span>
                  <span className="stat-label">Status</span>
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
                    setEditedData(department);
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
            className={`nav-tab ${activeTab === "basic" ? "active" : ""}`}
            onClick={() => setActiveTab("basic")}
          >
            <i className="fas fa-info-circle"></i>
            Basic Info
          </button>
          <button
            className={`nav-tab ${activeTab === "contact" ? "active" : ""}`}
            onClick={() => setActiveTab("contact")}
          >
            <i className="fas fa-address-book"></i>
            Contact Info
          </button>
          <button
            className={`nav-tab ${activeTab === "faculty" ? "active" : ""}`}
            onClick={() => setActiveTab("faculty")}
          >
            <i className="fas fa-users"></i>
            Faculty Members
          </button>
          <button
            className={`nav-tab ${activeTab === "hierarchy" ? "active" : ""}`}
            onClick={() => setActiveTab("hierarchy")}
          >
            <i className="fas fa-sitemap"></i>
            Hierarchy
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {activeTab === "basic" && (
          <div className="personal-info-section">
            <h2 className="section-title">Basic Information</h2>
            <div className="profile-grid">
              <div className="profile-field">
                <label>Department Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData?.name || ""}
                    onChange={(e) =>
                      handleInputChange("name", e.target.value)
                    }
                    className="profile-input"
                  />
                ) : (
                  <span className="profile-value">
                    {department?.name || "Not specified"}
                  </span>
                )}
              </div>
              <div className="profile-field">
                <label>Department Code</label>
                <span className="profile-value">{department?.code}</span>
              </div>
              <div className="profile-field">
                <label>Email Address</label>
                <span className="profile-value">{department?.email}</span>
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
                    <span className={`status-badge ${department?.status?.toLowerCase()}`}>
                      {department?.status}
                    </span>
                  </span>
                )}
              </div>
              <div className="profile-field">
                <label>Created Date</label>
                <span className="profile-value">
                  {formatDate(department?.createdAt)}
                </span>
              </div>
              <div className="profile-field">
                <label>Last Updated</label>
                <span className="profile-value">
                  {formatDate(department?.updatedAt)}
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
                <span className="profile-value">{department?.email}</span>
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
                    {department?.contactNumber || "Not specified"}
                  </span>
                )}
              </div>
              <div className="profile-field">
                <label>Department Code</label>
                <span className="profile-value">{department?.code}</span>
              </div>
              <div className="profile-field">
                <label>College</label>
                <span className="profile-value">
                  {department?.college?.name} ({department?.college?.code})
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "faculty" && (
          <div className="personal-info-section">
            <h2 className="section-title">Faculty Members</h2>
            <div className="faculty-section">
              <div className="hod-section">
                <h3>Head of Department (HOD)</h3>
                <div className="hod-info">
                  {department?.hod ? (
                    <div className="faculty-item hod-item">
                      <div className="faculty-avatar">
                        {department.hod.name.first[0]}{department.hod.name.last[0]}
                      </div>
                      <div className="faculty-details">
                        <h4>{department.hod.name.first} {department.hod.name.last}</h4>
                        <p>Faculty ID: {department.hod.facultyID}</p>
                        <span className="designation-badge hod">HOD</span>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>No HOD assigned</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="faculty-members-section">
                <h3>Faculty Members ({department?.faculties?.length || 0})</h3>
                <div className="faculty-list">
                  {department?.faculties?.length > 0 ? (
                    department.faculties.map((faculty, index) => (
                      <div key={index} className="faculty-item">
                        <div className="faculty-avatar">
                          {faculty.name.first[0]}{faculty.name.last[0]}
                        </div>
                        <div className="faculty-details">
                          <h4>{faculty.name.first} {faculty.name.last}</h4>
                          <p>Faculty ID: {faculty.facultyID}</p>
                          <span className="designation-badge">
                            {faculty.designation}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>No faculty members added yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "hierarchy" && (
          <div className="personal-info-section">
            <h2 className="section-title">Organizational Hierarchy</h2>
            <div className="hierarchy-section">
              <div className="hierarchy-tree">
                <div className="hierarchy-level">
                  <div className="hierarchy-item institute">
                    <div className="hierarchy-icon">
                      <i className="fas fa-university"></i>
                    </div>
                    <div className="hierarchy-info">
                      <h4>{department?.institute?.name}</h4>
                      <p>Institute</p>
                      <span className="hierarchy-code">{department?.institute?.code}</span>
                    </div>
                  </div>
                </div>

                <div className="hierarchy-connector">
                  <i className="fas fa-arrow-down"></i>
                </div>

                <div className="hierarchy-level">
                  <div className="hierarchy-item college">
                    <div className="hierarchy-icon">
                      <i className="fas fa-building"></i>
                    </div>
                    <div className="hierarchy-info">
                      <h4>{department?.college?.name}</h4>
                      <p>College</p>
                      <span className="hierarchy-code">{department?.college?.code}</span>
                    </div>
                  </div>
                </div>

                <div className="hierarchy-connector">
                  <i className="fas fa-arrow-down"></i>
                </div>

                <div className="hierarchy-level">
                  <div className="hierarchy-item department current">
                    <div className="hierarchy-icon">
                      <i className="fas fa-graduation-cap"></i>
                    </div>
                    <div className="hierarchy-info">
                      <h4>{department?.name}</h4>
                      <p>Department</p>
                      <span className="hierarchy-code">{department?.code}</span>
                    </div>
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

export default DepartmentProfile;
