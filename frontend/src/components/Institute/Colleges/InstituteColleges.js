import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { instituteService } from "../../../services/authService";
import "./InstituteColleges.css";

const InstituteColleges = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [collegesData, setCollegesData] = useState(null);

  useEffect(() => {
    fetchColleges();
  }, [id]);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const response = await instituteService.getColleges(id);
      setCollegesData(response.data);
    } catch (error) {
      setError("Failed to load colleges data");
      console.error("Colleges error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="institute-colleges">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading colleges...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="institute-colleges">
        <div className="error">
          <div className="alert">
            <h4>Error Loading Colleges</h4>
            <p>{error}</p>
            <button onClick={fetchColleges} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { colleges } = collegesData;

  return (
    <div className="institute-colleges">
      {/* Header */}
      <div className="colleges-header">
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
              <i className="fas fa-university"></i>
              Colleges Management
            </h1>
            <p>Comprehensive overview of all colleges in the institute</p>
          </div>
        </div>
      </div>

      {/* Colleges Grid */}
      <div className="colleges-grid">
        {colleges && colleges.length > 0 ? (
          colleges.map((college) => (
            <div key={college._id} className="college-card">
              <div className="college-header">
                <div className="college-icon">
                  <i className="fas fa-university"></i>
                </div>
                <div className="college-basic-info">
                  <h2>{college.name}</h2>
                  <p className="college-code">Code: {college.code}</p>
                  <p className="college-type">
                    {college.type || "Engineering College"}
                  </p>
                </div>
              </div>

              <div className="college-details">
                {college.establishedYear && (
                  <div className="detail-item">
                    <i className="fas fa-calendar-alt"></i>
                    <span>Established: {college.establishedYear}</span>
                  </div>
                )}

                {college.location && (
                  <div className="detail-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>Location: {college.location}</span>
                  </div>
                )}

                {college.website && (
                  <div className="detail-item">
                    <i className="fas fa-globe"></i>
                    <a
                      href={college.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit Website
                    </a>
                  </div>
                )}

                {college.email && (
                  <div className="detail-item">
                    <i className="fas fa-envelope"></i>
                    <a href={`mailto:${college.email}`}>{college.email}</a>
                  </div>
                )}
              </div>

              <div className="college-stats">
                <div className="stat-item">
                  <div className="stat-number">
                    {college.departmentCount || 0}
                  </div>
                  <div className="stat-label">Departments</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{college.facultyCount || 0}</div>
                  <div className="stat-label">Faculty</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{college.studentCount || 0}</div>
                  <div className="stat-label">Students</div>
                </div>
              </div>

              {college.description && (
                <div className="college-description">
                  <p>{college.description}</p>
                </div>
              )}

              <div className="college-actions">
                <button
                  className="action-btn primary"
                  onClick={() =>
                    navigate(`/institute/college/${college._id}/departments`)
                  }
                >
                  <i className="fas fa-graduation-cap"></i>
                  View Departments
                </button>
                <button
                  className="action-btn secondary"
                  onClick={() =>
                    navigate(`/institute/college/${college._id}/faculty`)
                  }
                >
                  <i className="fas fa-chalkboard-teacher"></i>
                  View Faculty
                </button>
                <button
                  className="action-btn secondary"
                  onClick={() =>
                    navigate(`/institute/college/${college._id}/students`)
                  }
                >
                  <i className="fas fa-users"></i>
                  View Students
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-colleges">
            <div className="no-data-icon">
              <i className="fas fa-university"></i>
            </div>
            <h3>No Colleges Found</h3>
            <p>No colleges are currently registered under this institute.</p>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      {colleges && colleges.length > 0 && (
        <div className="colleges-summary">
          <h3>Summary Statistics</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <div className="summary-number">{colleges.length}</div>
              <div className="summary-label">Total Colleges</div>
            </div>
            <div className="summary-item">
              <div className="summary-number">
                {colleges.reduce(
                  (sum, college) => sum + (college.departmentCount || 0),
                  0
                )}
              </div>
              <div className="summary-label">Total Departments</div>
            </div>
            <div className="summary-item">
              <div className="summary-number">
                {colleges.reduce(
                  (sum, college) => sum + (college.facultyCount || 0),
                  0
                )}
              </div>
              <div className="summary-label">Total Faculty</div>
            </div>
            <div className="summary-item">
              <div className="summary-number">
                {colleges.reduce(
                  (sum, college) => sum + (college.studentCount || 0),
                  0
                )}
              </div>
              <div className="summary-label">Total Students</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstituteColleges;
