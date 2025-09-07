import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { facultyService } from "../../services/authService";
import "./Faculty.css";

const FacultyDashboard = () => {
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
      const response = await facultyService.getFacultyDashboard(id);
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "#10b981";
      case "rejected":
        return "#ef4444";
      case "pending":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const handleNavigate = (path) => {
    navigate(`/faculty/${path}/${id}`);
  };

  const handleReviewAchievement = (achievementId, studentId) => {
    navigate(`/faculty/review/${id}/${achievementId}/${studentId}`);
  };

  if (loading) {
    return (
      <div className="faculty-dashboard">
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
      <div className="faculty-dashboard">
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

  if (!dashboardData || !dashboardData.faculty) {
    return (
      <div className="faculty-dashboard">
        <div className="dashboard-content">
          <div className="no-data-container">
            <div className="no-data-icon">
              <i className="fas fa-user-slash"></i>
            </div>
            <h2>Faculty Not Found</h2>
            <p>The requested faculty data could not be found.</p>
            <button onClick={fetchDashboardData} className="retry-btn">
              <i className="fas fa-redo"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { faculty, stats, pendingReviews, recentActivities, studentStats } =
    dashboardData;
  const facultyFirstName = faculty?.name?.first || "Faculty";
  const facultyLastName = faculty?.name?.last || "";
  const fullName = `${facultyFirstName} ${facultyLastName}`.trim();

  return (
    <div className="faculty-dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>Welcome back, {faculty?.designation} {facultyFirstName}!</h1>
          <p>
            {faculty?.department?.name || "Department not specified"} •{" "}
            {faculty?.designation || "Faculty"}
            {faculty?.facultyID && ` • ID: ${faculty.facultyID}`}
          </p>
          {faculty?.isCoordinator && (
            <span className="coordinator-badge">
              <i className="fas fa-star"></i>
              Coordinator
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon students">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Students</div>
              <div className="stat-number">{stats?.totalStudents || 0}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Pending Reviews</div>
              <div className="stat-number">{stats?.pendingReviews || 0}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon approved">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Approved This Week</div>
              <div className="stat-number">{stats?.approvedThisWeek || 0}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon achievements">
              <i className="fas fa-trophy"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Reviews</div>
              <div className="stat-number">{stats?.totalReviews || 0}</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="main-content-grid">
          {/* Pending Reviews */}
          <div className="content-card reviews-card">
            <div className="card-header">
              <h2>Pending Reviews</h2>
              <button
                className="view-all-btn"
                onClick={() => handleNavigate("reviews")}
              >
                View All
              </button>
            </div>
            <div className="reviews-list">
              {pendingReviews && pendingReviews.length > 0 ? (
                pendingReviews.slice(0, 5).map((review, index) => (
                  <div key={index} className="review-item">
                    <div className="review-icon">
                      <i className="fas fa-file-alt"></i>
                    </div>
                    <div className="review-content">
                      <h3>{review.achievement?.title || "Untitled Achievement"}</h3>
                      <p>
                        {review.student?.name?.first} {review.student?.name?.last} •{" "}
                        {review.achievement?.type || "General"} •{" "}
                        {formatDate(review.achievement?.uploadedAt)}
                      </p>
                    </div>
                    <div className="review-actions">
                      <button
                        className="review-btn"
                        onClick={() =>
                          handleReviewAchievement(
                            review.achievement?._id,
                            review.student?._id
                          )
                        }
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="fas fa-clipboard-check"></i>
                  </div>
                  <h3>No Pending Reviews</h3>
                  <p>All student achievements have been reviewed!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="sidebar">
            {/* Student Statistics */}
            <div className="content-card student-stats-card">
              <h2>Student Statistics</h2>
              <div className="student-stats">
                <div className="stat-item">
                  <div className="stat-header">
                    <span>Active Students</span>
                    <span className="stat-value">
                      {studentStats?.active || 0}
                    </span>
                  </div>
                  <div className="stat-bar">
                    <div
                      className="stat-fill active"
                      style={{
                        width: `${
                          ((studentStats?.active || 0) /
                            Math.max(stats?.totalStudents || 1, 1)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-header">
                    <span>High Performers</span>
                    <span className="stat-value">
                      {studentStats?.highPerformers || 0}
                    </span>
                  </div>
                  <div className="stat-bar">
                    <div
                      className="stat-fill high-performer"
                      style={{
                        width: `${
                          ((studentStats?.highPerformers || 0) /
                            Math.max(stats?.totalStudents || 1, 1)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-header">
                    <span>Recent Submissions</span>
                    <span className="stat-value">
                      {studentStats?.recentSubmissions || 0}
                    </span>
                  </div>
                  <div className="stat-bar">
                    <div
                      className="stat-fill recent"
                      style={{
                        width: `${Math.min(
                          ((studentStats?.recentSubmissions || 0) / 10) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="content-card activities-card">
              <h2>Recent Activities</h2>
              <div className="activities-list">
                {recentActivities && recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-indicator">
                        <div
                          className="activity-dot"
                          style={{
                            backgroundColor: getStatusColor(activity.action),
                          }}
                        ></div>
                      </div>
                      <div className="activity-content">
                        <h3>{activity.description}</h3>
                        <p>{formatDate(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-activities">
                    <div className="activity-indicator">
                      <div className="activity-dot"></div>
                    </div>
                    <div className="activity-content">
                      <h3>No recent activities</h3>
                      <p>Your activity will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button
              className="action-btn primary"
              onClick={() => handleNavigate("reviews")}
            >
              <i className="fas fa-clipboard-list"></i>
              Review Achievements
            </button>
            <button
              className="action-btn secondary"
              onClick={() => handleNavigate("students")}
            >
              <i className="fas fa-users"></i>
              View Students
            </button>
            <button
              className="action-btn secondary"
              onClick={() => handleNavigate("analytics")}
            >
              <i className="fas fa-chart-bar"></i>
              Analytics
            </button>
            <button
              className="action-btn secondary"
              onClick={() => handleNavigate("reports")}
            >
              <i className="fas fa-file-export"></i>
              Generate Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
