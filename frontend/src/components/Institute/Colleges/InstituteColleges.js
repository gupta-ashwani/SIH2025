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
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
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

      // Refresh colleges list
      await fetchColleges();
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
          <button
            className="add-college-btn"
            onClick={() => setShowAddModal(true)}
          >
            <i className="fas fa-plus"></i>
            Add College
          </button>
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

export default InstituteColleges;
