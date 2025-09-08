import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3030/api";

// Configure axios defaults
axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const authService = {
  login: (email, password) => {
    return api.post("/auth/login", { email, password });
  },

  logout: () => {
    return api.post("/auth/logout");
  },

  checkStatus: () => {
    return api.get("/auth/status");
  },
};

export const dashboardService = {
  getDashboard: (role) => {
    return api.get(`/dashboard/${role}`);
  },
};

export const studentService = {
  getStudentDashboard: (id) => {
    return api.get(`/students/dashboard/${id}`);
  },

  uploadAchievement: (id, formData) => {
    return api.post(`/students/upload/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getPortfolio: (id) => {
    return api.get(`/students/portfolio/${id}`);
  },

  getAnalytics: (id) => {
    return api.get(`/students/analytics/${id}`);
  },

  getEvents: (id) => {
    return api.get(`/events/student/${id}`);
  },

  // New profile-related endpoints
  getStudentProfile: (id) => {
    return api.get(`/students/profile/${id}`);
  },

  updateProfile: (id, profileData) => {
    return api.put(`/students/profile/${id}`, profileData);
  },

  uploadProfilePicture: (id, formData) => {
    return api.post(`/students/profile/${id}/picture`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export const facultyService = {
  getFacultyDashboard: (id) => {
    return api.get(`/faculty/dashboard/${id}`);
  },

  getReviews: (id, filter = "all") => {
    return api.get(`/faculty/reviews/${id}?filter=${filter}`);
  },

  reviewAchievement: (facultyId, achievementId, reviewData) => {
    return api.post(
      `/faculty/review/${facultyId}/${achievementId}`,
      reviewData
    );
  },

  getStudents: (id) => {
    return api.get(`/faculty/students/${id}`);
  },

  getAnalytics: (id, period = "month") => {
    return api.get(`/faculty/analytics/${id}?period=${period}`);
  },

  generateReport: (id, reportType, params) => {
    return api.post(`/faculty/reports/${id}`, { reportType, ...params });
  },
};

export const eventService = {
  getCollegeEvents: (collegeId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/events/college/${collegeId}?${queryString}`);
  },

  getFacultyEvents: (facultyId) => {
    return api.get(`/events/faculty/${facultyId}`);
  },

  createEvent: (eventData) => {
    return api.post("/events/create", eventData);
  },

  updateEvent: (eventId, eventData) => {
    return api.put(`/events/${eventId}`, eventData);
  },

  deleteEvent: (eventId) => {
    return api.delete(`/events/${eventId}`);
  },

  getEvent: (eventId) => {
    return api.get(`/events/${eventId}`);
  },

  registerForEvent: (eventId) => {
    return api.post(`/events/${eventId}/register`);
  },
};

export default api;
