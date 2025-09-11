import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { instituteService } from "../../services/authService";
import "./InstituteDashboard.css";

const InstituteDashboard = () => {
  const { id } = useParams();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await instituteService.getInstituteDashboard(id);
      setDashboardData(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching institute dashboard:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="institute-dashboard-loading">
        <div className="institute-loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="institute-dashboard-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="institute-retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="institute-dashboard-error">
        <h2>No Data Available</h2>
        <p>Unable to load dashboard data</p>
      </div>
    );
  }

  const { institute, statistics, colleges, departments, recentEvents, upcomingEvents, achievementStats } = dashboardData;

  return (
    <div className="institute-dashboard-container">
      {/* Header Section */}
      <div className="institute-dashboard-header">
        <div className="institute-header-content">
          <h1 className="institute-dashboard-title">
            {institute.name || 'Tech Institute of Excellence'}
          </h1>
          <p className="institute-dashboard-subtitle">
            {institute.type || 'University'} • {institute.code || 'TIE'}
          </p>
          <div className="institute-status-badge">
            <span className="institute-status-indicator"></span>
            {institute.status === 'active' ? 'ACTIVE' : (institute.status || 'ACTIVE').toUpperCase()}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="institute-stats-grid">
        <div className="institute-stat-card">
          <div className="institute-stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="institute-stat-content">
            <h3 className="institute-stat-number">{statistics.totalColleges}</h3>
            <p className="institute-stat-label">Colleges</p>
          </div>
        </div>
        
        <div className="institute-stat-card">
          <div className="institute-stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7071C21.7033 16.0601 20.0075 15.6173 19 15.3901" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13C17.0013 3.35715 17.7 4.17 17.7 5.5C17.7 6.83 17.0013 7.64285 16 7.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="institute-stat-content">
            <h3 className="institute-stat-number">{statistics.totalFaculty}</h3>
            <p className="institute-stat-label">Faculty Members</p>
          </div>
        </div>
        
        <div className="institute-stat-card">
          <div className="institute-stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7071C21.7033 16.0601 20.0075 15.6173 19 15.3901" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13C17.0013 3.35715 17.7 4.17 17.7 5.5C17.7 6.83 17.0013 7.64285 16 7.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="institute-stat-content">
            <h3 className="institute-stat-number">{statistics.totalStudents}</h3>
            <p className="institute-stat-label">Students</p>
          </div>
        </div>
        
        <div className="institute-stat-card">
          <div className="institute-stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="institute-stat-content">
            <h3 className="institute-stat-number">{statistics.upcomingEvents}</h3>
            <p className="institute-stat-label">Events</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid - Quick Management and College Overview */}
      <div className="institute-main-content-grid">
        {/* Quick Management Section */}
        <div className="institute-quick-management">
          <div className="institute-section-header">
            <h2 className="institute-section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Quick Management
            </h2>
          </div>
          
          <div className="institute-management-grid">
            <div className="institute-management-card">
              <div className="institute-management-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor"/>
                  <rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor"/>
                  <rect x="14" y="14" width="7" height="7" rx="1" fill="currentColor"/>
                  <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor"/>
                </svg>
              </div>
              <div className="institute-management-content">
                <h3 className="institute-management-title">Manage Colleges</h3>
                <p className="institute-management-subtitle">{statistics.totalColleges} colleges</p>
              </div>
            </div>
            
            <div className="institute-management-card">
              <div className="institute-management-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V10C21 8.89543 20.1046 8 19 8H13L11 6H5C3.89543 6 3 6.89543 3 8V7Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M12 11L12 16M9.5 13.5L14.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="institute-management-content">
                <h3 className="institute-management-title">Bulk Upload Colleges</h3>
                <p className="institute-management-subtitle">Import multiple</p>
              </div>
            </div>
            
            <div className="institute-management-card">
              <div className="institute-management-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="institute-management-content">
                <h3 className="institute-management-title">Add College</h3>
                <p className="institute-management-subtitle">Create new college</p>
              </div>
            </div>
            
            <div className="institute-management-card">
              <div className="institute-management-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M8 21L16 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 17L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="7" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M4 13C4 11.8954 4.89543 11 6 11H8C9.10457 11 10 11.8954 10 13V14H4V13Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </svg>
              </div>
              <div className="institute-management-content">
                <h3 className="institute-management-title">Manage Faculty</h3>
                <p className="institute-management-subtitle">{statistics.totalFaculty} active</p>
              </div>
            </div>
            
            <div className="institute-management-card">
              <div className="institute-management-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M3 21V19C3 16.7909 4.79086 15 7 15H11C13.2091 15 15 16.7909 15 19V21" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <circle cx="17" cy="7" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M21 21V19C21 17.3431 19.6569 16 18 16H17" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <div className="institute-management-content">
                <h3 className="institute-management-title">Manage Students</h3>
                <p className="institute-management-subtitle">{statistics.totalStudents} active</p>
              </div>
            </div>
            
            <div className="institute-management-card">
              <div className="institute-management-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="institute-management-content">
                <h3 className="institute-management-title">Generate Report</h3>
                <p className="institute-management-subtitle">Analytics & Reports</p>
              </div>
            </div>
          </div>
        </div>

        {/* College Overview Section */}
        <div className="institute-college-overview">
          <div className="institute-section-header">
            <h2 className="institute-section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              College Overview
            </h2>
          </div>
          
          <div className="institute-college-list">
            {colleges.slice(0, 2).map((college) => (
              <div key={college._id} className="institute-college-card">
                <div className="institute-college-header">
                  <h3 className="institute-college-name">{college.name}</h3>
                  <p className="institute-college-type">{college.type}</p>
                </div>
                <div className="institute-college-stats">
                  <div className="institute-college-stat">
                    <span className="institute-college-stat-number">{college.departmentCount}</span>
                    <span className="institute-college-stat-label">Departments</span>
                  </div>
                  <div className="institute-college-stat">
                    <span className="institute-college-stat-number">{college.facultyCount}</span>
                    <span className="institute-college-stat-label">Faculty</span>
                  </div>
                  <div className="institute-college-stat">
                    <span className="institute-college-stat-number">{college.studentCount}</span>
                    <span className="institute-college-stat-label">Students</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {colleges.length > 2 && (
            <div className="institute-show-more">
              <button className="institute-show-more-btn">
                Show More Colleges ({colleges.length} total)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Events Section */}
      <div className="institute-events-section">
        <div className="institute-section-header">
          <h2 className="institute-section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Upcoming Events
          </h2>
          <button className="institute-add-event-btn">+ Add Event</button>
        </div>
        
        {upcomingEvents.length > 0 ? (
          <div className="institute-events-list">
            {upcomingEvents.slice(0, 3).map((event) => (
              <div key={event._id} className="institute-event-card">
                <div className="institute-event-date">
                  <span className="institute-event-day">
                    {new Date(event.date).getDate()}
                  </span>
                  <span className="institute-event-month">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>
                <div className="institute-event-details">
                  <h4 className="institute-event-title">{event.title}</h4>
                  <p className="institute-event-info">
                    {event.type} • {event.location}
                  </p>
                  <p className="institute-event-organizer">
                    Organized by: {event.organizer?.name || 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="institute-no-events">
            <div className="institute-no-events-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3 className="institute-no-events-title">No upcoming events</h3>
            <p className="institute-no-events-text">Create your first event to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstituteDashboard;
