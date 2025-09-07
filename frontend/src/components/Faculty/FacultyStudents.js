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
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");

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

  const filteredAndSortedStudents = students
    .filter((student) => {
      const fullName = `${student.name?.first || ""} ${student.name?.last || ""}`.toLowerCase();
      const studentId = (student.studentID || "").toLowerCase();
      const search = searchTerm.toLowerCase();
      
      return fullName.includes(search) || studentId.includes(search);
    })
    .sort((a, b) => {
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
      <div className="faculty-students">
        <div className="loading-container">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
          <p>Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="faculty-students">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <button 
            className="back-btn"
            onClick={() => navigate(`/faculty/dashboard/${id}`)}
          >
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>
          <h1>My Students</h1>
        </div>
      </div>

      {/* Controls */}
      <div className="students-controls">
        <div className="search-and-sort">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search students by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
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
            {filteredAndSortedStudents.length} student{filteredAndSortedStudents.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Students Grid */}
      <div className="students-container">
        {filteredAndSortedStudents.length > 0 ? (
          <div className="students-grid">
            {filteredAndSortedStudents.map((student, index) => (
              <div key={student._id || index} className="student-card">
                <div className="student-card-header">
                  <div className="student-avatar">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="student-info">
                    <h3>
                      {student.name?.first} {student.name?.last}
                    </h3>
                    <p className="student-id">ID: {student.studentID}</p>
                    <p className="student-batch">Batch: {student.batch}</p>
                  </div>
                  <div className="performance-indicator">
                    <div
                      className="performance-circle"
                      style={{
                        borderColor: getPerformanceColor(student.performanceScore || 0),
                      }}
                    >
                      <span
                        style={{
                          color: getPerformanceColor(student.performanceScore || 0),
                        }}
                      >
                        {student.performanceScore || 0}%
                      </span>
                    </div>
                    <span className="performance-label">
                      {getPerformanceLevel(student.performanceScore || 0)} Performer
                    </span>
                  </div>
                </div>

                <div className="student-stats">
                  <div className="stat-item">
                    <div className="stat-icon">
                      <i className="fas fa-trophy"></i>
                    </div>
                    <div className="stat-content">
                      <span className="stat-number">{student.achievementCount || 0}</span>
                      <span className="stat-label">Achievements</span>
                    </div>
                  </div>
                  
                  <div className="stat-item">
                    <div className="stat-icon">
                      <i className="fas fa-clock"></i>
                    </div>
                    <div className="stat-content">
                      <span className="stat-number">{student.pendingReviews || 0}</span>
                      <span className="stat-label">Pending</span>
                    </div>
                  </div>
                  
                  <div className="stat-item">
                    <div className="stat-icon">
                      <i className="fas fa-chart-line"></i>
                    </div>
                    <div className="stat-content">
                      <span className="stat-number">
                        {student.cgpa ? `${student.cgpa}/10` : "N/A"}
                      </span>
                      <span className="stat-label">CGPA</span>
                    </div>
                  </div>
                </div>

                <div className="student-recent-activity">
                  <h4>Recent Activity</h4>
                  {student.recentAchievements && student.recentAchievements.length > 0 ? (
                    <div className="recent-achievements">
                      {student.recentAchievements.slice(0, 2).map((achievement, idx) => (
                        <div key={idx} className="achievement-item">
                          <span className="achievement-title">
                            {achievement.title}
                          </span>
                          <span className="achievement-date">
                            {new Date(achievement.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-activity">No recent activity</p>
                  )}
                </div>

                <div className="student-actions">
                  <button
                    className="action-btn primary"
                    onClick={() => handleViewStudent(student._id)}
                  >
                    <i className="fas fa-eye"></i>
                    View Dashboard
                  </button>
                  <button
                    className="action-btn secondary"
                    onClick={() => handleViewPortfolio(student._id)}
                  >
                    <i className="fas fa-folder"></i>
                    Portfolio
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-users"></i>
            </div>
            <h3>No Students Found</h3>
            <p>
              {searchTerm
                ? `No students match "${searchTerm}"`
                : "No students assigned to you yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyStudents;
