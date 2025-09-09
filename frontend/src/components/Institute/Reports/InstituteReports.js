import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { instituteService } from "../../../services/authService";
import "./InstituteReports.css";

const InstituteReports = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState(null);
  const [selectedReportType, setSelectedReportType] = useState("overview");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("month");

  useEffect(() => {
    fetchReportData();
  }, [id, selectedReportType, selectedDepartment, selectedDateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      // This would be a real API call to get report data
      const response = await instituteService.getInstituteReports(id, {
        type: selectedReportType,
        department: selectedDepartment,
        dateRange: selectedDateRange,
      });
      setReportData(response.data);
    } catch (error) {
      setError("Failed to load report data");
      console.error("Report error:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDFReport = () => {
    // PDF generation logic would go here
    console.log("Generating PDF report...");
    alert("PDF report generation functionality would be implemented here");
  };

  const exportToExcel = () => {
    // Excel export logic would go here
    console.log("Exporting to Excel...");
    alert("Excel export functionality would be implemented here");
  };

  if (loading) {
    return (
      <div className="institute-reports">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading report data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="institute-reports">
        <div className="error">
          <div className="alert">
            <h4>Error Loading Reports</h4>
            <p>{error}</p>
            <button onClick={fetchReportData} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="institute-reports">
      {/* Header */}
      <div className="reports-header">
        <div className="header-content">
          <button
            className="back-btn"
            onClick={() => navigate(`/institute/dashboard/${id}`)}
          >
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>
          <div className="header-text">
            <h1>
              <i className="fas fa-file-alt"></i>
              Institute Reports
            </h1>
            <p>Generate and download comprehensive reports</p>
          </div>
        </div>
      </div>

      {/* Report Controls */}
      <div className="report-controls">
        <div className="control-group">
          <label>Report Type</label>
          <select
            value={selectedReportType}
            onChange={(e) => setSelectedReportType(e.target.value)}
          >
            <option value="overview">Institute Overview</option>
            <option value="department">Department Wise</option>
            <option value="faculty">Faculty Report</option>
            <option value="student">Student Report</option>
            <option value="events">Events Report</option>
          </select>
        </div>

        <div className="control-group">
          <label>Department</label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="all">All Departments</option>
            <option value="cse">Computer Science</option>
            <option value="ece">Electronics</option>
            <option value="me">Mechanical</option>
          </select>
        </div>

        <div className="control-group">
          <label>Date Range</label>
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        <div className="control-actions">
          <button className="generate-btn" onClick={generatePDFReport}>
            <i className="fas fa-file-pdf"></i>
            Generate PDF
          </button>
          <button className="export-btn" onClick={exportToExcel}>
            <i className="fas fa-file-excel"></i>
            Export Excel
          </button>
        </div>
      </div>

      {/* Report Preview */}
      <div className="report-preview">
        <div className="preview-header">
          <h2>Report Preview</h2>
          <div className="report-meta">
            <span>Generated on: {new Date().toLocaleDateString()}</span>
            <span>
              Type:{" "}
              {selectedReportType.charAt(0).toUpperCase() +
                selectedReportType.slice(1)}
            </span>
          </div>
        </div>

        <div className="report-content">
          {selectedReportType === "overview" && (
            <div className="overview-report">
              <div className="report-section">
                <h3>Institute Summary</h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <div className="summary-number">4</div>
                    <div className="summary-label">Total Colleges</div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-number">12</div>
                    <div className="summary-label">Total Departments</div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-number">156</div>
                    <div className="summary-label">Faculty Members</div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-number">2,847</div>
                    <div className="summary-label">Students Enrolled</div>
                  </div>
                </div>
              </div>

              <div className="report-section">
                <h3>Department Distribution</h3>
                <div className="department-chart">
                  <div className="chart-item">
                    <div className="chart-bar" style={{ width: "85%" }}></div>
                    <span>Computer Science: 1,200 students</span>
                  </div>
                  <div className="chart-item">
                    <div className="chart-bar" style={{ width: "65%" }}></div>
                    <span>Electronics: 847 students</span>
                  </div>
                  <div className="chart-item">
                    <div className="chart-bar" style={{ width: "45%" }}></div>
                    <span>Mechanical: 560 students</span>
                  </div>
                  <div className="chart-item">
                    <div className="chart-bar" style={{ width: "25%" }}></div>
                    <span>Civil: 240 students</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedReportType === "department" && (
            <div className="department-report">
              <div className="report-section">
                <h3>Department Performance</h3>
                <div className="department-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>Faculty</th>
                        <th>Students</th>
                        <th>Avg. Performance</th>
                        <th>Events Conducted</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Computer Science</td>
                        <td>45</td>
                        <td>1,200</td>
                        <td>8.5/10</td>
                        <td>24</td>
                      </tr>
                      <tr>
                        <td>Electronics</td>
                        <td>38</td>
                        <td>847</td>
                        <td>8.2/10</td>
                        <td>18</td>
                      </tr>
                      <tr>
                        <td>Mechanical</td>
                        <td>42</td>
                        <td>560</td>
                        <td>7.9/10</td>
                        <td>15</td>
                      </tr>
                      <tr>
                        <td>Civil</td>
                        <td>31</td>
                        <td>240</td>
                        <td>8.0/10</td>
                        <td>12</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {(selectedReportType === "faculty" ||
            selectedReportType === "student" ||
            selectedReportType === "events") && (
            <div className="other-reports">
              <div className="report-section">
                <h3>
                  {selectedReportType.charAt(0).toUpperCase() +
                    selectedReportType.slice(1)}{" "}
                  Report
                </h3>
                <p>
                  Detailed {selectedReportType} report data would be displayed
                  here with comprehensive statistics, charts, and tables.
                </p>
                <div className="placeholder-content">
                  <i className="fas fa-chart-line"></i>
                  <p>
                    Report content will be generated based on selected filters
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstituteReports;
