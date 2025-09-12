import React, { useState, useEffect } from 'react';
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalColleges: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalEvents: 0,
    activeUsers: 0,
    systemHealth: 'Good'
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate API calls - replace with actual API endpoints
      await Promise.all([
        fetchStats(),
        fetchRecentActivities(),
        fetchColleges(),
        fetchSystemAlerts()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    // Mock data - replace with actual API call
    setStats({
      totalColleges: 45,
      totalStudents: 12500,
      totalFaculty: 850,
      totalEvents: 320,
      activeUsers: 1250,
      systemHealth: 'Good'
    });
  };

  const fetchRecentActivities = async () => {
    // Mock data - replace with actual API call
    setRecentActivities([
      { id: 1, action: 'New college registered', college: 'MIT College', time: '2 hours ago', type: 'college' },
      { id: 2, action: 'System backup completed', time: '4 hours ago', type: 'system' },
      { id: 3, action: 'User reported issue', user: 'John Doe', time: '6 hours ago', type: 'support' },
      { id: 4, action: 'Event created', event: 'Tech Fest 2024', time: '8 hours ago', type: 'event' },
      { id: 5, action: 'Faculty profile updated', faculty: 'Dr. Smith', time: '1 day ago', type: 'profile' }
    ]);
  };

  const fetchColleges = async () => {
    // Mock data - replace with actual API call
    setColleges([
      { id: 1, name: 'MIT College of Engineering', students: 2500, faculty: 180, status: 'Active', lastActive: '2 hours ago' },
      { id: 2, name: 'Stanford University', students: 3200, faculty: 220, status: 'Active', lastActive: '1 hour ago' },
      { id: 3, name: 'Harvard University', students: 2800, faculty: 195, status: 'Active', lastActive: '3 hours ago' },
      { id: 4, name: 'Oxford University', students: 1900, faculty: 145, status: 'Inactive', lastActive: '2 days ago' },
      { id: 5, name: 'Cambridge University', students: 2100, faculty: 160, status: 'Active', lastActive: '30 minutes ago' }
    ]);
  };

  const fetchSystemAlerts = async () => {
    // Mock data - replace with actual API call
    setSystemAlerts([
      { id: 1, type: 'warning', message: 'Server load is high (85%)', time: '1 hour ago' },
      { id: 2, type: 'info', message: 'Scheduled maintenance in 2 days', time: '3 hours ago' },
      { id: 3, type: 'error', message: 'Failed login attempts detected', time: '5 hours ago' }
    ]);
  };

  const StatCard = ({ icon, title, value, change }) => (
    <div className="superadmin-stat-card">
      <div className="superadmin-stat-icon">
        <i className={icon}></i>
      </div>
      <div className="superadmin-stat-content">
        <h3>{value}</h3>
        <p>{title}</p>
        {change && (
          <span className={`superadmin-stat-change ${change.startsWith('+') ? 'positive' : 'negative'}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );

  const QuickActionCard = ({ icon, title, description, onClick }) => (
    <div className="superadmin-quick-action-card" onClick={onClick}>
      <div className="superadmin-action-icon">
        <i className={icon}></i>
      </div>
      <div className="superadmin-action-content">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="superadmin-loading-container">
        <div className="superadmin-loading-spinner"></div>
        <p>Loading dashboard...</p>
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

      {/* Statistics Cards */}
      <div className="superadmin-stats-grid">
        <StatCard
          icon="fas fa-university"
          title="Total Colleges"
          value={stats.totalColleges}
          change="+3 this month"
        />
        <StatCard
          icon="fas fa-user-graduate"
          title="Total Students"
          value={stats.totalStudents.toLocaleString()}
          change="+12% this month"
        />
        <StatCard
          icon="fas fa-chalkboard-teacher"
          title="Total Faculty"
          value={stats.totalFaculty}
          change="+5% this month"
        />
        <StatCard
          icon="fas fa-calendar-alt"
          title="Active Events"
          value={stats.totalEvents}
          change="+8 this week"
        />
        <StatCard
          icon="fas fa-users"
          title="Active Users"
          value={stats.activeUsers.toLocaleString()}
          change="+15% today"
        />
        <StatCard
          icon="fas fa-server"
          title="System Health"
          value={stats.systemHealth}
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
              title="Add New College"
              description="Register a new educational institution"
              onClick={() => console.log('Add college')}
            />
            <QuickActionCard
              icon="fas fa-user-shield"
              title="Manage Admins"
              description="Add or modify admin privileges"
              onClick={() => console.log('Manage admins')}
            />
            <QuickActionCard
              icon="fas fa-database"
              title="System Backup"
              description="Create or restore system backup"
              onClick={() => console.log('System backup')}
            />
            <QuickActionCard
              icon="fas fa-chart-line"
              title="Analytics"
              description="View detailed system analytics"
              onClick={() => console.log('Analytics')}
            />
          </div>
        </div>

        <div className="superadmin-main-content-grid">
          {/* Colleges Management */}
          <div className="superadmin-colleges-section">
            <div className="superadmin-section-header">
              <h2 className="superadmin-section-title">
                <i className="fas fa-university"></i>
                Colleges Overview
              </h2>
              <div className="superadmin-section-actions">
                <button className="superadmin-btn-icon">
                  <i className="fas fa-search"></i>
                </button>
                <button className="superadmin-btn-icon">
                  <i className="fas fa-filter"></i>
                </button>
                <button className="superadmin-btn-primary">
                  <i className="fas fa-plus"></i> Add College
                </button>
              </div>
            </div>
            <div className="superadmin-colleges-table">
              <table>
                <thead>
                  <tr>
                    <th>College Name</th>
                    <th>Students</th>
                    <th>Faculty</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {colleges.map(college => (
                    <tr key={college.id}>
                      <td>
                        <div className="superadmin-college-info">
                          <strong>{college.name}</strong>
                          <small>Last active: {college.lastActive}</small>
                        </div>
                      </td>
                      <td>{college.students}</td>
                      <td>{college.faculty}</td>
                      <td>
                        <span className={`superadmin-status ${college.status.toLowerCase()}`}>
                          {college.status}
                        </span>
                      </td>
                      <td>
                        <div className="superadmin-action-buttons">
                          <button className="superadmin-btn-icon" title="View">
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="superadmin-btn-icon" title="Edit">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="superadmin-btn-icon danger" title="Delete">
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
                {systemAlerts.map(alert => (
                  <div key={alert.id} className={`superadmin-alert-item ${alert.type}`}>
                    <div className="superadmin-alert-icon">
                      <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <div className="superadmin-alert-content">
                      <p>{alert.message}</p>
                      <small>{alert.time}</small>
                    </div>
                  </div>
                ))}
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
                {recentActivities.map(activity => (
                  <div key={activity.id} className="superadmin-activity-item">
                    <div className={`superadmin-activity-icon ${activity.type}`}>
                      {activity.type === 'college' && <i className="fas fa-university"></i>}
                      {activity.type === 'system' && <i className="fas fa-server"></i>}
                      {activity.type === 'support' && <i className="fas fa-exclamation-triangle"></i>}
                      {activity.type === 'event' && <i className="fas fa-calendar-alt"></i>}
                      {activity.type === 'profile' && <i className="fas fa-users"></i>}
                    </div>
                    <div className="superadmin-activity-content">
                      <p>{activity.action}</p>
                      {activity.college && <small>College: {activity.college}</small>}
                      {activity.user && <small>User: {activity.user}</small>}
                      {activity.event && <small>Event: {activity.event}</small>}
                      {activity.faculty && <small>Faculty: {activity.faculty}</small>}
                      <small className="superadmin-activity-time">{activity.time}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;