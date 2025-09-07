import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { facultyService } from "../../services/authService";
import "./Faculty.css";

const FacultyReviews = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchReviews();
  }, [id, filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await facultyService.getReviews(id, filter);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error("Reviews error:", error);
      setError(error.response?.data?.error || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (achievementId, studentId, status, comment) => {
    try {
      await facultyService.reviewAchievement(id, achievementId, {
        status,
        comment,
        studentId,
      });
      fetchReviews(); // Refresh the list
    } catch (error) {
      console.error("Review error:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "Course":
      case "Certification":
        return "fas fa-certificate";
      case "Internship":
        return "fas fa-briefcase";
      case "Competition":
      case "Hackathon":
        return "fas fa-trophy";
      case "Workshop":
      case "Conference":
        return "fas fa-chalkboard-teacher";
      case "CommunityService":
        return "fas fa-hands-helping";
      case "Leadership":
        return "fas fa-users-cog";
      default:
        return "fas fa-star";
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.achievement?.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      review.student?.name?.first
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      review.student?.name?.last
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="faculty-dashboard">
        <div className="dashboard-content">
          <div className="loading-container">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <p>Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="faculty-dashboard">
      {/* Welcome Section - Full Width */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>Achievement Reviews</h1>
          <p>Review and approve student achievements</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Filters and Search */}
        <div className="reviews-controls">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All Reviews
            </button>
            <button
              className={`filter-tab ${filter === "pending" ? "active" : ""}`}
              onClick={() => setFilter("pending")}
            >
              Pending
            </button>
            <button
              className={`filter-tab ${filter === "approved" ? "active" : ""}`}
              onClick={() => setFilter("approved")}
            >
              Approved
            </button>
            <button
              className={`filter-tab ${filter === "rejected" ? "active" : ""}`}
              onClick={() => setFilter("rejected")}
            >
              Rejected
            </button>
          </div>

          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search achievements or students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Reviews Table */}
        <div className="reviews-container">
          {filteredReviews.length > 0 ? (
            <div className="reviews-table">
              <div className="table-header">
                <div className="table-header-cell student-col">STUDENT</div>
                <div className="table-header-cell activity-col">ACTIVITY</div>
                <div className="table-header-cell type-col">TYPE</div>
                <div className="table-header-cell submitted-col">SUBMITTED</div>
                <div className="table-header-cell status-col">STATUS</div>
                <div className="table-header-cell actions-col">ACTIONS</div>
              </div>
              <div className="table-body">
                {filteredReviews.map((review, index) => (
                  <ReviewRow
                    key={index}
                    review={review}
                    onReview={handleReview}
                    formatDate={formatDate}
                    getActivityIcon={getActivityIcon}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-clipboard-check"></i>
              </div>
              <h3>No Reviews Found</h3>
              <p>
                {searchTerm
                  ? `No reviews match "${searchTerm}"`
                  : `No ${filter === "all" ? "" : filter} reviews available`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReviewRow = ({ review, onReview, formatDate, getActivityIcon }) => {
  const [showModal, setShowModal] = useState(false);
  const [comment, setComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState("");

  const handleSubmitReview = () => {
    if (reviewStatus) {
      onReview(
        review.achievement._id,
        review.student._id,
        reviewStatus,
        comment
      );
      setShowModal(false);
      setComment("");
      setReviewStatus("");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "status-approved";
      case "rejected":
        return "status-rejected";
      case "pending":
      default:
        return "status-pending";
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type?.toLowerCase()) {
      case "conference":
        return "type-conference";
      case "certification":
        return "type-certification";
      case "competition":
        return "type-competition";
      case "internship":
        return "type-internship";
      default:
        return "type-default";
    }
  };

  return (
    <>
      <div className="table-row">
        <div className="table-cell student-col">
          <div className="student-info">
            <div className="student-avatar">
              {review.student?.name?.first?.charAt(0) || "S"}
              {review.student?.name?.last?.charAt(0) || ""}
            </div>
            <div className="student-details">
              <div className="student-name">
                {review.student?.name?.first} {review.student?.name?.last}
              </div>
              <div className="student-class">
                {review.student?.course} - {review.student?.year}
              </div>
            </div>
          </div>
        </div>

        <div className="table-cell activity-col">
          <div className="activity-title">
            {review.achievement?.title || "Untitled Achievement"}
          </div>
        </div>

        <div className="table-cell type-col">
          <span
            className={`type-badge ${getTypeBadgeClass(
              review.achievement?.type
            )}`}
          >
            {review.achievement?.type || "Other"}
          </span>
        </div>

        <div className="table-cell submitted-col">
          {formatDate(review.achievement?.uploadedAt)}
        </div>

        <div className="table-cell status-col">
          <span
            className={`status-badge ${getStatusBadgeClass(
              review.achievement?.status || "pending"
            )}`}
          >
            {review.achievement?.status === "Pending"
              ? "Pending Review"
              : review.achievement?.status === "Rejected"
              ? "Needs Revision"
              : review.achievement?.status || "Pending Review"}
          </span>
        </div>

        <div className="table-cell actions-col">
          {(!review.achievement?.status ||
            review.achievement?.status === "Pending") && (
            <div className="action-buttons">
              <button
                className="action-btn review-btn"
                onClick={() => setShowModal(true)}
              >
                Review
              </button>
              <button
                className="action-btn approve-btn"
                onClick={() =>
                  onReview(
                    review.achievement._id,
                    review.student._id,
                    "Approved",
                    ""
                  )
                }
              >
                Approve
              </button>
              <button
                className="action-btn reject-btn"
                onClick={() =>
                  onReview(
                    review.achievement._id,
                    review.student._id,
                    "Rejected",
                    ""
                  )
                }
              >
                Reject
              </button>
            </div>
          )}
          {review.achievement?.status &&
            review.achievement?.status !== "Pending" && (
              <button className="action-btn view-details-btn">
                View Details
              </button>
            )}
        </div>
      </div>

      {/* Review Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Review Achievement</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-content">
              <div className="achievement-details">
                <h3>{review.achievement?.title}</h3>
                <p>
                  <strong>Student:</strong> {review.student?.name?.first}{" "}
                  {review.student?.name?.last}
                </p>
                <p>
                  <strong>Type:</strong> {review.achievement?.type}
                </p>
                <p>
                  <strong>Description:</strong>{" "}
                  {review.achievement?.description}
                </p>
                <p>
                  <strong>Submitted:</strong>{" "}
                  {formatDate(review.achievement?.uploadedAt)}
                </p>
              </div>

              <div className="review-form">
                <div className="status-selection">
                  <label>Review Decision:</label>
                  <div className="status-buttons">
                    <button
                      className={`status-btn approve ${
                        reviewStatus === "Approved" ? "active" : ""
                      }`}
                      onClick={() => setReviewStatus("Approved")}
                    >
                      <i className="fas fa-check"></i>
                      Approve
                    </button>
                    <button
                      className={`status-btn reject ${
                        reviewStatus === "Rejected" ? "active" : ""
                      }`}
                      onClick={() => setReviewStatus("Rejected")}
                    >
                      <i className="fas fa-times"></i>
                      Reject
                    </button>
                  </div>
                </div>

                <div className="comment-section">
                  <label htmlFor="comment">Comment (Optional):</label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add your feedback..."
                    rows="4"
                  />
                </div>

                <div className="modal-actions">
                  <button
                    className="cancel-btn"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="submit-btn"
                    onClick={handleSubmitReview}
                    disabled={!reviewStatus}
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FacultyReviews;
