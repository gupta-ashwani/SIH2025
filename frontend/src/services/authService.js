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
};

export const facultyService = {
  getFacultyDashboard: (id) => {
    return api.get(`/faculty/dashboard/${id}`);
  },

  getReviews: (id, filter = "all") => {
    return api.get(`/faculty/reviews/${id}?filter=${filter}`);
  },

  reviewAchievement: (facultyId, achievementId, reviewData) => {
    return api.post(`/faculty/review/${facultyId}/${achievementId}`, reviewData);
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

export default api;
