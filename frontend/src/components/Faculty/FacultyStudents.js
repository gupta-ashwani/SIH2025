import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { facultyService } from "../../services/authService";
import "./Faculty.css";

const FacultyStudents = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStudents();
  }, [id]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await facultyService.getStudents(id);
      setStudents(response.data.students || []);
    } catch (error) {
      console.error("Students error:", error);
      setError(error.response?.data?.error || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudent = (studentId) => {
    navigate(`/students/dashboard/${studentId}`);
  };

  const handleViewPortfolio = (studentId) => {
    navigate(`/students/portfolio/${studentId}`);
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const getPerformanceLevel = (score) => {
    if (score >= 80) return "High";
    if (score >= 60) return "Medium";
    return "Low";
  };

  // Filter students based on search term
  const filteredStudents = students.filter((student) => {
    if (!searchTerm) return true;

    const fullName = `${student.name?.first || ""} ${
      student.name?.last || ""
    }`.toLowerCase();
    const studentId = (student.studentID || "").toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    return fullName.includes(searchLower) || studentId.includes(searchLower);
  });

  const sortedStudents = filteredStudents.sort((a, b) => {
    switch (sortBy) {
      case "name":
        return `${a.name?.first || ""} ${a.name?.last || ""}`.localeCompare(
          `${b.name?.first || ""} ${b.name?.last || ""}`
        );
      case "performance":
        return (b.performanceScore || 0) - (a.performanceScore || 0);
      case "achievements":
        return (b.achievementCount || 0) - (a.achievementCount || 0);
      case "recent":
        return new Date(b.lastActivity || 0) - new Date(a.lastActivity || 0);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="faculty-dashboard">
        <div className="dashboard-content">
          <div className="loading-container">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <p>Loading students...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="faculty-dashboard">
      {/* Welcome Section - Full Width */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>My Students</h1>
          <p>Manage and monitor your assigned students</p>
        </div>
      </div>

      {/* Students Controls */}
      <div className="students-controls">
        <div className="search-and-sort">
          {/* Search Box */}
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by name or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Sort Dropdown */}
          <div className="sort-dropdown">
            <label htmlFor="sort-select">Sort by:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Name</option>
              <option value="performance">Performance</option>
              <option value="achievements">Achievements</option>
              <option value="recent">Recent Activity</option>
            </select>
          </div>
        </div>

        <div className="students-summary">
          <span className="student-count">
            {filteredStudents.length === students.length
              ? `${students.length} Student${students.length !== 1 ? "s" : ""}`
              : `${filteredStudents.length} of ${students.length} Student${
                  students.length !== 1 ? "s" : ""
                }`}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Students List */}
        <div className="students-container">
          {sortedStudents.length > 0 ? (
            <div className="students-list">
              {sortedStudents.map((student, index) => (
                <div
                  key={student._id || index}
                  className="student-list-item"
                  onClick={() => handleViewStudent(student._id)}
                >
                  <div className="student-list-avatar">
                    {student.profileImage ? (
                      <>
                        <img
                          src={student.profileImage}
                          alt={`${student.name?.first} ${student.name?.last}`}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                        <div
                          className="student-list-avatar-fallback"
                          style={{ display: "none" }}
                        >
                          {student.name?.first?.charAt(0) || "S"}
                        </div>
                      </>
                    ) : (
                      <div className="student-list-avatar-fallback">
                        {student.name?.first?.charAt(0) || "S"}
                      </div>
                    )}
                  </div>

                  <div className="student-list-info">
                    <div className="student-list-main">
                      <h3 className="student-list-name">
                        {student.name?.first} {student.name?.last}
                      </h3>
                      <span className="student-list-id">
                        ID: {student.studentID}
                      </span>
                    </div>
                    <div className="student-list-details">
                      <span className="student-list-batch">
                        Batch: {student.batch}
                      </span>
                      <span className="student-list-achievements">
                        <i className="fas fa-trophy"></i>
                        {student.achievementCount || 0} Achievements
                      </span>
                    </div>
                  </div>

                  <div className="student-list-stats">
                    <div className="student-list-stat">
                      <span className="stat-value">
                        {student.cgpa ? `${student.cgpa.toFixed(2)}/10` : "N/A"}
                      </span>
                      <span className="stat-label">CGPA</span>
                    </div>
                    <div className="student-list-stat">
                      <span className="stat-value">
                        {student.pendingReviews || 0}
                      </span>
                      <span className="stat-label">Pending</span>
                    </div>
                  </div>

                  <div className="student-list-action">
                    <i className="fas fa-chevron-right"></i>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3>No Students Found</h3>
              <p>
                {searchTerm
                  ? `No students match "${searchTerm}". Try searching with a different name or student ID.`
                  : "No students assigned to you yet"}
              </p>
              {searchTerm && (
                <button className="cta-btn" onClick={() => setSearchTerm("")}>
                  <i className="fas fa-times"></i>
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyStudents;
