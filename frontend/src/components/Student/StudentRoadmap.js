import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roadmapService } from '../../services/authService';
import './Student.css';

const StudentRoadmap = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRoadmap();
  }, [id]);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await roadmapService.getRoadmap(id);
      
      if (response.data.success) {
        setRoadmap(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch roadmap');
      }
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      if (error.response?.status === 404) {
        setError('Roadmap not found');
      } else if (error.response?.status === 400) {
        setError('Invalid roadmap ID');
      } else {
        setError('Failed to load roadmap. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMatchScoreColor = (score) => {
    if (score >= 0.8) return '#4CAF50'; // Green
    if (score >= 0.6) return '#FF9800'; // Orange
    return '#f44336'; // Red
  };

  const getMatchScoreText = (score) => {
    if (score >= 0.8) return 'Excellent Match';
    if (score >= 0.6) return 'Good Match';
    return 'Fair Match';
  };

  if (loading) {
    return (
      <div className="roadmap-container">
        <div className="roadmap-loading-container">
          <div className="roadmap-loading-spinner"></div>
          <p>Loading roadmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="roadmap-container">
        <div className="roadmap-error-container">
          <div className="roadmap-error-icon">⚠️</div>
          <h2>Oops! Something went wrong</h2>
          <p className="roadmap-error-message">{error}</p>
          <div className="roadmap-error-actions">
            <button 
              className="roadmap-btn-primary" 
              onClick={fetchRoadmap}
            >
              Try Again
            </button>
            <button 
              className="roadmap-btn-secondary" 
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="roadmap-container">
        <div className="roadmap-empty-state">
          <div className="roadmap-empty-icon">📍</div>
          <h2>No Roadmap Found</h2>
          <p>The requested roadmap could not be found or may have been removed.</p>
          <button 
            className="roadmap-btn-primary" 
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="roadmap-container">
      <div className="roadmap-header">
        <button 
          className="back-button" 
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          ← Back
        </button>
        <div className="roadmap-title-section">
          <h1>Career Roadmap</h1>
          <div className="roadmap-meta">
            <span className="student-info">
              For: {roadmap.student_id?.name?.first} {roadmap.student_id?.name?.last}
            </span>
            <span className="created-date">
              Created: {formatDate(roadmap.created_at)}
            </span>
          </div>
        </div>
      </div>

      <div className="roadmap-content">
        {roadmap.potential_roadmaps && roadmap.potential_roadmaps.length > 0 ? (
          <div className="roadmaps-grid">
            {roadmap.potential_roadmaps.map((careerPath, index) => (
              <div key={index} className="career-roadmap-card">
                <div className="career-header">
                  <h2 className="career-title">{careerPath.career_title}</h2>
                  <div 
                    className="match-score"
                    style={{ backgroundColor: getMatchScoreColor(careerPath.match_score) }}
                  >
                    <span className="score-percentage">
                      {Math.round(careerPath.match_score * 100)}%
                    </span>
                    <span className="score-text">
                      {getMatchScoreText(careerPath.match_score)}
                    </span>
                  </div>
                </div>

                {careerPath.existing_skills && careerPath.existing_skills.length > 0 && (
                  <div className="skills-section">
                    <h3>Your Existing Skills</h3>
                    <div className="skills-list">
                      {careerPath.existing_skills.map((skill, skillIndex) => (
                        <span key={skillIndex} className="skill-tag existing-skill">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {careerPath.sequenced_roadmap && careerPath.sequenced_roadmap.length > 0 && (
                  <div className="roadmap-sequence">
                    <h3>Learning Path</h3>
                    <div className="sequence-steps">
                      {careerPath.sequenced_roadmap.map((step, stepIndex) => (
                        <div key={stepIndex} className="roadmap-step">
                          <div className="step-number">{stepIndex + 1}</div>
                          <div className="step-content">
                            <p>{step}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-roadmaps">
            <div className="empty-icon">🗺️</div>
            <h2>No Career Paths Available</h2>
            <p>This roadmap doesn't contain any career path recommendations yet.</p>
          </div>
        )}
      </div>

      <div className="roadmap-footer">
        <div className="last-updated">
          Last updated: {formatDate(roadmap.updated_at)}
        </div>
      </div>
    </div>
  );
};

export default StudentRoadmap;
