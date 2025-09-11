import React, { useEffect, useState } from "react";
import { dashboardService } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import InstituteRequestsTable from "./InstituteRequestsTable";
import "./SuperAdmin.css";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingInstitutions, setPendingInstitutions] = useState([]);
  const [platformHealth, setPlatformHealth] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [metricsRes, pendingRes, healthRes, activityRes] = await Promise.all([
          dashboardService.getDashboard("superadmin"),
          dashboardService.getPendingInstitutions(),
          dashboardService.getPlatformHealth(),
          dashboardService.getRecentActivity()
        ]);
        
        setMetrics(metricsRes.data.metrics || null);
        setPendingInstitutions(pendingRes.data.institutions || []);
        setPlatformHealth(healthRes.data.healthMetrics || null);
        setRecentActivity(activityRes.data.activities || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatNumber = (value) => {
    if (value == null) return "—";
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return value.toLocaleString();
    return String(value);
  };

  const handleReview = (institution) => {
    setSelectedInstitution(institution);
    setComment("");
    setShowModal(true);
  };

  const handleApprove = async () => {
    if (!selectedInstitution) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [selectedInstitution.id]: 'approve' }));
      await dashboardService.approveInstitution(selectedInstitution.id);
      
      // Remove from pending list
      setPendingInstitutions(prev => prev.filter(inst => inst.id !== selectedInstitution.id));
      
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1,
        institutes: prev.institutes + 1
      }));
      
      // Add to recent activity
      setRecentActivity(prev => [{
        id: selectedInstitution.id,
        type: "institution_approved",
        title: `${selectedInstitution.name}: Institution approved and activated`,
        time: "Just now",
        approvedBy: "You"
      }, ...prev.slice(0, 4)]);
      
      setShowModal(false);
      setSelectedInstitution(null);
    } catch (err) {
      console.error("Failed to approve institution", err);
      setError("Failed to approve institution");
    } finally {
      setActionLoading(prev => ({ ...prev, [selectedInstitution.id]: null }));
    }
  };

  const handleReject = async () => {
    if (!selectedInstitution) return;
    
    if (!comment.trim()) {
      setError("Comment is required for rejection");
      return;
    }
    
    try {
      setActionLoading(prev => ({ ...prev, [selectedInstitution.id]: 'reject' }));
      await dashboardService.rejectInstitution(selectedInstitution.id, comment);
      
      // Remove from pending list
      setPendingInstitutions(prev => prev.filter(inst => inst.id !== selectedInstitution.id));
      
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1
      }));
      
      setShowModal(false);
      setSelectedInstitution(null);
      setComment("");
    } catch (err) {
      console.error("Failed to reject institution", err);
      setError("Failed to reject institution");
    } finally {
      setActionLoading(prev => ({ ...prev, [selectedInstitution.id]: null }));
    }
  };

  const handlePlatformAction = (action) => {
    switch (action) {
      case 'review':
        navigate('/superadmin/review-institutions');
        break;
      case 'manage':
        navigate('/superadmin/manage-admins');
        break;
      case 'add':
        navigate('/superadmin/add-institution');
        break;
      case 'analytics':
        navigate('/superadmin/analytics');
        break;
      default:
        break;
    }
  };

  const createTestData = async () => {
    try {
      setLoading(true);
      await dashboardService.createTestInstitutions();
      
      // Refresh all data
      const [metricsRes, pendingRes, healthRes, activityRes] = await Promise.all([
        dashboardService.getDashboard("superadmin"),
        dashboardService.getPendingInstitutions(),
        dashboardService.getPlatformHealth(),
        dashboardService.getRecentActivity()
      ]);
      
      setMetrics(metricsRes.data.metrics || null);
      setPendingInstitutions(pendingRes.data.institutions || []);
      setPlatformHealth(healthRes.data.healthMetrics || null);
      setRecentActivity(activityRes.data.activities || []);
    } catch (err) {
      console.error("Failed to create test data", err);
      setError("Failed to create test data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <main className="dashboard-content">
        {error && (
          <div className="alert alert-danger" role="alert">{error}</div>
        )}
        <section className="dashboard-card sa-hero">
          <div className="sa-hero-content">
            <h1>Super Admin Panel</h1>
            <p>Manage institutes, oversee operations, and access global reports.</p>
          </div>
        </section>
        {/* Quick Stats Cards */}
        <section className="sa-quick-stats">
          <div className="sa-metric-card">
            <div className="sa-metric-header">
              <span className="sa-metric-icon"><i className="fas fa-school"></i></span>
              <span className="sa-metric-title">Total Institutions</span>
            </div>
            <div className="sa-metric-value">{loading ? "—" : formatNumber(metrics?.institutes)}</div>
            
          </div>

          <div className="sa-metric-card">
            <div className="sa-metric-header">
              <span className="sa-metric-icon"><i className="fas fa-user-graduate"></i></span>
              <span className="sa-metric-title">Active Students</span>
            </div>
            <div className="sa-metric-value">{loading ? "—" : formatNumber(metrics?.activeStudents)}</div>
            
          </div>

          <div className="sa-metric-card">
            <div className="sa-metric-header">
              <span className="sa-metric-icon"><i className="fas fa-clipboard-list"></i></span>
              <span className="sa-metric-title">Activities Logged</span>
            </div>
            <div className="sa-metric-value">{loading ? "—" : formatNumber(metrics?.activitiesLogged)}</div>
          </div>

          <div className="sa-metric-card">
            <div className="sa-metric-header">
              <span className="sa-metric-icon"><i className="fas fa-hourglass-half"></i></span>
              <span className="sa-metric-title">Pending Approvals</span>
            </div>
            <div className="sa-metric-value">{loading ? "—" : formatNumber(metrics?.pendingApprovals)}</div>
            
          </div>
        </section>

        

         {/* Content Grid */}
         <div className="content-grid">
           {/* Pending Institution Approvals */}
           <section className="pending-approvals">
             <h3>Pending Institution Approvals</h3>
             <div className="approvals-list">
               {loading ? (
                 <div className="loading-placeholder">Loading pending institutions...</div>
               ) : pendingInstitutions.length === 0 ? (
                 <div className="empty-state">No pending institution approvals</div>
               ) : (
                 pendingInstitutions.map((institution) => (
                   <div key={institution.id} className="approval-item">
                     <div className="institution-avatar">
                       {institution.avatar}
                     </div>
                     <div className="institution-details">
                       <h4>{institution.name}</h4>
                       <p className="location">{institution.location}</p>
                       <p className="type">Type: {institution.type}</p>
                       <p className="students">Students: {institution.students.toLocaleString()}</p>
                       <p className="requested">Requested: {institution.requested}</p>
                       <p className="contact">Contact: {institution.contact}</p>
                     </div>
                  <div className="approval-actions">
                    <button 
                      className="review-btn"
                      onClick={() => handleReview(institution)}
                    >
                      Review
                    </button>
                  </div>
                   </div>
                 ))
               )}
             </div>
           </section>

           {/* Platform Actions */}
           <section className="platform-actions">
             <h3>Platform Actions</h3>
             <div className="actions-list">
               <div className="action-item" onClick={() => handlePlatformAction('review')}>
                 <span className="action-icon">📋</span>
                 <span>Review Institution Requests</span>
                 <span className="action-badge">{metrics?.pendingApprovals || 0}</span>
               </div>
               <div className="action-item" onClick={() => handlePlatformAction('manage')}>
                 <span className="action-icon">👑</span>
                 <span>Manage Super Admins</span>
               </div>
               <div className="action-item" onClick={() => handlePlatformAction('add')}>
                 <span className="action-icon">➕</span>
                 <span>Add New Institution</span>
               </div>
               <div className="action-item" onClick={() => handlePlatformAction('analytics')}>
                 <span className="action-icon">📊</span>
                 <span>Platform Analytics</span>
               </div>
             </div>
           </section>

           {/* Platform Health */}
           <section className="platform-health">
             <h3>Platform Health</h3>
             <div className="health-metrics">
               <div className="health-item">
                 <span className="health-label">System Uptime:</span>
                 <span className="health-value positive">{platformHealth?.systemUptime || "—"}</span>
               </div>
               <div className="health-item">
                 <span className="health-label">Active Institutions:</span>
                 <span className="health-value positive">{platformHealth?.activeInstitutions || "—"}</span>
               </div>
               <div className="health-item">
                 <span className="health-label">Data Sync Status:</span>
                 <span className="health-value warning">{platformHealth?.dataSyncStatus || "—"}</span>
               </div>
               <div className="health-item">
                 <span className="health-label">Security Alerts:</span>
                 <span className="health-value positive">{platformHealth?.securityAlerts || "—"}</span>
               </div>
             </div>
           </section>

           {/* Recent Activity */}
           <section className="recent-activity">
             <h3>Recent Activity</h3>
             <div className="activity-list">
               {loading ? (
                 <div className="loading-placeholder">Loading recent activity...</div>
               ) : recentActivity.length === 0 ? (
                 <div className="empty-state">No recent activity</div>
               ) : (
                 recentActivity.map((activity) => (
                   <div key={activity.id} className="activity-item">
                     <span className="activity-icon">✅</span>
                     <div className="activity-content">
                       <p>{activity.title}</p>
                       <span className="activity-time">{activity.time}</span>
                     </div>
                   </div>
                 ))
               )}
             </div>
           </section>
         </div>

        {/* Institute Registration Requests Section */}
        <section className="dashboard-card institute-requests-section">
          <InstituteRequestsTable />
        </section>

        <section className="dashboard-card sa-stats">
          <h2>Platform Overview</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{formatNumber(metrics?.institutes)}</span>
              <span className="stat-label">Institutes</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{formatNumber(metrics?.activeStudents)}</span>
              <span className="stat-label">Students</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{formatNumber(metrics?.activitiesLogged)}</span>
              <span className="stat-label">Activities</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{formatNumber(metrics?.pendingApprovals)}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
        </section>

        {/* Review Modal */}
        {showModal && selectedInstitution && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Review Institution: {selectedInstitution.name}</h3>
                <button 
                  className="modal-close"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="institution-overview">
                  <div className="overview-section">
                    <h4>Basic Information</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Name:</label>
                        <span>{selectedInstitution.name}</span>
                      </div>
                      <div className="info-item">
                        <label>Type:</label>
                        <span>{selectedInstitution.type}</span>
                      </div>
                      <div className="info-item">
                        <label>Location:</label>
                        <span>{selectedInstitution.location}</span>
                      </div>
                      <div className="info-item">
                        <label>Student Count:</label>
                        <span>{selectedInstitution.students.toLocaleString()}</span>
                      </div>
                      <div className="info-item">
                        <label>Contact Email:</label>
                        <span>{selectedInstitution.contact}</span>
                      </div>
                      <div className="info-item">
                        <label>Requested:</label>
                        <span>{selectedInstitution.requested}</span>
                      </div>
                    </div>
                  </div>

                  <div className="overview-section">
                    <h4>Comments</h4>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add comments for approval or rejection..."
                      rows={4}
                      className="comment-textarea"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  className="reject-btn"
                  onClick={handleReject}
                  disabled={actionLoading[selectedInstitution.id]}
                >
                  {actionLoading[selectedInstitution.id] === 'reject' ? 'Rejecting...' : 'Reject'}
                </button>
                <button 
                  className="approve-btn"
                  onClick={handleApprove}
                  disabled={actionLoading[selectedInstitution.id]}
                >
                  {actionLoading[selectedInstitution.id] === 'approve' ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SuperAdminDashboard;


