import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { facultyService } from "../../services/authService";
import "./Faculty.css";

const FacultyProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    fetchFacultyProfile();
  }, [id]);

  const fetchFacultyProfile = async () => {
    try {
      setLoading(true);
      // Mock data for now - in real app, this would be an API call
      const mockFaculty = {
        _id: id,
        department: {
          _id: "dept1",
          name: "Computer Science Engineering",
          code: "CSE"
        },
        name: {
          first: "Dr. John",
          last: "Smith"
        },
        facultyID: "FAC001",
        email: "john.smith@university.edu",
        designation: "Professor",
        contactNumber: "+91-9876543210",
        isCoordinator: true,
        students: ["student1", "student2", "student3"],
        achievementsReviewed: [
          {
            achievementId: "ach1",
            studentId: "student1",
            status: "Approved",
            comment: "Excellent work",
            reviewedAt: "2024-01-15"
          }
        ],
        status: "Active",
        createdAt: "2023-01-15",
        updatedAt: "2024-01-15"
      };
      setFaculty(mockFaculty);
      setEditedData(mockFaculty);
    } catch (error) {
      console.error("Profile error:", error);
      setError(error.response?.data?.error || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Mock API call - in real app, this would be an actual API call
      // await facultyService.updateProfile(id, editedData);
      setFaculty(editedData);
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
    if (!name) return "F";
    const { first, last } = name;
    return `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`;
  };

  if (loading) {
    return (
      <div className="faculty-dashboard">
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
      <div className="faculty-dashboard">
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
    <div className="faculty-dashboard">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              <span className="profile-initials">
                {getInitials(faculty?.name)}
              </span>
            </div>
            <div className="profile-basic-info">
              <h1 className="profile-name">
                {faculty?.name?.first} {faculty?.name?.last}
              </h1>
              <p className="profile-id">Faculty ID: {faculty?.facultyID}</p>
              <p className="profile-department">
                {faculty?.designation} - {faculty?.department?.name}
              </p>
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-value">
                    {faculty?.students?.length || 0}
                  </span>
                  <span className="stat-label">Students</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {faculty?.achievementsReviewed?.length || 0}
                  </span>
                  <span className="stat-label">Reviews</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {faculty?.isCoordinator ? "Yes" : "No"}
                  </span>
                  <span className="stat-label">Coordinator</span>
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
                    setEditedData(faculty);
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
            className={`nav-tab ${activeTab === "professional" ? "active" : ""}`}
            onClick={() => setActiveTab("professional")}
          >
            <i className="fas fa-briefcase"></i>
            Professional Details
          </button>
          <button
            className={`nav-tab ${activeTab === "contact" ? "active" : ""}`}
            onClick={() => setActiveTab("contact")}
          >
            <i className="fas fa-address-book"></i>
            Contact Info
          </button>
          <button
            className={`nav-tab ${activeTab === "students" ? "active" : ""}`}
            onClick={() => setActiveTab("students")}
          >
            <i className="fas fa-users"></i>
            Students & Reviews
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
                    {faculty?.name?.first || "Not specified"}
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
                    {faculty?.name?.last || "Not specified"}
                  </span>
                )}
              </div>
              <div className="profile-field">
                <label>Faculty ID</label>
                <span className="profile-value">{faculty?.facultyID}</span>
              </div>
              <div className="profile-field">
                <label>Email Address</label>
                <span className="profile-value">{faculty?.email}</span>
              </div>
              <div className="profile-field">
                <label>Status</label>
                <span className="profile-value">
                  <span className={`status-badge ${faculty?.status?.toLowerCase()}`}>
                    {faculty?.status}
                  </span>
                </span>
              </div>
              <div className="profile-field">
                <label>Member Since</label>
                <span className="profile-value">
                  {formatDate(faculty?.createdAt)}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "professional" && (
          <div className="personal-info-section">
            <h2 className="section-title">Professional Details</h2>
            <div className="profile-grid">
              <div className="profile-field">
                <label>Designation</label>
                {isEditing ? (
                  <select
                    value={editedData?.designation || ""}
                    onChange={(e) =>
                      handleInputChange("designation", e.target.value)
                    }
                    className="profile-input"
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Coordinator">Coordinator</option>
                    <option value="HOD">HOD</option>
                  </select>
                ) : (
                  <span className="profile-value">
                    {faculty?.designation || "Not specified"}
                  </span>
                )}
              </div>
              <div className="profile-field">
                <label>Department</label>
                <span className="profile-value">
                  {faculty?.department?.name} ({faculty?.department?.code})
                </span>
              </div>
              <div className="profile-field">
                <label>Is Coordinator</label>
                {isEditing ? (
                  <select
                    value={editedData?.isCoordinator ? "true" : "false"}
                    onChange={(e) =>
                      handleInputChange("isCoordinator", e.target.value === "true")
                    }
                    className="profile-input"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                ) : (
                  <span className="profile-value">
                    {faculty?.isCoordinator ? "Yes" : "No"}
                  </span>
                )}
              </div>
              <div className="profile-field">
                <label>Total Students</label>
                <span className="profile-value">
                  {faculty?.students?.length || 0}
                </span>
              </div>
              <div className="profile-field">
                <label>Achievements Reviewed</label>
                <span className="profile-value">
                  {faculty?.achievementsReviewed?.length || 0}
                </span>
              </div>
              <div className="profile-field">
                <label>Last Updated</label>
                <span className="profile-value">
                  {formatDate(faculty?.updatedAt)}
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
                <span className="profile-value">{faculty?.email}</span>
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
                    {faculty?.contactNumber || "Not specified"}
                  </span>
                )}
              </div>
              <div className="profile-field">
                <label>Faculty ID</label>
                <span className="profile-value">{faculty?.facultyID}</span>
              </div>
              <div className="profile-field">
                <label>Department Contact</label>
                <span className="profile-value">
                  {faculty?.department?.name} Department
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "students" && (
          <div className="personal-info-section">
            <h2 className="section-title">Students & Reviews</h2>
            <div className="students-reviews-section">
              <div className="students-section">
                <h3>Assigned Students</h3>
                <div className="students-list">
                  {faculty?.students?.length > 0 ? (
                    faculty.students.map((studentId, index) => (
                      <div key={index} className="student-item">
                        <div className="student-info">
                          <span className="student-id">Student {index + 1}</span>
                          <span className="student-status">Active</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>No students assigned yet</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="reviews-section">
                <h3>Recent Achievement Reviews</h3>
                <div className="reviews-list">
                  {faculty?.achievementsReviewed?.length > 0 ? (
                    faculty.achievementsReviewed.map((review, index) => (
                      <div key={index} className="review-item">
                        <div className="review-header">
                          <span className="review-status">
                            <span className={`status-badge ${review.status.toLowerCase()}`}>
                              {review.status}
                            </span>
                          </span>
                          <span className="review-date">
                            {formatDate(review.reviewedAt)}
                          </span>
                        </div>
                        <div className="review-content">
                          <p className="review-comment">
                            {review.comment || "No comment provided"}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>No reviews completed yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyProfile;
