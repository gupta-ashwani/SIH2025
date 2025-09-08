import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { studentService } from "../../services/authService";
import "./Student.css";

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    fetchStudentProfile();
  }, [id]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const response = await studentService.getStudentProfile(id);
      setStudent(response.data.student);
      setEditedData(response.data.student);
    } catch (error) {
      console.error("Profile error:", error);
      setError(error.response?.data?.error || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await studentService.updateProfile(id, editedData);
      setStudent(editedData);
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
    if (!name) return "S";
    const { first, last } = name;
    return `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`;
  };

  if (loading) {
    return (
      <div className="student-dashboard">
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
      <div className="student-dashboard">
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
    <div className="student-dashboard">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {student?.profilePicture ? (
                <img
                  src={student.profilePicture}
                  alt="Profile"
                  className="profile-image"
                />
              ) : (
                <span className="profile-initials">
                  {getInitials(student?.name)}
                </span>
              )}
            </div>
            <div className="profile-basic-info">
              <h1 className="profile-name">
                {student?.name?.first} {student?.name?.last}
              </h1>
              <p className="profile-id">Student ID: {student?.studentID}</p>
              <p className="profile-department">
                {student?.course} - {student?.department?.name}
              </p>
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-value">
                    {student?.gpa?.toFixed(2) || "N/A"}
                  </span>
                  <span className="stat-label">CGPA</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {student?.achievements?.length || 0}
                  </span>
                  <span className="stat-label">Achievements</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {student?.attendance
                      ? student.attendance.toFixed(2)
                      : "0.00"}
                    %
                  </span>
                  <span className="stat-label">Attendance</span>
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
                    setEditedData(student);
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
            className={`nav-tab ${activeTab === "academic" ? "active" : ""}`}
            onClick={() => setActiveTab("academic")}
          >
            <i className="fas fa-graduation-cap"></i>
            Academic Details
          </button>
          <button
            className={`nav-tab ${activeTab === "contact" ? "active" : ""}`}
            onClick={() => setActiveTab("contact")}
          >
            <i className="fas fa-address-book"></i>
            Contact Info
          </button>
          <button
            className={`nav-tab ${activeTab === "skills" ? "active" : ""}`}
            onClick={() => setActiveTab("skills")}
          >
            <i className="fas fa-cogs"></i>
            Skills & Interests
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
                    {student?.name?.first || "Not specified"}
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
                    {student?.name?.last || "Not specified"}
                  </span>
                )}
              </div>
              <div className="profile-field">
                <label>Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editedData?.dateOfBirth?.split("T")[0] || ""}
                    onChange={(e) =>
                      handleInputChange("dateOfBirth", e.target.value)
                    }
                    className="profile-input"
                  />
                ) : (
                  <span className="profile-value">
                    {formatDate(student?.dateOfBirth)}
                  </span>
                )}
              </div>
              <div className="profile-field">
                <label>Gender</label>
                {isEditing ? (
                  <select
                    value={editedData?.gender || ""}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                    className="profile-input"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <span className="profile-value">
                    {student?.gender || "Not specified"}
                  </span>
                )}
              </div>
              <div className="profile-field full-width">
                <label>Bio</label>
                {isEditing ? (
                  <textarea
                    value={editedData?.bio || ""}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="profile-textarea"
                    placeholder="Tell us about yourself..."
                    rows="4"
                  />
                ) : (
                  <span className="profile-value">
                    {student?.bio || "No bio available"}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "academic" && (
          <div className="personal-info-section">
            <h2 className="section-title">Academic Details</h2>
            <div className="profile-grid">
              <div className="profile-field">
                <label>Student ID</label>
                <span className="profile-value">{student?.studentID}</span>
              </div>
              <div className="profile-field">
                <label>Course</label>
                <span className="profile-value">{student?.course}</span>
              </div>
              <div className="profile-field">
                <label>Department</label>
                <span className="profile-value">
                  {student?.department?.name}
                </span>
              </div>
              <div className="profile-field">
                <label>Year</label>
                <span className="profile-value">{student?.year}</span>
              </div>
              <div className="profile-field">
                <label>Batch</label>
                <span className="profile-value">{student?.batch}</span>
              </div>
              <div className="profile-field">
                <label>Enrollment Year</label>
                <span className="profile-value">{student?.enrollmentYear}</span>
              </div>
              <div className="profile-field">
                <label>Current CGPA</label>
                <span className="profile-value">
                  {student?.gpa?.toFixed(2) || "N/A"}
                </span>
              </div>
              <div className="profile-field">
                <label>Attendance</label>
                <span className="profile-value">
                  {student?.attendance ? student.attendance.toFixed(2) : "0.00"}
                  %
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
                <span className="profile-value">{student?.email}</span>
              </div>
              <div className="profile-field">
                <label>Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedData?.contact?.phone || ""}
                    onChange={(e) =>
                      handleInputChange("contact.phone", e.target.value)
                    }
                    className="profile-input"
                  />
                ) : (
                  <span className="profile-value">
                    {student?.contact?.phone || "Not specified"}
                  </span>
                )}
              </div>
              <div className="profile-field full-width">
                <label>Address</label>
                {isEditing ? (
                  <textarea
                    value={editedData?.contact?.address || ""}
                    onChange={(e) =>
                      handleInputChange("contact.address", e.target.value)
                    }
                    className="profile-textarea"
                    placeholder="Enter your address..."
                    rows="3"
                  />
                ) : (
                  <span className="profile-value">
                    {student?.contact?.address || "Not specified"}
                  </span>
                )}
              </div>
              <div className="profile-field">
                <label>Emergency Contact Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData?.emergencyContact?.name || ""}
                    onChange={(e) =>
                      handleInputChange("emergencyContact.name", e.target.value)
                    }
                    className="profile-input"
                  />
                ) : (
                  <span className="profile-value">
                    {student?.emergencyContact?.name || "Not specified"}
                  </span>
                )}
              </div>
              <div className="profile-field">
                <label>Emergency Contact Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedData?.emergencyContact?.phone || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "emergencyContact.phone",
                        e.target.value
                      )
                    }
                    className="profile-input"
                  />
                ) : (
                  <span className="profile-value">
                    {student?.emergencyContact?.phone || "Not specified"}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "skills" && (
          <div className="personal-info-section">
            <h2 className="section-title">Skills & Interests</h2>
            <div className="skills-section">
              <div className="skills-grid">
                <div className="profile-field full-width">
                  <label>Technical Skills</label>
                  {isEditing ? (
                    <textarea
                      value={editedData?.skills?.technical?.join(", ") || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "skills.technical",
                          e.target.value.split(", ").filter((s) => s.trim())
                        )
                      }
                      className="profile-textarea"
                      placeholder="Enter skills separated by commas (e.g., JavaScript, Python, React)"
                      rows="3"
                    />
                  ) : (
                    <div className="skills-display">
                      {student?.skills?.technical?.length > 0 ? (
                        student.skills.technical.map((skill, index) => (
                          <span key={index} className="skill-tag technical">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="profile-value">
                          No technical skills added
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="profile-field full-width">
                  <label>Soft Skills</label>
                  {isEditing ? (
                    <textarea
                      value={editedData?.skills?.soft?.join(", ") || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "skills.soft",
                          e.target.value.split(", ").filter((s) => s.trim())
                        )
                      }
                      className="profile-textarea"
                      placeholder="Enter skills separated by commas (e.g., Leadership, Communication, Teamwork)"
                      rows="3"
                    />
                  ) : (
                    <div className="skills-display">
                      {student?.skills?.soft?.length > 0 ? (
                        student.skills.soft.map((skill, index) => (
                          <span key={index} className="skill-tag soft">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="profile-value">
                          No soft skills added
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="profile-field full-width">
                  <label>Interests & Hobbies</label>
                  {isEditing ? (
                    <textarea
                      value={editedData?.interests?.join(", ") || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "interests",
                          e.target.value.split(", ").filter((s) => s.trim())
                        )
                      }
                      className="profile-textarea"
                      placeholder="Enter interests separated by commas (e.g., Photography, Reading, Sports)"
                      rows="3"
                    />
                  ) : (
                    <div className="skills-display">
                      {student?.interests?.length > 0 ? (
                        student.interests.map((interest, index) => (
                          <span key={index} className="skill-tag interest">
                            {interest}
                          </span>
                        ))
                      ) : (
                        <span className="profile-value">
                          No interests added
                        </span>
                      )}
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

export default StudentProfile;
