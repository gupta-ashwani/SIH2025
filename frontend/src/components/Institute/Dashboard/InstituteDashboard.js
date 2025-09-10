import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { instituteService, eventService } from "../../../services/authService";
import "./InstituteDashboard.css";

const InstituteDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
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
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    email: "",
    password: "",
    contactNumber: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
    },
    website: "",
    type: "Engineering College",
    status: "Active",
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await instituteService.getInstituteDashboard(id);
      setDashboardData(response.data);
    } catch (error) {
      setError("Failed to load dashboard data");
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchUpcomingEvents = useCallback(async () => {
    try {
      setLoadingEvents(true);
      const response = await eventService.getInstituteEvents(id, {
        limit: "10",
      });
      setUpcomingEvents(response.data.events || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setUpcomingEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDashboardData();
    fetchUpcomingEvents();
  }, [fetchDashboardData, fetchUpcomingEvents]);

  const handleNavigate = (route) => {
    navigate(`/institute/${route}/${id}`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddCollege = async (e) => {
    e.preventDefault();
    try {
      setAddLoading(true);
      const collegeData = {
        ...formData,
        institute: id,
      };

      await instituteService.addCollege(collegeData);

      // Reset form and close modal
      setFormData({
        name: "",
        code: "",
        email: "",
        password: "",
        contactNumber: "",
        address: {
          line1: "",
          line2: "",
          city: "",
          state: "",
          country: "",
          pincode: "",
        },
        website: "",
        type: "Engineering College",
        status: "Active",
      });
      setShowAddModal(false);

      // Refresh dashboard data
      await fetchDashboardData();
    } catch (error) {
      setError("Failed to add college");
      console.error("Add college error:", error);
    } finally {
      setAddLoading(false);
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setFormData({
      name: "",
      code: "",
      email: "",
      password: "",
      contactNumber: "",
      address: {
        line1: "",
        line2: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
      },
      website: "",
      status: "Active",
    });
  };

  // Event-related functions
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

      const response = await eventService.createEvent(eventData);

      if (response.status === 201) {
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
      }
    } catch (error) {
      console.error("Error creating event:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to create event";
      alert(errorMessage);
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

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <div className="alert alert-danger">
          <h4>Error Loading Dashboard</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const { institute, stats } = dashboardData;

  return (
    <div className="institute-dashboard">
      {/* Welcome Section */}
      <div className="dashboard-card welcome-section">
        <div className="welcome-content">
          <div className="welcome-text">
            <h1>{institute.name}</h1>
            <p>Institute Dashboard - Comprehensive Management Overview</p>
            <div className="institute-meta">
              <span className="institute-code">Code: {institute.code}</span>
              <span className="institute-type">Type: {institute.type}</span>
            </div>
          </div>
          <div className="welcome-icon">
            <i className="fas fa-university"></i>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="quick-stat-card static">
          <div className="quick-stat-icon">
            <i className="fas fa-building"></i>
          </div>
          <div className="quick-stat-number">{stats.totalColleges}</div>
          <div className="quick-stat-label">Colleges</div>
        </div>

        <div className="quick-stat-card static">
          <div className="quick-stat-icon">
            <i className="fas fa-chalkboard-teacher"></i>
          </div>
          <div className="quick-stat-number">{stats.totalFaculty}</div>
          <div className="quick-stat-label">Faculty Members</div>
        </div>

        <div className="quick-stat-card static">
          <div className="quick-stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="quick-stat-number">{stats.totalStudents}</div>
          <div className="quick-stat-label">Students</div>
        </div>

        <div className="quick-stat-card static">
          <div className="quick-stat-icon">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div className="quick-stat-number">{stats.totalEvents}</div>
          <div className="quick-stat-label">Events</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Management Sections */}
        <div className="dashboard-card management-card">
          <h3>
            <i className="fas fa-cogs"></i>
            Quick Management
          </h3>
          <div className="management-buttons">
            <button
              className="management-btn colleges"
              onClick={() => handleNavigate("colleges")}
            >
              <i className="fas fa-building"></i>
              <span>Manage Colleges</span>
              <small>{stats.totalColleges} colleges</small>
            </button>

            <button
              className="management-btn add-college"
              onClick={() => setShowAddModal(true)}
            >
              <i className="fas fa-plus"></i>
              <span>Add College</span>
              <small>Create new college</small>
            </button>

            <button
              className="management-btn faculty"
              onClick={() => handleNavigate("faculty")}
            >
              <i className="fas fa-chalkboard-teacher"></i>
              <span>Manage Faculty</span>
              <small>{stats.activeFaculty} active</small>
            </button>

            <button
              className="management-btn students"
              onClick={() => handleNavigate("students")}
            >
              <i className="fas fa-users"></i>
              <span>Manage Students</span>
              <small>{stats.activeStudents} active</small>
            </button>

            <button
              className="management-btn reports"
              onClick={() => handleNavigate("reports")}
            >
              <i className="fas fa-file-alt"></i>
              <span>Generate Report</span>
            </button>
          </div>
        </div>

        {/* College Overview */}
        <div className="dashboard-card">
          <h3>
            <i className="fas fa-university"></i>
            College Overview
          </h3>
          <div className="college-overview">
            {dashboardData.collegeStats &&
              dashboardData.collegeStats
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 2)
                .map((college, index) => (
                  <div key={index} className="college-item">
                    <div className="college-info">
                      <div className="college-name">{college.name}</div>
                      <div className="college-type">
                        {college.type || "Engineering College"}
                      </div>
                    </div>
                    <div className="college-stats">
                      <div className="stat">
                        <span className="stat-value">
                          {college.departmentCount}
                        </span>
                        <span className="stat-label">Departments</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">
                          {college.facultyCount}
                        </span>
                        <span className="stat-label">Faculty</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">
                          {college.studentCount}
                        </span>
                        <span className="stat-label">Students</span>
                      </div>
                    </div>
                  </div>
                ))}
            {dashboardData.collegeStats &&
              dashboardData.collegeStats.length > 2 && (
                <button
                  className="view-all-btn"
                  onClick={() => handleNavigate("colleges")}
                >
                  Show More Colleges ({dashboardData.collegeStats.length} total)
                </button>
              )}
            {(!dashboardData.collegeStats ||
              dashboardData.collegeStats.length === 0) && (
              <p className="no-data">No colleges found</p>
            )}
          </div>
        </div>

        {/* Recent Events */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>
              <i className="fas fa-calendar"></i>
              Upcoming Events
            </h3>
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
              <>
                {upcomingEvents.slice(0, 2).map((event) => (
                  <div key={event._id} className="event-item">
                    <div className="event-indicator"></div>
                    <div className="event-content">
                      <h4>{event.title}</h4>
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
                ))}
                {upcomingEvents.length > 2 && (
                  <div className="show-more-container">
                    <button
                      className="show-more-btn"
                      onClick={() => navigate(`/institute/events/${id}`)}
                    >
                      <i className="fas fa-calendar-plus"></i>
                      View All Events ({upcomingEvents.length} total)
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-events">
                <div className="event-indicator"></div>
                <div className="event-content">
                  <h4>No upcoming events</h4>
                  <p>Create an event to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add College Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fas fa-university"></i>
                Add New College
              </h2>
              <button className="close-btn" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleAddCollege} className="add-college-form">
              <div className="form-grid">
                {/* Basic Information */}
                <div className="form-section">
                  <h3>Basic Information</h3>

                  <div className="form-group">
                    <label htmlFor="name">College Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter college name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="code">College Code *</label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter unique college code"
                      style={{ textTransform: "uppercase" }}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter email address"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password *</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter password"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contactNumber">Contact Number</label>
                    <input
                      type="tel"
                      id="contactNumber"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      placeholder="Enter contact number"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="website">Website</label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="Enter website URL"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="type">College Type</label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                    >
                      <option value="Engineering College">
                        Engineering College
                      </option>
                      <option value="Medical College">Medical College</option>
                      <option value="Arts College">Arts College</option>
                      <option value="Science College">Science College</option>
                      <option value="Commerce College">Commerce College</option>
                      <option value="Law College">Law College</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Address Information */}
                <div className="form-section">
                  <h3>Address Information</h3>

                  <div className="form-group">
                    <label htmlFor="address.line1">Address Line 1</label>
                    <input
                      type="text"
                      id="address.line1"
                      name="address.line1"
                      value={formData.address.line1}
                      onChange={handleInputChange}
                      placeholder="Enter address line 1"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address.line2">Address Line 2</label>
                    <input
                      type="text"
                      id="address.line2"
                      name="address.line2"
                      value={formData.address.line2}
                      onChange={handleInputChange}
                      placeholder="Enter address line 2"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="address.city">City</label>
                      <input
                        type="text"
                        id="address.city"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleInputChange}
                        placeholder="Enter city"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="address.state">State</label>
                      <input
                        type="text"
                        id="address.state"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleInputChange}
                        placeholder="Enter state"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="address.country">Country</label>
                      <input
                        type="text"
                        id="address.country"
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleInputChange}
                        placeholder="Enter country"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="address.pincode">Pincode</label>
                      <input
                        type="text"
                        id="address.pincode"
                        name="address.pincode"
                        value={formData.address.pincode}
                        onChange={handleInputChange}
                        placeholder="Enter pincode"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                  disabled={addLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={addLoading}
                >
                  {addLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Adding...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus"></i>
                      Add College
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstituteDashboard;
