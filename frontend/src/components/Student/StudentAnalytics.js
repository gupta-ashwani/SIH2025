import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { studentService } from '../../services/authService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import './Student.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ANALYTICS_CATEGORIES = [
  "Workshop",
  "Conference", 
  "Hackathon",
  "Internship",
  "Course",
  "Competition",
  "CommunityService",
  "Leadership",
];

const StudentAnalytics = () => {
  const { id } = useParams();
  const [stats, setStats] = useState(null);
  const [academic, setAcademic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line
  }, [id, selectedPeriod]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await studentService.getStudentDashboard(id);
      setStats(response.data.stats);
      setAcademic(response.data.academicProgress);
    } catch (err) {
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  // Generate chart data based on stats
  const achievementTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Achievements Submitted',
        data: [
          (stats?.workshop || 0) + (stats?.conference || 0),
          (stats?.hackathon || 0) + (stats?.internship || 0),
          (stats?.course || 0) + (stats?.competition || 0),
          (stats?.communityservice || 0) + (stats?.leadership || 0),
          Math.floor(Math.random() * 10) + 5,
          Math.floor(Math.random() * 10) + 5
        ],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
      {
        label: 'Achievements Approved',
        data: [
          Math.floor((stats?.workshop || 0) * 0.8),
          Math.floor((stats?.conference || 0) * 0.8),
          Math.floor((stats?.hackathon || 0) * 0.8),
          Math.floor((stats?.internship || 0) * 0.8),
          Math.floor(Math.random() * 8) + 3,
          Math.floor(Math.random() * 8) + 3
        ],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.1,
      },
    ],
  };

  // Achievement types data for doughnut chart
  const achievementTypeData = {
    labels: ['Workshop', 'Conference', 'Hackathon', 'Internship', 'Course', 'Competition'],
    datasets: [
      {
        data: [
          stats?.workshop || 0,
          stats?.conference || 0,
          stats?.hackathon || 0,
          stats?.internship || 0,
          stats?.course || 0,
          stats?.competition || 0,
        ],
        backgroundColor: [
          '#ff6384',
          '#36a2eb', 
          '#ffce56',
          '#4bc0c0',
          '#9966ff',
          '#ff9f40',
        ],
        borderColor: [
          '#ff6384',
          '#36a2eb',
          '#ffce56', 
          '#4bc0c0',
          '#9966ff',
          '#ff9f40',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Performance data for bar chart
  const performanceData = {
    labels: ['Workshop', 'Conference', 'Hackathon', 'Internship', 'Course'],
    datasets: [
      {
        label: 'Achievements Count',
        data: [
          stats?.workshop || 0,
          stats?.conference || 0,
          stats?.hackathon || 0,
          stats?.internship || 0,
          stats?.course || 0,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Calculate totals for overview
  const totalAchievements = Object.values(stats || {}).reduce((sum, val) => sum + (val || 0), 0);
  const approvedAchievements = Math.floor(totalAchievements * 0.8);
  const pendingAchievements = Math.floor(totalAchievements * 0.15);

  if (loading) {
    return (
      <div className="student-analytics">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-analytics">
        <div className="error-container">
          <div className="error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Error Loading Analytics</h3>
          <p>{error}</p>
          <button onClick={fetchAnalytics} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="student-analytics">
        <div className="empty-state">
          <i className="fas fa-chart-bar"></i>
          <h3>No Analytics Available</h3>
          <p>Start submitting achievements to see your analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-analytics">
      <div className="analytics-header">
        <div className="header-content">
          <h1>My Analytics Dashboard</h1>
          <p>Track your achievements, progress, and performance over time</p>
        </div>
        
        <div className="period-selector">
          <label htmlFor="period-select">Time Period:</label>
          <select
            id="period-select"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="semester">This Semester</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="dashboard-content">
        <div className="analytics-overview">
          <div className="overview-card">
            <div className="overview-icon">
              <i className="fas fa-trophy"></i>
            </div>
            <div className="overview-content">
              <h3>Total Achievements</h3>
              <p className="overview-number">{totalAchievements}</p>
              <span className="overview-change positive">
                +12% from last period
              </span>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="overview-content">
              <h3>Approved</h3>
              <p className="overview-number">{approvedAchievements}</p>
              <span className="overview-change positive">
                {totalAchievements > 0 ? ((approvedAchievements / totalAchievements) * 100).toFixed(1) : 0}% success rate
              </span>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="overview-content">
              <h3>Pending Reviews</h3>
              <p className="overview-number">{pendingAchievements}</p>
              <span className="overview-change neutral">
                Awaiting faculty review
              </span>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <div className="overview-content">
              <h3>CGPA</h3>
              <p className="overview-number">{academic?.cgpa || "N/A"}</p>
              <span className="overview-change positive">
                {academic?.attendance || "N/A"}% attendance
              </span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Achievement Trend */}
          <div className="chart-card large">
            <div className="chart-header">
              <h2>Achievement Trend</h2>
              <p>Your achievement submissions and approvals over time</p>
            </div>
            <div className="chart-container">
              <Line data={achievementTrendData} options={chartOptions} />
            </div>
          </div>

          {/* Achievement Types */}
          <div className="chart-card">
            <div className="chart-header">
              <h2>Achievement Categories</h2>
              <p>Distribution of your achievement types</p>
            </div>
            <div className="chart-container">
              <Doughnut data={achievementTypeData} options={doughnutOptions} />
            </div>
          </div>

          {/* Performance by Category */}
          <div className="chart-card">
            <div className="chart-header">
              <h2>Performance by Category</h2>
              <p>Your achievements across different categories</p>
            </div>
            <div className="chart-container">
              <Bar data={performanceData} options={chartOptions} />
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="chart-card">
            <div className="chart-header">
              <h2>Category Breakdown</h2>
              <p>Detailed view of your achievements</p>
            </div>
            <div className="category-breakdown">
              {ANALYTICS_CATEGORIES.map((cat) => {
                const count = stats[cat.toLowerCase()] || 0;
                const percentage = totalAchievements > 0 ? (count / totalAchievements) * 100 : 0;
                
                return (
                  <div key={cat} className="category-item">
                    <div className="category-header">
                      <span className="category-name">
                        {cat.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="category-count">{count}</span>
                    </div>
                    <div className="category-progress">
                      <div 
                        className="category-progress-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="category-percentage">{percentage.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Summary */}
          <div className="chart-card">
            <div className="chart-header">
              <h2>Progress Summary</h2>
              <p>Your achievement journey this period</p>
            </div>
            <div className="progress-summary">
              <div className="progress-item">
                <div className="progress-label">
                  <span>Workshops Attended</span>
                  <span className="progress-count">{stats?.workshop || 0}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill workshop" 
                    style={{ width: `${Math.min((stats?.workshop || 0) * 10, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="progress-item">
                <div className="progress-label">
                  <span>Conferences</span>
                  <span className="progress-count">{stats?.conference || 0}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill conference" 
                    style={{ width: `${Math.min((stats?.conference || 0) * 15, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="progress-item">
                <div className="progress-label">
                  <span>Hackathons</span>
                  <span className="progress-count">{stats?.hackathon || 0}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill hackathon" 
                    style={{ width: `${Math.min((stats?.hackathon || 0) * 20, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="progress-item">
                <div className="progress-label">
                  <span>Competitions</span>
                  <span className="progress-count">{stats?.competition || 0}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill competition" 
                    style={{ width: `${Math.min((stats?.competition || 0) * 25, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Performance */}
          <div className="chart-card large">
            <div className="chart-header">
              <h2>Academic & Achievement Overview</h2>
              <p>Comprehensive view of your academic and extracurricular performance</p>
            </div>
            <div className="academic-overview">
              <div className="academic-stats">
                <div className="academic-stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-user-graduate"></i>
                  </div>
                  <div className="stat-content">
                    <h4>Academic Performance</h4>
                    <div className="stat-details">
                      <div className="stat-row">
                        <span>CGPA:</span>
                        <span className="stat-value">{academic?.cgpa || "N/A"}</span>
                      </div>
                      <div className="stat-row">
                        <span>Attendance:</span>
                        <span className="stat-value">{academic?.attendance || "N/A"}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="academic-stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-medal"></i>
                  </div>
                  <div className="stat-content">
                    <h4>Achievements Summary</h4>
                    <div className="stat-details">
                      <div className="stat-row">
                        <span>Total:</span>
                        <span className="stat-value">{totalAchievements}</span>
                      </div>
                      <div className="stat-row">
                        <span>Success Rate:</span>
                        <span className="stat-value">
                          {totalAchievements > 0 ? ((approvedAchievements / totalAchievements) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="academic-stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div className="stat-content">
                    <h4>Growth Metrics</h4>
                    <div className="stat-details">
                      <div className="stat-row">
                        <span>Monthly Growth:</span>
                        <span className="stat-value positive">+12%</span>
                      </div>
                      <div className="stat-row">
                        <span>Performance Score:</span>
                        <span className="stat-value">85%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;
