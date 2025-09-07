import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { studentService } from "../../services/authService";
import "./Student.css";

const StudentDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, [id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await studentService.getStudentDashboard(id);
      setDashboardData(response.data);
    } catch (error) {
      console.error("Dashboard error:", error);
      setError(error.response?.data?.error || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Date not available";
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "Course":
      case "Certification":
        return "fas fa-certificate";
      case "Internship":
        return "fas fa-briefcase";
      case "Competition":
      case "Hackathon":
        return "fas fa-trophy";
      case "Workshop":
      case "Conference":
        return "fas fa-chalkboard-teacher";
      case "CommunityService":
        return "fas fa-hands-helping";
      case "Leadership":
        return "fas fa-users-cog";
      default:
        return "fas fa-star";
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "#10b981"; // Green
    if (percentage >= 60) return "#f59e0b"; // Yellow
    return "#ef4444"; // Red
  };

  const handleNavigate = (path) => {
    navigate(`/students/${path}/${id}`);
  };

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="dashboard-content">
          <div className="loading-container">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <p>Loading dashboard...</p>
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
            <h2>Error Loading Dashboard</h2>
            <p>{error}</p>
            <button onClick={fetchDashboardData} className="retry-btn">
              <i className="fas fa-redo"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData || !dashboardData.student) {
    return (
      <div className="student-dashboard">
        <div className="dashboard-content">
          <div className="no-data-container">
            <div className="no-data-icon">
              <i className="fas fa-user-slash"></i>
            </div>
            <h2>Student Not Found</h2>
            <p>The requested student data could not be found.</p>
            <button onClick={fetchDashboardData} className="retry-btn">
              <i className="fas fa-redo"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { student, stats, recentActivities, academicProgress, upcomingEvents } =
    dashboardData;
  const studentFirstName = student?.name?.first || "Student";
  const studentLastName = student?.name?.last || "";
  const fullName = `${studentFirstName} ${studentLastName}`.trim();

  return (
    <div className="student-dashboard">
      {/* Welcome Section - Full Width */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>Welcome back, {studentFirstName}!</h1>
          <p>
            {student?.department?.name || "Department not specified"} •{" "}
            {student?.batch || "Batch not specified"}
            {student?.studentID && ` • Roll No: ${student.studentID}`}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-certificate"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Certifications</div>
              <div className="stat-number">{stats?.certifications || 0}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-briefcase"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Internships</div>
              <div className="stat-number">{stats?.internships || 0}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-trophy"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Competitions</div>
              <div className="stat-number">{stats?.competitions || 0}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-chalkboard-teacher"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Workshops</div>
              <div className="stat-number">{stats?.workshops || 0}</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="main-content-grid">
          {/* Recent Activities */}
          <div className="content-card activities-card">
            <div className="card-header">
              <h2>Recent Activities</h2>
              <button
                className="add-new-btn"
                onClick={() => handleNavigate("upload")}
              >
                + Add New
              </button>
            </div>
            <div className="activities-list">
              {recentActivities && recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      <i className={getActivityIcon(activity.type)}></i>
                    </div>
                    <div className="activity-content">
                      <h3>{activity.title || "Untitled Activity"}</h3>
                      <p>
                        {activity.type || "General"} •{" "}
                        {formatDate(activity.uploadedAt)}
                      </p>
                    </div>
                    <span
                      className={`activity-status status-${(
                        activity.status || "pending"
                      )?.toLowerCase()}`}
                    >
                      {activity.status || "Pending"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="fas fa-inbox"></i>
                  </div>
                  <h3>No Activities Yet</h3>
                  <p>
                    Start building your portfolio by uploading your first
                    achievement!
                  </p>
                  <button
                    className="cta-btn"
                    onClick={() => handleNavigate("upload")}
                  >
                    <i className="fas fa-plus"></i>
                    Add Your First Activity
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="sidebar">
            {/* Academic Progress */}
            <div className="content-card progress-card">
              <h2>Academic Progress</h2>
              <div className="progress-item">
                <div className="progress-header">
                  <span>Overall CGPA</span>
                  <span className="progress-value">
                    {academicProgress?.cgpa
                      ? `${academicProgress.cgpa}/10`
                      : "Not Available"}
                  </span>
                </div>
                {academicProgress?.cgpa ? (
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(academicProgress.cgpa / 10) * 100}%`,
                        backgroundColor: getProgressColor(
                          (academicProgress.cgpa / 10) * 100
                        ),
                      }}
                    ></div>
                  </div>
                ) : (
                  <div className="no-data-bar">No CGPA data available</div>
                )}
              </div>
              <div className="progress-item">
                <div className="progress-header">
                  <span>Attendance</span>
                  <span className="progress-value">
                    {academicProgress?.attendance
                      ? `${academicProgress.attendance}%`
                      : "Not Available"}
                  </span>
                </div>
                {academicProgress?.attendance ? (
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${academicProgress.attendance}%`,
                        backgroundColor: getProgressColor(
                          academicProgress.attendance
                        ),
                      }}
                    ></div>
                  </div>
                ) : (
                  <div className="no-data-bar">
                    No attendance data available
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="content-card events-card">
              <h2>Upcoming Events</h2>
              <div className="events-list">
                {upcomingEvents && upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event, index) => (
                    <div key={index} className="event-item">
                      <div className="event-indicator"></div>
                      <div className="event-content">
                        <h3>{event.title}</h3>
                        <p>{event.date}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-events">
                    <div className="event-indicator"></div>
                    <div className="event-content">
                      <h3>No upcoming events</h3>
                      <p>Check back later for new events</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
