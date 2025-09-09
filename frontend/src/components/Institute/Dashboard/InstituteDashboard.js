import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { instituteService } from "../../../services/authService";
import "./InstituteDashboard.css";

const InstituteDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await instituteService.getInstituteDashboard(id);
      setDashboardData(response.data);
    } catch (error) {
      setError("Failed to load dashboard data");
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleNavigate = (route) => {
    navigate(`/institute/${id}/${route}`);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <div className="alert alert-danger">
          <h4>Error Loading Dashboard</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const { institute, stats, recentStudents, recentEvents } = dashboardData;

  return (
    <div className="institute-dashboard">
      {/* Welcome Section */}
      <div className="dashboard-card welcome-section">
        <div className="welcome-content">
          <div className="welcome-text">
            <h1>{institute.name}</h1>
            <p>Institute Dashboard - Comprehensive Management Overview</p>
            <div className="institute-meta">
              <span className="institute-code">Code: {institute.code}</span>
              <span className="institute-type">Type: {institute.type}</span>
            </div>
          </div>
          <div className="welcome-icon">
            <i className="fas fa-university"></i>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="quick-stat-card static">
          <div className="quick-stat-icon">
            <i className="fas fa-building"></i>
          </div>
          <div className="quick-stat-number">{stats.totalColleges}</div>
          <div className="quick-stat-label">Colleges</div>
        </div>

        <div className="quick-stat-card static">
          <div className="quick-stat-icon">
            <i className="fas fa-chalkboard-teacher"></i>
          </div>
          <div className="quick-stat-number">{stats.totalFaculty}</div>
          <div className="quick-stat-label">Faculty Members</div>
        </div>

        <div className="quick-stat-card static">
          <div className="quick-stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="quick-stat-number">{stats.totalStudents}</div>
          <div className="quick-stat-label">Students</div>
        </div>

        <div className="quick-stat-card static">
          <div className="quick-stat-icon">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div className="quick-stat-number">{stats.totalEvents}</div>
          <div className="quick-stat-label">Events</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Management Sections */}
        <div className="dashboard-card management-card">
          <h3>
            <i className="fas fa-cogs"></i>
            Quick Management
          </h3>
          <div className="management-buttons">
            <button
              className="management-btn colleges"
              onClick={() => handleNavigate("colleges")}
            >
              <i className="fas fa-building"></i>
              <span>Manage Colleges</span>
              <small>{stats.totalColleges} colleges</small>
            </button>

            <button
              className="management-btn faculty"
              onClick={() => handleNavigate("faculty")}
            >
              <i className="fas fa-chalkboard-teacher"></i>
              <span>Manage Faculty</span>
              <small>{stats.activeFaculty} active</small>
            </button>

            <button
              className="management-btn students"
              onClick={() => handleNavigate("students")}
            >
              <i className="fas fa-users"></i>
              <span>Manage Students</span>
              <small>{stats.activeStudents} active</small>
            </button>
            <button
              className="management-btn reports"
              onClick={() => handleNavigate("reports")}
            >
              <i className="fas fa-file-alt"></i>
              <span>Generate Report</span>
            </button>
          </div>
        </div>

        {/* College Overview */}
        <div className="dashboard-card">
          <h3>
            <i className="fas fa-university"></i>
            College Overview
          </h3>
          <div className="college-overview">
            {dashboardData.collegeStats &&
              dashboardData.collegeStats.slice(0, 2).map((college, index) => (
                <div key={index} className="college-item">
                  <div className="college-info">
                    <div className="college-name">{college.name}</div>
                    <div className="college-type">
                      {college.type || "Engineering College"}
                    </div>
                  </div>
                  <div className="college-stats">
                    <div className="stat">
                      <span className="stat-value">
                        {college.departmentCount}
                      </span>
                      <span className="stat-label">Departments</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{college.facultyCount}</span>
                      <span className="stat-label">Faculty</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{college.studentCount}</span>
                      <span className="stat-label">Students</span>
                    </div>
                  </div>
                </div>
              ))}
            {dashboardData.collegeStats &&
              dashboardData.collegeStats.length > 2 && (
                <button
                  className="view-all-btn"
                  onClick={() => handleNavigate("colleges")}
                >
                  Show More Colleges ({dashboardData.collegeStats.length} total)
                </button>
              )}
            {(!dashboardData.collegeStats ||
              dashboardData.collegeStats.length === 0) && (
              <p className="no-data">No colleges found</p>
            )}
          </div>
        </div>

        {/* Recent Events */}
        <div className="dashboard-card">
          <h3>
            <i className="fas fa-calendar"></i>
            Recent Events
          </h3>
          <div className="recent-list">
            {recentEvents.length > 0 ? (
              recentEvents.map((event, index) => (
                <div key={index} className="recent-item">
                  <div className="recent-avatar event-avatar">
                    <i className="fas fa-calendar-day"></i>
                  </div>
                  <div className="recent-info">
                    <div className="recent-name">{event.title}</div>
                    <div className="recent-meta">
                      {event.eventType} •{" "}
                      {new Date(event.eventDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`event-status ${event.status.toLowerCase()}`}>
                    {event.status}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No recent events</p>
            )}
            <button
              className="view-all-btn"
              onClick={() => handleNavigate("events")}
            >
              View All Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstituteDashboard;
