import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { studentService } from "../../services/authService";
import "./Student.css";

const StudentPortfolio = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pdfGenerating, setPdfGenerating] = useState(false);

  useEffect(() => {
    fetchPortfolioData();
  }, [id]);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await studentService.getPortfolio(id);
      setPortfolioData(response.data);
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
      setError(error.response?.data?.error || "Failed to load portfolio data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
    } catch {
      return "Date not available";
    }
  };

  // Check if current user is viewing their own portfolio
  const isOwnPortfolio = currentUser && currentUser._id === id;
  // Check if current user is faculty viewing student portfolio
  const isFacultyViewing = currentUser && currentUser.role === "faculty";

  const handleDownloadPDF = async () => {
    try {
      setPdfGenerating(true);
      setError("");

      // Make POST request to generate PDF
      const response = await fetch(
        `https://cc3c1ct7-8000.inc1.devtunnels.ms/generate/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("PDF response data:", data);
      // Use pdf_url from response
      if (data.pdf_url) {
        window.open(data.pdf_url, "_blank");
      } else {
        throw new Error("No PDF URL returned from server");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError(`Failed to generate PDF: ${error.message}`);

      // Show user-friendly error message
      alert(`Failed to generate PDF: ${error.message}`);
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}/students/portfolio/${id}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        alert("Portfolio link copied to clipboard!");
      })
      .catch(() => {
        alert(`Share this link: ${shareUrl}`);
      });
  };

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="dashboard-content">
          <div className="loading-container">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <p>Loading portfolio...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-dashboard">
        <div className="dashboard-content">
          <div className="error-container">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Error Loading Portfolio</h2>
            <p>{error}</p>
            <button onClick={fetchPortfolioData} className="retry-btn">
              <i className="fas fa-redo"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!portfolioData?.student) {
    return (
      <div className="student-dashboard">
        <div className="dashboard-content">
          <div className="no-data-container">
            <div className="no-data-icon">
              <i className="fas fa-user-slash"></i>
            </div>
            <h2>Student Not Found</h2>
            <p>The requested student portfolio could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  const { student, groupedAchievements } = portfolioData;
  const studentName = `${student.name.first} ${student.name.last || ""}`.trim();

  // Check if portfolio is completely empty
  const hasAnyAchievements =
    groupedAchievements &&
    ((groupedAchievements.certifications &&
      groupedAchievements.certifications.length > 0) ||
      (groupedAchievements.internships &&
        groupedAchievements.internships.length > 0) ||
      (groupedAchievements.competitions &&
        groupedAchievements.competitions.length > 0) ||
      (groupedAchievements.workshops &&
        groupedAchievements.workshops.length > 0));

  return (
    <div className="student-dashboard">
      <div className="dashboard-content">
        <div className="portfolio-container">
          {/* Portfolio Header */}
          <div className="portfolio-header">
            <div className="profile-section">
              <div className="profile-avatar">
                <span>
                  {studentName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div className="profile-info">
                <h1>{studentName}</h1>
                <p>
                  {student.department?.name || "Department not specified"} •{" "}
                  {student.batch || "Batch not specified"}
                </p>
                <p>
                  {student.gpa
                    ? `CGPA ${student.gpa.toFixed(2)}/10`
                    : "CGPA not available"}{" "}
                  •
                  {student.studentID
                    ? ` Roll No: ${student.studentID}`
                    : " Roll No not available"}
                </p>
              </div>
            </div>
            <div className="portfolio-actions">
              <button
                className="download-btn"
                onClick={handleDownloadPDF}
                disabled={pdfGenerating}
              >
                {pdfGenerating ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <i className="fas fa-download"></i>
                    Download PDF
                  </>
                )}
              </button>
              <button className="share-btn" onClick={handleShareLink}>
                <i className="fas fa-share"></i>
                Share Link
              </button>
            </div>
          </div>

          {/* Show empty state if no achievements */}
          {!hasAnyAchievements ? (
            <div className="empty-portfolio-main">
              <div className="empty-portfolio-content">
                <div className="empty-portfolio-icon">
                  <i className="fas fa-folder-open"></i>
                </div>
                <h2>Portfolio is Empty</h2>
                <p>
                  {isOwnPortfolio && !isFacultyViewing
                    ? "Start building your portfolio by uploading your achievements and activities."
                    : "This student hasn't uploaded any achievements yet."}
                </p>
                {isOwnPortfolio && !isFacultyViewing && (
                  <button
                    className="add-activity-btn"
                    onClick={() => navigate(`/students/upload/${id}`)}
                  >
                    <i className="fas fa-plus"></i>
                    Add Your First Activity
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Portfolio Content Grid - Only show if has achievements */
            <div className="portfolio-grid">
              {/* Certifications Section */}
              <div className="portfolio-section certifications">
                <div className="section-header">
                  <div className="section-icon certifications">
                    <i className="fas fa-certificate"></i>
                  </div>
                  <h2>Certifications</h2>
                </div>
                <div className="section-content">
                  {groupedAchievements?.certifications &&
                  groupedAchievements.certifications.length > 0 ? (
                    groupedAchievements.certifications.map((cert, index) => (
                      <div key={index} className="portfolio-item">
                        <div className="item-content">
                          <h3>{cert.title || "Untitled Certification"}</h3>
                          <p className="organization">
                            {cert.type || "Certification"} •{" "}
                            {formatDate(cert.uploadedAt)}
                          </p>
                          {cert.description && (
                            <p className="description">{cert.description}</p>
                          )}
                          <div
                            className={`status-badge status-${(
                              cert.status || "pending"
                            ).toLowerCase()}`}
                          >
                            {cert.status || "Pending"}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-section">
                      <i className="fas fa-certificate"></i>
                      <p>No certifications yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Internships Section */}
              <div className="portfolio-section internships">
                <div className="section-header">
                  <div className="section-icon internships">
                    <i className="fas fa-briefcase"></i>
                  </div>
                  <h2>Internships</h2>
                </div>
                <div className="section-content">
                  {groupedAchievements?.internships &&
                  groupedAchievements.internships.length > 0 ? (
                    groupedAchievements.internships.map((internship, index) => (
                      <div key={index} className="portfolio-item">
                        <div className="item-content">
                          <h3>{internship.title || "Untitled Internship"}</h3>
                          <p className="organization">
                            {internship.type || "Internship"} •{" "}
                            {formatDate(internship.uploadedAt)}
                          </p>
                          {internship.description && (
                            <p className="description">
                              {internship.description}
                            </p>
                          )}
                          <div
                            className={`status-badge status-${(
                              internship.status || "pending"
                            ).toLowerCase()}`}
                          >
                            {internship.status || "Pending"}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-section">
                      <i className="fas fa-briefcase"></i>
                      <p>No internships yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Competitions Section */}
              <div className="portfolio-section competitions">
                <div className="section-header">
                  <div className="section-icon competitions">
                    <i className="fas fa-trophy"></i>
                  </div>
                  <h2>Competitions</h2>
                </div>
                <div className="section-content">
                  {groupedAchievements?.competitions &&
                  groupedAchievements.competitions.length > 0 ? (
                    groupedAchievements.competitions.map(
                      (competition, index) => (
                        <div key={index} className="portfolio-item">
                          <div className="item-content">
                            <h3>
                              {competition.title || "Untitled Competition"}
                            </h3>
                            <p className="organization">
                              {competition.type || "Competition"} •{" "}
                              {formatDate(competition.uploadedAt)}
                            </p>
                            {competition.description && (
                              <p className="description">
                                {competition.description}
                              </p>
                            )}
                            <div
                              className={`status-badge status-${(
                                competition.status || "pending"
                              ).toLowerCase()}`}
                            >
                              {competition.status || "Pending"}
                            </div>
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div className="empty-section">
                      <i className="fas fa-trophy"></i>
                      <p>No competitions yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Workshops Section */}
              <div className="portfolio-section workshops">
                <div className="section-header">
                  <div className="section-icon workshops">
                    <i className="fas fa-users"></i>
                  </div>
                  <h2>Workshops</h2>
                </div>
                <div className="section-content">
                  {groupedAchievements?.workshops &&
                  groupedAchievements.workshops.length > 0 ? (
                    groupedAchievements.workshops.map((workshop, index) => (
                      <div key={index} className="portfolio-item">
                        <div className="item-content">
                          <h3>{workshop.title || "Untitled Workshop"}</h3>
                          <p className="organization">
                            {workshop.type || "Workshop"} •{" "}
                            {formatDate(workshop.uploadedAt)}
                          </p>
                          {workshop.description && (
                            <p className="description">
                              {workshop.description}
                            </p>
                          )}
                          <div
                            className={`status-badge status-${(
                              workshop.status || "pending"
                            ).toLowerCase()}`}
                          >
                            {workshop.status || "Pending"}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-section">
                      <i className="fas fa-users"></i>
                      <p>No workshops yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPortfolio;
