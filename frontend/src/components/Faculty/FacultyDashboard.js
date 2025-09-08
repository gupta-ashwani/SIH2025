import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { facultyService } from "../../services/authService";
import "./Faculty.css";

const FacultyDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
    venue: "",
    eventType: "Academic",
    targetAudience: "All",
    maxParticipants: "",
    registrationRequired: false,
    registrationDeadline: "",
    tags: [],
  });

  useEffect(() => {
    // If user is logged in as faculty and trying to access wrong dashboard, redirect to their own
    if (
      currentUser &&
      currentUser.role === "faculty" &&
      currentUser._id !== id
    ) {
      navigate(`/faculty/dashboard/${currentUser._id}`);
      return;
    }
    fetchDashboardData();
    fetchUpcomingEvents();
  }, [id, currentUser]);

  const fetchUpcomingEvents = async () => {
    try {
      setLoadingEvents(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3030/api'}/events/faculty/${id}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok) {
        setUpcomingEvents(data.events || []);
      } else {
        console.error("Failed to fetch events:", data.error);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Additional security check: Ensure current user can access this faculty dashboard
      if (
        currentUser &&
        currentUser.role === "faculty" &&
        currentUser._id !== id
      ) {
        setError("Access denied. You can only access your own dashboard.");
        return;
      }

      const response = await facultyService.getFacultyDashboard(id);
      setDashboardData(response.data);
    } catch (error) {
      console.error("Dashboard error:", error);
      if (error.response?.status === 403) {
        setError("Access denied. You can only access your own dashboard.");
      } else if (error.response?.status === 401) {
        setError("Please log in to access your dashboard.");
        navigate("/login");
      } else {
        setError(
          error.response?.data?.error || "Failed to load dashboard data"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Date not available";
    }
  };

  const formatEventDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Date not available";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "#10b981";
      case "rejected":
        return "#ef4444";
      case "pending":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const handleReviewAchievement = (achievementId, studentId) => {
    navigate(`/faculty/review/${id}/${achievementId}/${studentId}`);
  };

  const handleEventInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const eventData = {
        ...eventForm,
        maxParticipants: eventForm.maxParticipants
          ? parseInt(eventForm.maxParticipants)
          : null,
      };

      console.log("Creating event with data:", eventData);

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3030/api'}/events/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(eventData),
      });

      const data = await response.json();
      console.log("Response status:", response.status);
      console.log("Response data:", data);

      if (response.ok) {
        setShowEventForm(false);
        setEventForm({
          title: "",
          description: "",
          eventDate: "",
          eventTime: "",
          venue: "",
          eventType: "Academic",
          targetAudience: "All",
          maxParticipants: "",
          registrationRequired: false,
          registrationDeadline: "",
          tags: [],
        });
        fetchUpcomingEvents(); // Refresh events
        alert("Event created successfully!");
      } else {
        console.error("Event creation failed:", data);
        const errorMessage = data.details
          ? `${data.error}: ${
              Array.isArray(data.details)
                ? data.details.join(", ")
                : data.details
            }`
          : data.error || "Failed to create event";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert(`Network error: ${error.message || "Failed to create event"}`);
    }
  };

  if (loading) {
    return (
      <div className="faculty-dashboard">
        <div className="dashboard-content">
          <div className="loading-container">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="faculty-dashboard">
        <div className="dashboard-content">
          <div className="error-container">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Error Loading Dashboard</h2>
            <p>{error}</p>
            <button onClick={fetchDashboardData} className="retry-btn">
              <i className="fas fa-redo"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData || !dashboardData.faculty) {
    return (
      <div className="faculty-dashboard">
        <div className="dashboard-content">
          <div className="no-data-container">
            <div className="no-data-icon">
              <i className="fas fa-user-slash"></i>
            </div>
            <h2>Faculty Not Found</h2>
            <p>The requested faculty data could not be found.</p>
            <button onClick={fetchDashboardData} className="retry-btn">
              <i className="fas fa-redo"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { faculty, stats, pendingReviews, recentActivities, studentStats } =
    dashboardData;
  const facultyFirstName = faculty?.name?.first || "Faculty";
  const facultyLastName = faculty?.name?.last || "";
  const fullName = `${facultyFirstName} ${facultyLastName}`.trim();

  return (
    <div className="faculty-dashboard">
      {/* Welcome Section - Full Width */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>
            Welcome back, {faculty?.designation} {facultyFirstName}!
          </h1>
          <p>
            {faculty?.department?.name || "Department not specified"} •{" "}
            {faculty?.designation || "Faculty"}
            {faculty?.facultyID && ` • ID: ${faculty.facultyID}`}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Students</div>
              <div className="stat-number">{stats?.totalStudents || 0}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Pending Reviews</div>
              <div className="stat-number">{stats?.pendingReviews || 0}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Approved This Month</div>
              <div className="stat-number">{stats?.approvedThisMonth || 0}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-trophy"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Reviewed</div>
              <div className="stat-number">{stats?.totalReviewed || 0}</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="main-content-grid">
          {/* Pending Reviews */}
          <div className="content-card reviews-card">
            <div className="card-header">
              <h2>Pending Reviews</h2>
              <button
                className="add-new-btn"
                onClick={() => navigate(`/faculty/reviews/${id}`)}
              >
                View All
              </button>
            </div>
            <div className="activities-list">
              {pendingReviews && pendingReviews.length > 0 ? (
                pendingReviews.slice(0, 5).map((review, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      <i className="fas fa-file-alt"></i>
                    </div>
                    <div className="activity-content">
                      <h3>
                        {review.achievement?.title || "Untitled Achievement"}
                      </h3>
                      <p>
                        {review.student?.name?.first}{" "}
                        {review.student?.name?.last} •{" "}
                        {review.achievement?.type || "General"} •{" "}
                        {formatDate(review.achievement?.uploadedAt)}
                      </p>
                    </div>
                    <span className="activity-status status-pending">
                      Review
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="fas fa-clipboard-check"></i>
                  </div>
                  <h3>No Pending Reviews</h3>
                  <p>All student achievements have been reviewed!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="sidebar">
            {/* Student Statistics */}
            <div className="content-card progress-card">
              <h2>Student Statistics</h2>
              <div className="progress-item">
                <div className="progress-header">
                  <span>Active Students</span>
                  <span className="progress-value">
                    {studentStats?.active || 0}/{stats?.totalStudents || 0}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        ((studentStats?.active || 0) /
                          Math.max(stats?.totalStudents || 1, 1)) *
                        100
                      }%`,
                      backgroundColor: "#10b981",
                    }}
                  ></div>
                </div>
              </div>
              <div className="progress-item">
                <div className="progress-header">
                  <span>High Performers</span>
                  <span className="progress-value">
                    {studentStats?.highPerformers || 0}/
                    {stats?.totalStudents || 0}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        ((studentStats?.highPerformers || 0) /
                          Math.max(stats?.totalStudents || 1, 1)) *
                        100
                      }%`,
                      backgroundColor: "#f59e0b",
                    }}
                  ></div>
                </div>
              </div>
              <div className="progress-item">
                <div className="progress-header">
                  <span>Recent Submissions</span>
                  <span className="progress-value">
                    {studentStats?.recentSubmissions || 0}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(
                        ((studentStats?.recentSubmissions || 0) / 10) * 100,
                        100
                      )}%`,
                      backgroundColor: "#6366f1",
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="content-card events-card">
              <div className="card-header">
                <h2>Upcoming Events</h2>
                <button
                  className="add-new-btn"
                  onClick={() => setShowEventForm(true)}
                >
                  <i className="fas fa-plus"></i>
                  Add Event
                </button>
              </div>
              <div className="events-list">
                {loadingEvents ? (
                  <div className="loading-events">
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Loading events...</span>
                  </div>
                ) : upcomingEvents && upcomingEvents.length > 0 ? (
                  upcomingEvents.slice(0, 5).map((event, index) => (
                    <div key={event._id} className="event-item">
                      <div className="event-indicator"></div>
                      <div className="event-content">
                        <h3>{event.title}</h3>
                        <p>
                          <i className="fas fa-calendar"></i>
                          {formatEventDate(event.eventDate)}
                          {event.eventTime && ` • ${event.eventTime}`}
                        </p>
                        <p>
                          <i className="fas fa-map-marker-alt"></i>
                          {event.venue}
                        </p>
                        <span className="event-type">{event.eventType}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-events">
                    <div className="event-indicator"></div>
                    <div className="event-content">
                      <h3>No upcoming events</h3>
                      <p>Create an event to get started</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Creation Modal */}
      {showEventForm && (
        <div className="modal-overlay">
          <div className="modal-content event-modal">
            <div className="modal-header">
              <h2>Create New Event</h2>
              <button
                className="close-btn"
                onClick={() => setShowEventForm(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="event-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Event Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={eventForm.title}
                    onChange={handleEventInputChange}
                    required
                    placeholder="Enter event title"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="eventType">Event Type</label>
                  <select
                    id="eventType"
                    name="eventType"
                    value={eventForm.eventType}
                    onChange={handleEventInputChange}
                  >
                    <option value="Academic">Academic</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Conference">Conference</option>
                    <option value="Competition">Competition</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={eventForm.description}
                  onChange={handleEventInputChange}
                  required
                  rows="3"
                  placeholder="Enter event description"
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="eventDate">Event Date *</label>
                  <input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    value={eventForm.eventDate}
                    onChange={handleEventInputChange}
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="eventTime">Event Time</label>
                  <input
                    type="time"
                    id="eventTime"
                    name="eventTime"
                    value={eventForm.eventTime}
                    onChange={handleEventInputChange}
                    placeholder="e.g., 10:00 AM"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="venue">Venue *</label>
                <input
                  type="text"
                  id="venue"
                  name="venue"
                  value={eventForm.venue}
                  onChange={handleEventInputChange}
                  required
                  placeholder="Enter event venue"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="targetAudience">Target Audience</label>
                  <select
                    id="targetAudience"
                    name="targetAudience"
                    value={eventForm.targetAudience}
                    onChange={handleEventInputChange}
                  >
                    <option value="All">All</option>
                    <option value="Students">Students Only</option>
                    <option value="Faculty">Faculty Only</option>
                    <option value="First Year">First Year</option>
                    <option value="Second Year">Second Year</option>
                    <option value="Third Year">Third Year</option>
                    <option value="Final Year">Final Year</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="maxParticipants">Max Participants</label>
                  <input
                    type="number"
                    id="maxParticipants"
                    name="maxParticipants"
                    value={eventForm.maxParticipants}
                    onChange={handleEventInputChange}
                    min="1"
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="registrationRequired"
                    checked={eventForm.registrationRequired}
                    onChange={handleEventInputChange}
                  />
                  <span className="checkmark"></span>
                  Registration Required
                </label>
              </div>

              {eventForm.registrationRequired && (
                <div className="form-group">
                  <label htmlFor="registrationDeadline">
                    Registration Deadline
                  </label>
                  <input
                    type="date"
                    id="registrationDeadline"
                    name="registrationDeadline"
                    value={eventForm.registrationDeadline}
                    onChange={handleEventInputChange}
                    min={new Date().toISOString().split("T")[0]}
                    max={eventForm.eventDate}
                  />
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowEventForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  <i className="fas fa-plus"></i>
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
