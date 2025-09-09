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

  const { institute, stats, recentStudents, recentEvents, departmentStats } =
    dashboardData;

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
        <div
          className="quick-stat-card"
          onClick={() => handleNavigate("colleges")}
        >
          <div className="quick-stat-icon">
            <i className="fas fa-building"></i>
          </div>
          <div className="quick-stat-number">{stats.totalColleges}</div>
          <div className="quick-stat-label">Colleges</div>
        </div>

        <div
          className="quick-stat-card"
          onClick={() => handleNavigate("departments")}
        >
          <div className="quick-stat-icon">
            <i className="fas fa-graduation-cap"></i>
          </div>
          <div className="quick-stat-number">{stats.totalDepartments}</div>
          <div className="quick-stat-label">Departments</div>
        </div>

        <div
          className="quick-stat-card"
          onClick={() => handleNavigate("faculty")}
        >
          <div className="quick-stat-icon">
            <i className="fas fa-chalkboard-teacher"></i>
          </div>
          <div className="quick-stat-number">{stats.totalFaculty}</div>
          <div className="quick-stat-label">Faculty Members</div>
        </div>

        <div
          className="quick-stat-card"
          onClick={() => handleNavigate("students")}
        >
          <div className="quick-stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="quick-stat-number">{stats.totalStudents}</div>
          <div className="quick-stat-label">Students</div>
        </div>

        <div
          className="quick-stat-card"
          onClick={() => handleNavigate("events")}
        >
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
              className="management-btn departments"
              onClick={() => handleNavigate("departments")}
            >
              <i className="fas fa-graduation-cap"></i>
              <span>Manage Departments</span>
              <small>{stats.totalDepartments} departments</small>
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
          </div>
        </div>

        {/* Department Overview */}
        <div className="dashboard-card">
          <h3>
            <i className="fas fa-chart-pie"></i>
            Department Overview
          </h3>
          <div className="department-overview">
            {departmentStats.slice(0, 5).map((dept, index) => (
              <div key={index} className="department-item">
                <div className="department-info">
                  <div className="department-name">{dept.name}</div>
                  <div className="department-college">{dept.college}</div>
                </div>
                <div className="department-stats">
                  <div className="stat">
                    <span className="stat-value">{dept.facultyCount}</span>
                    <span className="stat-label">Faculty</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{dept.studentCount}</span>
                    <span className="stat-label">Students</span>
                  </div>
                </div>
              </div>
            ))}
            {departmentStats.length > 5 && (
              <button
                className="view-all-btn"
                onClick={() => handleNavigate("departments")}
              >
                View All {departmentStats.length} Departments
              </button>
            )}
          </div>
        </div>

        {/* Recent Students */}
        <div className="dashboard-card">
          <h3>
            <i className="fas fa-user-plus"></i>
            Recent Students
          </h3>
          <div className="recent-list">
            {recentStudents.length > 0 ? (
              recentStudents.map((student, index) => (
                <div key={index} className="recent-item">
                  <div className="recent-avatar">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="recent-info">
                    <div className="recent-name">{student.name}</div>
                    <div className="recent-meta">
                      {student.department} •{" "}
                      {new Date(student.joinDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No recent students</p>
            )}
            <button
              className="view-all-btn"
              onClick={() => handleNavigate("students")}
            >
              View All Students
            </button>
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

        {/* Analytics Card */}
        <div className="dashboard-card analytics-card">
          <h3>
            <i className="fas fa-chart-line"></i>
            Institute Analytics
          </h3>
          <div className="analytics-preview">
            <div className="analytics-stat">
              <div className="analytics-value">{stats.activeStudents}</div>
              <div className="analytics-label">Active Students</div>
              <div className="analytics-change positive">
                +
                {Math.round((stats.activeStudents / stats.totalStudents) * 100)}
                %
              </div>
            </div>

            <div className="analytics-stat">
              <div className="analytics-value">{stats.activeFaculty}</div>
              <div className="analytics-label">Active Faculty</div>
              <div className="analytics-change positive">
                +{Math.round((stats.activeFaculty / stats.totalFaculty) * 100)}%
              </div>
            </div>

            <div className="analytics-stat">
              <div className="analytics-value">{stats.recentEvents}</div>
              <div className="analytics-label">Upcoming Events</div>
              <div className="analytics-change neutral">
                {Math.round((stats.recentEvents / stats.totalEvents) * 100)}%
              </div>
            </div>
          </div>

          <button
            className="analytics-btn"
            onClick={() => handleNavigate("analytics")}
          >
            <i className="fas fa-chart-bar"></i>
            View Detailed Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstituteDashboard;
