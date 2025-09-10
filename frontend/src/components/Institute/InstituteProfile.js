import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { profileService } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";
import "./Institute.css";

const InstituteProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    if (currentUser && currentUser.role === 'institute') {
      fetchInstituteProfile();
    }
  }, [id, currentUser]);

  const fetchInstituteProfile = async () => {
    try {
      setLoading(true);
      const response = await profileService.getCurrentProfile();
      setInstitute(response.data.profile);
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
      setInstitute(editedData);
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
    if (!name) return "I";
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="institute-dashboard">
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
      <div className="institute-dashboard">
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
    <div className="institute-dashboard">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              <span className="profile-initials">
                {getInitials(institute?.name)}
              </span>
            </div>
            <div className="profile-basic-info">
              <h1 className="profile-name">{institute?.name}</h1>
              <p className="profile-id">Institute Code: {institute?.code}</p>
              <p className="profile-department">
                {institute?.type} - {institute?.location?.city}, {institute?.location?.state}
              </p>
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-value">
                    {institute?.colleges?.length || 0}
                  </span>
                  <span className="stat-label">Colleges</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {institute?.studentCount?.toLocaleString() || 0}
                  </span>
                  <span className="stat-label">Students</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {institute?.approvalStatus}
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
                    setEditedData(institute);
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
            className={`nav-tab ${activeTab === "colleges" ? "active" : ""}`}
            onClick={() => setActiveTab("colleges")}
          >
            <i className="fas fa-building"></i>
            Colleges
          </button>
          <button
            className={`nav-tab ${activeTab === "approval" ? "active" : ""}`}
            onClick={() => setActiveTab("approval")}
          >
            <i className="fas fa-check-circle"></i>
            Approval Status
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
                <label>Institute Name</label>
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
                    {institute?.name || "Not specified"}
                  </span>
                )}
              </div>
              <div className="profile-field">
                <label>Institute Code</label>
                <span className="profile-value">{institute?.code}</span>
              </div>
              <div className="profile-field">
                <label>Institute Type</label>
                {isEditing ? (
                  <select
                    value={editedData?.type || ""}
                    onChange={(e) =>
                      handleInputChange("type", e.target.value)
                    }
                    className="profile-input"
                  >
                    <option value="University">University</option>
                    <option value="StandaloneCollege">Standalone College</option>
                  </select>
                ) : (
                  <span className="profile-value">
                    {institute?.type || "Not specified"}
                  </span>
                )}
              </div>
              <div className="profile-field">
                <label>Email Address</label>
                <span className="profile-value">{institute?.email}</span>
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
                    placeholder="https://institute.edu"
                  />
                ) : (
                  <span className="profile-value">
                    {institute?.website ? (
                      <a href={institute.website} target="_blank" rel="noopener noreferrer">
                        {institute.website}
                      </a>
                    ) : (
                      "Not specified"
                    )}
                  </span>
                )}
              </div>
              <div className="profile-field">
                <label>Student Count</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedData?.studentCount || 0}
                    onChange={(e) =>
                      handleInputChange("studentCount", parseInt(e.target.value))
                    }
                    className="profile-input"
                    min="0"
                  />
                ) : (
                  <span className="profile-value">
                    {institute?.studentCount?.toLocaleString() || 0}
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
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                ) : (
                  <span className="profile-value">
                    <span className={`status-badge ${institute?.status?.toLowerCase()}`}>
                      {institute?.status}
                    </span>
                  </span>
                )}
              </div>
              <div className="profile-field">
                <label>Created Date</label>
                <span className="profile-value">
                  {formatDate(institute?.createdAt)}
                </span>
              </div>
              <div className="profile-field">
                <label>Last Updated</label>
                <span className="profile-value">
                  {formatDate(institute?.updatedAt)}
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
                <span className="profile-value">{institute?.email}</span>
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
                    {institute?.contactNumber || "Not specified"}
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
                    placeholder="https://institute.edu"
                  />
                ) : (
                  <span className="profile-value">
                    {institute?.website ? (
                      <a href={institute.website} target="_blank" rel="noopener noreferrer">
                        {institute.website}
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
                    {institute?.address
                      ? `${institute.address.line1 || ""} ${
                          institute.address.line2 || ""
                        }, ${institute.address.city || ""}, ${
                          institute.address.state || ""
                        }, ${institute.address.country || ""} - ${
                          institute.address.pincode || ""
                        }`
                          .replace(/\s+/g, " ")
                          .trim()
                      : "Not specified"}
                  </span>
                )}
              </div>
              <div className="profile-field">
                <label>Display City</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData?.location?.city || ""}
                    onChange={(e) =>
                      handleInputChange("location.city", e.target.value)
                    }
                    className="profile-input"
                    placeholder="City for display"
                  />
                ) : (
                  <span className="profile-value">
                    {institute?.location?.city || "Not specified"}
                  </span>
                )}
              </div>
              <div className="profile-field">
                <label>Display State</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData?.location?.state || ""}
                    onChange={(e) =>
                      handleInputChange("location.state", e.target.value)
                    }
                    className="profile-input"
                    placeholder="State for display"
                  />
                ) : (
                  <span className="profile-value">
                    {institute?.location?.state || "Not specified"}
                  </span>
                )}
              </div>
              <div className="profile-field">
                <label>Display Country</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData?.location?.country || ""}
                    onChange={(e) =>
                      handleInputChange("location.country", e.target.value)
                    }
                    className="profile-input"
                    placeholder="Country for display"
                  />
                ) : (
                  <span className="profile-value">
                    {institute?.location?.country || "Not specified"}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "colleges" && (
          <div className="personal-info-section">
            <h2 className="section-title">Colleges ({institute?.colleges?.length || 0})</h2>
            <div className="colleges-section">
              <div className="colleges-list">
                {institute?.colleges?.length > 0 ? (
                  institute.colleges.map((college, index) => (
                    <div key={index} className="college-item">
                      <div className="college-avatar">
                        {college.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="college-details">
                        <h4>{college.name}</h4>
                        <p>College Code: {college.code}</p>
                        <span className="college-type">{college.type}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No colleges added yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "approval" && (
          <div className="personal-info-section">
            <h2 className="section-title">Approval Status</h2>
            <div className="approval-section">
              <div className="approval-status-card">
                <div className="approval-header">
                  <h3>Current Status</h3>
                  <span className={`approval-badge ${institute?.approvalStatus?.toLowerCase()}`}>
                    {institute?.approvalStatus}
                  </span>
                </div>
                <div className="approval-details">
                  <div className="approval-field">
                    <label>Approval Status:</label>
                    <span>{institute?.approvalStatus}</span>
                  </div>
                  <div className="approval-field">
                    <label>Approved By:</label>
                    <span>
                      {institute?.approvedBy?.name?.first} {institute?.approvedBy?.name?.last}
                    </span>
                  </div>
                  <div className="approval-field">
                    <label>Approved At:</label>
                    <span>{formatDate(institute?.approvedAt)}</span>
                  </div>
                  <div className="approval-field">
                    <label>Institute Status:</label>
                    <span className={`status-badge ${institute?.status?.toLowerCase()}`}>
                      {institute?.status}
                    </span>
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

export default InstituteProfile;
