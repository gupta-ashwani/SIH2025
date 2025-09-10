import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { profileService } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";
import "./College.css";

const CollegeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    if (currentUser && currentUser.role === 'college') {
      fetchCollegeProfile();
    }
  }, [id, currentUser]);

  const fetchCollegeProfile = async () => {
    try {
      setLoading(true);
      const response = await profileService.getCurrentProfile();
      setCollege(response.data.profile);
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
      setCollege(editedData);
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

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name) => {
    if (!name) return "C";
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="college-dashboard">
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
      <div className="college-dashboard">
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
    <div className="college-dashboard">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              <span className="profile-initials">
                {getInitials(college?.name)}
              </span>
            </div>
            <div className="profile-basic-info">
              <h1 className="profile-name">{college?.name}</h1>
              <p className="profile-id">College Code: {college?.code}</p>
              <p className="profile-department">
                {college?.type} - {college?.institute?.name}
              </p>
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-value">
                    {college?.departments?.length || 0}
                  </span>
                  <span className="stat-label">Departments</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {college?.status}
                  </span>
                  <span className="stat-label">Status</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {college?.address?.city}
                  </span>
                  <span className="stat-label">Location</span>
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
                    setEditedData(college);
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
            Contact & Address
          </button>
          <button
            className={`nav-tab ${activeTab === "departments" ? "active" : ""}`}
            onClick={() => setActiveTab("departments")}
          >
            <i className="fas fa-graduation-cap"></i>
            Departments
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
                <label>College Name</label>
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
                    {college?.name || "Not specified"}
                  </span>
                )}
              </div>
              <div className="profile-field">
                <label>College Code</label>
                <span className="profile-value">{college?.code}</span>
              </div>
              <div className="profile-field">
                <label>College Type</label>
                {isEditing ? (
                  <select
                    value={editedData?.type || ""}
                    onChange={(e) =>
                      handleInputChange("type", e.target.value)
                    }
                    className="profile-input"
                  >
                    <option value="Engineering College">Engineering College</option>
                    <option value="Medical College">Medical College</option>
                    <option value="Arts College">Arts College</option>
                    <option value="Science College">Science College</option>
                    <option value="Commerce College">Commerce College</option>
                    <option value="Law College">Law College</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <span className="profile-value">
                    {college?.type || "Not specified"}
                  </span>
                )}
              </div>
              <div className="profile-field">
                <label>Email Address</label>
                <span className="profile-value">{college?.email}</span>
              </div>
              <div className="profile-field">
                <label>Website</label>
                {isEditing ? (
                  <input
                    type="url"
                    value={editedData?.website || ""}
                    onChange={(e) =>
                      handleInputChange("website", e.target.value)
                    }
                    className="profile-input"
                    placeholder="https://college.edu"
                  />
                ) : (
                  <span className="profile-value">
                    {college?.website ? (
                      <a href={college.website} target="_blank" rel="noopener noreferrer">
                        {college.website}
                      </a>
                    ) : (
                      "Not specified"
                    )}
                  </span>
                )}
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
                    <span className={`status-badge ${college?.status?.toLowerCase()}`}>
                      {college?.status}
                    </span>
                  </span>
                )}
              </div>
              <div className="profile-field">
                <label>Created Date</label>
                <span className="profile-value">
                  {formatDate(college?.createdAt)}
                </span>
              </div>
              <div className="profile-field">
                <label>Last Updated</label>
                <span className="profile-value">
                  {formatDate(college?.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="personal-info-section">
            <h2 className="section-title">Contact & Address Information</h2>
            <div className="profile-grid">
              <div className="profile-field">
                <label>Email Address</label>
                <span className="profile-value">{college?.email}</span>
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
                    {college?.contactNumber || "Not specified"}
                  </span>
                )}
              </div>
              <div className="profile-field">
                <label>Website</label>
                {isEditing ? (
                  <input
                    type="url"
                    value={editedData?.website || ""}
                    onChange={(e) =>
                      handleInputChange("website", e.target.value)
                    }
                    className="profile-input"
                    placeholder="https://college.edu"
                  />
                ) : (
                  <span className="profile-value">
                    {college?.website ? (
                      <a href={college.website} target="_blank" rel="noopener noreferrer">
                        {college.website}
                      </a>
                    ) : (
                      "Not specified"
                    )}
                  </span>
                )}
              </div>
              <div className="profile-field full-width">
                <label>Address</label>
                {isEditing ? (
                  <div className="address-grid">
                    <input
                      type="text"
                      placeholder="Address Line 1"
                      value={editedData?.address?.line1 || ""}
                      onChange={(e) =>
                        handleInputChange("address.line1", e.target.value)
                      }
                      className="profile-input"
                    />
                    <input
                      type="text"
                      placeholder="Address Line 2"
                      value={editedData?.address?.line2 || ""}
                      onChange={(e) =>
                        handleInputChange("address.line2", e.target.value)
                      }
                      className="profile-input"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={editedData?.address?.city || ""}
                      onChange={(e) =>
                        handleInputChange("address.city", e.target.value)
                      }
                      className="profile-input"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={editedData?.address?.state || ""}
                      onChange={(e) =>
                        handleInputChange("address.state", e.target.value)
                      }
                      className="profile-input"
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={editedData?.address?.country || ""}
                      onChange={(e) =>
                        handleInputChange("address.country", e.target.value)
                      }
                      className="profile-input"
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={editedData?.address?.pincode || ""}
                      onChange={(e) =>
                        handleInputChange("address.pincode", e.target.value)
                      }
                      className="profile-input"
                    />
                  </div>
                ) : (
                  <span className="profile-value">
                    {college?.address
                      ? `${college.address.line1 || ""} ${
                          college.address.line2 || ""
                        }, ${college.address.city || ""}, ${
                          college.address.state || ""
                        }, ${college.address.country || ""} - ${
                          college.address.pincode || ""
                        }`
                          .replace(/\s+/g, " ")
                          .trim()
                      : "Not specified"}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "departments" && (
          <div className="personal-info-section">
            <h2 className="section-title">Departments ({college?.departments?.length || 0})</h2>
            <div className="departments-section">
              <div className="departments-list">
                {college?.departments?.length > 0 ? (
                  college.departments.map((department, index) => (
                    <div key={index} className="department-item">
                      <div className="department-avatar">
                        {department.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="department-details">
                        <h4>{department.name}</h4>
                        <p>Department Code: {department.code}</p>
                        <span className="department-status">Active</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No departments added yet</p>
                  </div>
                )}
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
                      <h4>{college?.institute?.name}</h4>
                      <p>Institute</p>
                      <span className="hierarchy-code">{college?.institute?.code}</span>
                    </div>
                  </div>
                </div>

                <div className="hierarchy-connector">
                  <i className="fas fa-arrow-down"></i>
                </div>

                <div className="hierarchy-level">
                  <div className="hierarchy-item college current">
                    <div className="hierarchy-icon">
                      <i className="fas fa-building"></i>
                    </div>
                    <div className="hierarchy-info">
                      <h4>{college?.name}</h4>
                      <p>College</p>
                      <span className="hierarchy-code">{college?.code}</span>
                    </div>
                  </div>
                </div>

                <div className="hierarchy-connector">
                  <i className="fas fa-arrow-down"></i>
                </div>

                <div className="hierarchy-level">
                  <div className="departments-hierarchy">
                    <h4>Departments ({college?.departments?.length || 0})</h4>
                    <div className="departments-hierarchy-list">
                      {college?.departments?.map((department, index) => (
                        <div key={index} className="hierarchy-item department">
                          <div className="hierarchy-icon">
                            <i className="fas fa-graduation-cap"></i>
                          </div>
                          <div className="hierarchy-info">
                            <h4>{department.name}</h4>
                            <p>Department</p>
                            <span className="hierarchy-code">{department.code}</span>
                          </div>
                        </div>
                      ))}
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

export default CollegeProfile;
