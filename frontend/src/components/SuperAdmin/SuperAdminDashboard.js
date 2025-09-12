import React, { useState, useEffect } from 'react';
import { superAdminService } from '../../services/superAdminService';
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalColleges: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalEvents: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    systemHealth: 'Loading...',
    totalActivities: 0,
    platformUptime: 'Loading...',
    dataSync: 'Loading...'
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [pendingInstitutions, setPendingInstitutions] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Pagination and filtering states
  const [collegesPage, setCollegesPage] = useState(1);
  const [collegesSearch, setCollegesSearch] = useState('');
  const [collegesFilter, setCollegesFilter] = useState('');
  const [totalCollegesPages, setTotalCollegesPages] = useState(1);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchColleges();
  }, [collegesPage, collegesSearch, collegesFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchStats(),
        fetchRecentActivities(),
        fetchSystemAlerts(),
        fetchPendingInstitutions()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await superAdminService.getDashboardStats();
      setStats({
        totalColleges: response.metrics?.institutes || 0,
        totalStudents: response.metrics?.activeStudents || 0,
        totalFaculty: 0, // Will be calculated from institutes
        totalEvents: response.metrics?.activitiesLogged || 0,
        activeUsers: response.metrics?.activeStudents || 0,
        pendingApprovals: response.metrics?.pendingApprovals || 0,
        systemHealth: 'Good',
        totalActivities: response.metrics?.activitiesLogged || 0,
        platformUptime: '99.9%',
        dataSync: 'Synced'
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to default values on error
      setStats({
        totalColleges: 0,
        totalStudents: 0,
        totalFaculty: 0,
        totalEvents: 0,
        activeUsers: 0,
        pendingApprovals: 0,
        systemHealth: 'Error',
        totalActivities: 0,
        platformUptime: 'Unknown',
        dataSync: 'Error'
      });
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await superAdminService.getRecentActivities(5);
      setRecentActivities(response.activities || []);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setRecentActivities([]);
    }
  };

  const fetchColleges = async () => {
    try {
      const response = await superAdminService.getAllColleges(
        collegesPage,
        5, // limit to 5 for dashboard view
        collegesSearch,
        collegesFilter
      );
      setColleges(response.colleges || []);
      setTotalCollegesPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error fetching colleges:', error);
      setColleges([]);
    }
  };

  const fetchSystemAlerts = async () => {
    try {
      const response = await superAdminService.getSystemAlerts();
      setSystemAlerts(response.alerts || []);
    } catch (error) {
      console.error('Error fetching system alerts:', error);
      setSystemAlerts([]);
    }
  };

  const fetchPendingInstitutions = async () => {
    try {
      const response = await superAdminService.getPendingInstitutions();
      setPendingInstitutions(response.institutions || []);
    } catch (error) {
      console.error('Error fetching pending institutions:', error);
      setPendingInstitutions([]);
    }
  };

  const StatCard = ({ icon, title, value, change }) => (
    <div className="superadmin-stat-card">
      <div className="superadmin-stat-icon">
        <i className={icon}></i>
      </div>
      <div className="superadmin-stat-content">
        <h3>{value}</h3>
        <p>{title}</p>
        {change && <small className="superadmin-stat-change">{change}</small>}
      </div>
    </div>
  );

  const QuickActionCard = ({ icon, title, description, onClick }) => (
    <div className="superadmin-action-card" onClick={onClick}>
      <div className="superadmin-action-icon">
        <i className={icon}></i>
      </div>
      <div className="superadmin-action-content">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </div>
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleCollegeAction = async (action, collegeId, data = null) => {
    try {
      switch (action) {
        case 'approve':
          await superAdminService.approveCollege(collegeId);
          break;
        case 'reject':
          await superAdminService.rejectCollege(collegeId, data?.reason || 'No reason provided');
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this institute?')) {
            await superAdminService.deleteCollege(collegeId);
          } else {
            return;
          }
          break;
        default:
          return;
      }
      // Refresh colleges list after action
      await fetchColleges();
      await fetchStats(); // Update stats as well
      await fetchPendingInstitutions(); // Update pending institutions
    } catch (error) {
      console.error(`Error ${action}ing institute:`, error);
      alert(`Failed to ${action} institute. Please try again.`);
    }
  };

  const handleQuickAction = async (actionType) => {
    try {
      switch (actionType) {
        case 'backup':
          const backupResult = await superAdminService.createBackup();
          alert('System backup initiated successfully!');
          break;
        case 'analytics':
          // Navigate to analytics page or show analytics modal
          console.log('Navigate to analytics');
          break;
        case 'add-institute':
          // Navigate to add institute page or show modal
          console.log('Navigate to add institute');
          break;
        case 'manage-admins':
          // Navigate to admin management page
          console.log('Navigate to admin management');
          break;
        default:
          console.log(`Action: ${actionType}`);
      }
    } catch (error) {
      console.error(`Error performing ${actionType}:`, error);
      alert(`Failed to perform ${actionType}. Please try again.`);
    }
  };

  if (loading) {
    return (
      <div className="superadmin-loading-container">
        <div className="superadmin-loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="superadmin-error-container">
        <div className="superadmin-error-content">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button className="superadmin-btn-primary" onClick={handleRefresh}>
            <i className="fas fa-refresh"></i> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="superadmin-dashboard-container">
      <div className="superadmin-dashboard-header">
        <div className="superadmin-header-content">
          <h1 className="superadmin-dashboard-title">Super Admin Dashboard</h1>
          <p className="superadmin-dashboard-subtitle">Manage and monitor the entire education platform</p>
        </div>
        <div className="superadmin-header-actions">
          <button className="superadmin-btn-primary">
            <i className="fas fa-download"></i> Export Report
          </button>
          <button className="superadmin-btn-secondary">
            <i className="fas fa-cog"></i> Settings
          </button>
        </div>
      </div>

      {/* Statistics Cards - 5 Cards Layout */}
      <div className="superadmin-stats-grid">
        <StatCard
          icon="fas fa-university"
          title="Total Institutes"
          value={stats.totalColleges}
        />
        <StatCard
          icon="fas fa-user-graduate"
          title="Total Students"
          value={stats.totalStudents}
        />
        <StatCard
          icon="fas fa-chalkboard-teacher"
          title="Total Faculty"
          value={stats.totalFaculty}
        />
        <StatCard
          icon="fas fa-calendar-alt"
          title="Active Events"
          value={stats.totalEvents}
        />
        <StatCard
          icon="fas fa-clock"
          title="Pending Approvals"
          value={stats.pendingApprovals}
        />
      </div>

      <div className="superadmin-dashboard-content">
        {/* Quick Actions */}
        <div className="superadmin-dashboard-section">
          <div className="superadmin-section-header">
            <h2 className="superadmin-section-title">
              <i className="fas fa-tachometer-alt"></i>
              Quick Management
            </h2>
            <p>Perform common administrative tasks</p>
          </div>
          <div className="superadmin-quick-actions-grid">
            <QuickActionCard
              icon="fas fa-plus"
              title="Add New Institute"
              description="Register a new educational institution"
              onClick={() => handleQuickAction('add-institute')}
            />
            <QuickActionCard
              icon="fas fa-user-shield"
              title="Manage Admins"
              description="Add or modify admin privileges"
              onClick={() => handleQuickAction('manage-admins')}
            />
            <QuickActionCard
              icon="fas fa-database"
              title="System Backup"
              description="Create or restore system backup"
              onClick={() => handleQuickAction('backup')}
            />
            <QuickActionCard
              icon="fas fa-chart-line"
              title="Analytics"
              description="View detailed system analytics"
              onClick={() => handleQuickAction('analytics')}
            />
          </div>
        </div>

        {/* Pending Institution Approvals Section */}
        <div className="superadmin-dashboard-section">
          <div className="superadmin-section-header">
            <h2 className="superadmin-section-title">
              Pending Institution Approvals
            </h2>
          </div>
          <div className="superadmin-pending-institutions">
            {pendingInstitutions.length > 0 ? (
              <div className="superadmin-pending-list">
                {pendingInstitutions.map(institution => (
                  <div key={institution.id} className="superadmin-pending-item">
                    <div className="superadmin-pending-content">
                      <div className="superadmin-pending-main">
                        <h3 className="superadmin-institution-name">
                          {institution.name || 'Indian Institute of Science, Bangalore'}
                        </h3>
                        <p className="superadmin-institution-type">
                          {institution.type || 'Technical University'}
                        </p>
                        <div className="superadmin-institution-meta">
                          <span className="superadmin-submitted-by">
                            Submitted by: {institution.submittedBy || 'Dr. Rajesh Kumar'}
                          </span>
                          <span className="superadmin-submitted-time">
                            {institution.submittedTime || '2 days ago'}
                          </span>
                        </div>
                      </div>
                      <div className="superadmin-pending-status">
                        <span className={`superadmin-status-badge ${institution.reviewStatus || 'under-review'}`}>
                          {institution.reviewStatus === 'under-review' ? 'Under Review' :
                           institution.reviewStatus === 'documentation-pending' ? 'Documentation Pending' :
                           institution.reviewStatus === 'final-review' ? 'Final Review' : 'Under Review'}
                        </span>
                      </div>
                    </div>
                    <div className="superadmin-pending-actions">
                      <button 
                        className="superadmin-action-btn approve"
                        onClick={() => handleCollegeAction('approve', institution.id)}
                      >
                        Approve
                      </button>
                      <button 
                        className="superadmin-action-btn reject"
                        onClick={() => {
                          const reason = prompt('Reason for rejection:');
                          if (reason) handleCollegeAction('reject', institution.id, { reason });
                        }}
                      >
                        Reject
                      </button>
                      <button 
                        className="superadmin-action-btn review"
                        onClick={() => console.log('View details:', institution.id)}
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="superadmin-no-pending">
                <div className="superadmin-no-data-content">
                  <i className="fas fa-check-circle"></i>
                  <h3>No Pending Approvals</h3>
                  <p>All institution registration requests have been processed</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="superadmin-main-content-grid">
          {/* Institutes Management */}
          <div className="superadmin-colleges-section">
            <div className="superadmin-section-header">
              <h2 className="superadmin-section-title">
                <i className="fas fa-university"></i>
                Institutes Overview
              </h2>
              <div className="superadmin-section-actions">
                <input
                  type="text"
                  placeholder="Search institutes..."
                  value={collegesSearch}
                  onChange={(e) => setCollegesSearch(e.target.value)}
                  className="superadmin-search-input"
                />
                <select
                  value={collegesFilter}
                  onChange={(e) => setCollegesFilter(e.target.value)}
                  className="superadmin-filter-select"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
                <button 
                  className="superadmin-btn-primary"
                  onClick={() => handleQuickAction('add-institute')}
                >
                  <i className="fas fa-plus"></i> Add Institute
                </button>
              </div>
            </div>
            <div className="superadmin-colleges-table">
              <table>
                <thead>
                  <tr>
                    <th>Institute Name</th>
                    <th>Students</th>
                    <th>Faculty</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {colleges.length > 0 ? colleges.map(college => (
                    <tr key={college.id}>
                      <td>
                        <div className="superadmin-college-info">
                          <strong>{college.name || 'Unknown Institute'}</strong>
                          <small>Last active: {college.lastActive || 'Never'}</small>
                        </div>
                      </td>
                      <td>{college.students || 0}</td>
                      <td>{college.faculty || 0}</td>
                      <td>
                        <span className={`superadmin-status ${(college.status || 'inactive').toLowerCase()}`}>
                          {college.status || 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="superadmin-action-buttons">
                          <button 
                            className="superadmin-btn-icon" 
                            title="View"
                            onClick={() => console.log('View institute:', college.id)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          {college.status === 'pending' && (
                            <>
                              <button 
                                className="superadmin-btn-icon success" 
                                title="Approve"
                                onClick={() => handleCollegeAction('approve', college.id)}
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button 
                                className="superadmin-btn-icon warning" 
                                title="Reject"
                                onClick={() => {
                                  const reason = prompt('Reason for rejection:');
                                  if (reason) handleCollegeAction('reject', college.id, { reason });
                                }}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </>
                          )}
                          <button 
                            className="superadmin-btn-icon danger" 
                            title="Delete"
                            onClick={() => handleCollegeAction('delete', college.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="superadmin-no-data">
                        <div className="superadmin-no-data-content">
                          <i className="fas fa-university"></i>
                          <p>No institutes found</p>
                          <small>Try adjusting your search or filter criteria</small>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activities & System Alerts */}
          <div className="superadmin-dashboard-sidebar">
            {/* System Alerts */}
            <div className="superadmin-alerts-section">
              <div className="superadmin-section-header">
                <h3 className="superadmin-section-title">
                  <i className="fas fa-bell"></i>
                  System Alerts
                </h3>
              </div>
              <div className="superadmin-alerts-list">
                {systemAlerts.length > 0 ? systemAlerts.map(alert => (
                  <div key={alert.id} className={`superadmin-alert-item ${alert.type || 'info'}`}>
                    <div className="superadmin-alert-icon">
                      <i className={`fas ${
                        alert.type === 'error' ? 'fa-exclamation-circle' :
                        alert.type === 'warning' ? 'fa-exclamation-triangle' :
                        'fa-info-circle'
                      }`}></i>
                    </div>
                    <div className="superadmin-alert-content">
                      <p>{alert.message || 'No message available'}</p>
                      <small>{alert.time || 'Unknown time'}</small>
                    </div>
                  </div>
                )) : (
                  <div className="superadmin-no-data-content">
                    <i className="fas fa-check-circle"></i>
                    <p>No system alerts</p>
                    <small>All systems are running normally</small>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="superadmin-activities-section">
              <div className="superadmin-section-header">
                <h3 className="superadmin-section-title">
                  <i className="fas fa-clipboard-list"></i>
                  Recent Activities
                </h3>
              </div>
              <div className="superadmin-activities-list">
                {recentActivities.length > 0 ? recentActivities.map(activity => (
                  <div key={activity.id} className="superadmin-activity-item">
                    <div className={`superadmin-activity-icon ${activity.type || 'system'}`}>
                      {(activity.type === 'college' || !activity.type) && <i className="fas fa-university"></i>}
                      {activity.type === 'system' && <i className="fas fa-server"></i>}
                      {activity.type === 'support' && <i className="fas fa-exclamation-triangle"></i>}
                      {activity.type === 'event' && <i className="fas fa-calendar-alt"></i>}
                      {activity.type === 'profile' && <i className="fas fa-users"></i>}
                    </div>
                    <div className="superadmin-activity-content">
                      <p>{activity.action || 'Unknown activity'}</p>
                      {activity.college && <small>Institute: {activity.college}</small>}
                      {activity.user && <small>User: {activity.user}</small>}
                      {activity.event && <small>Event: {activity.event}</small>}
                      {activity.faculty && <small>Faculty: {activity.faculty}</small>}
                      <small className="superadmin-activity-time">{activity.time || 'Unknown time'}</small>
                    </div>
                  </div>
                )) : (
                  <div className="superadmin-no-data-content">
                    <i className="fas fa-history"></i>
                    <p>No recent activities</p>
                    <small>Activities will appear here as they occur</small>
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

export default SuperAdminDashboard;
