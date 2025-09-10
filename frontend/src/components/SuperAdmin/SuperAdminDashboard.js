import React, { useEffect, useState } from "react";
import { dashboardService } from "../../services/authService";
import "./SuperAdmin.css";

const SuperAdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const { data } = await dashboardService.getDashboard("superadmin");
        setMetrics(data.metrics || null);
      } catch (err) {
        console.error("Failed to fetch superadmin metrics", err);
        setError("Failed to load metrics");
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const formatNumber = (value) => {
    if (value == null) return "—";
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return value.toLocaleString();
    return String(value);
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
              <span className="sa-metric-title">Total Institutions</span>
              <span className="sa-metric-icon"><i className="fas fa-school"></i></span>
            </div>
            <div className="sa-metric-value">{loading ? "—" : formatNumber(metrics?.institutes)}</div>
            <div className="sa-metric-trend up">
              <i className="fas fa-arrow-up"></i>
              <span>+12% from last month</span>
            </div>
          </div>

          <div className="sa-metric-card">
            <div className="sa-metric-header">
              <span className="sa-metric-title">Active Students</span>
              <span className="sa-metric-icon"><i className="fas fa-user-graduate"></i></span>
            </div>
            <div className="sa-metric-value">{loading ? "—" : formatNumber(metrics?.activeStudents)}</div>
            <div className="sa-metric-trend up">
              <i className="fas fa-arrow-up"></i>
              <span>+8% from last month</span>
            </div>
          </div>

          <div className="sa-metric-card">
            <div className="sa-metric-header">
              <span className="sa-metric-title">Activities Logged</span>
              <span className="sa-metric-icon"><i className="fas fa-clipboard-list"></i></span>
            </div>
            <div className="sa-metric-value">{loading ? "—" : formatNumber(metrics?.activitiesLogged)}</div>
            <div className="sa-metric-trend up">
              <i className="fas fa-arrow-up"></i>
              <span>+23% from last month</span>
            </div>
          </div>

          <div className="sa-metric-card">
            <div className="sa-metric-header">
              <span className="sa-metric-title">Pending Approvals</span>
              <span className="sa-metric-icon"><i className="fas fa-hourglass-half"></i></span>
            </div>
            <div className="sa-metric-value">{loading ? "—" : formatNumber(metrics?.pendingApprovals)}</div>
            <div className="sa-metric-trend warn">
              <i className="fas fa-exclamation-triangle"></i>
              <span>Requires attention</span>
            </div>
          </div>
        </section>

        

        <section className="dashboard-grid">
          <div className="dashboard-card sa-card">
            <h3>Institutes</h3>
            <p>View, add, and manage institutes across the platform.</p>
            <div className="action-buttons">
              <a href="/institute/dashboard/new" className="action-btn">Add Institute</a>
              <a href="/dashboard/superadmin#institutes" className="action-btn action-btn-secondary">View All</a>
            </div>
          </div>

          <div className="dashboard-card sa-card">
            <h3>Colleges</h3>
            <p>Oversee colleges, run bulk uploads, and monitor statuses.</p>
            <div className="action-buttons">
              <a href="/dashboard/superadmin#bulk-colleges" className="action-btn">Bulk Upload</a>
              <a href="/dashboard/superadmin#colleges" className="action-btn action-btn-secondary">Manage</a>
            </div>
          </div>

          <div className="dashboard-card sa-card">
            <h3>Reports</h3>
            <p>Generate cross-institute analytics and export summaries.</p>
            <div className="action-buttons">
              <a href="/dashboard/superadmin#reports" className="action-btn">Generate</a>
              <a href="/dashboard/superadmin#downloads" className="action-btn action-btn-secondary">Downloads</a>
            </div>
          </div>
        </section>

        <section className="dashboard-card sa-stats">
          <h2>Platform Overview</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">—</span>
              <span className="stat-label">Institutes</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">—</span>
              <span className="stat-label">Colleges</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">—</span>
              <span className="stat-label">Students</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">—</span>
              <span className="stat-label">Faculty</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;


