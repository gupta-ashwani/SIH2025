import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3030/api";

// Configure axios defaults
axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add request interceptor to include token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, remove it and redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("token");
    } catch (error) {
      // Even if logout fails on server, remove token locally
      localStorage.removeItem("token");
      throw error;
    }
  },

  checkStatus: () => {
    return api.get("/auth/status");
  },
};

export const dashboardService = {
  getDashboard: (role) => {
    return api.get(`/dashboard/${role}`);
  },

  // Super Admin specific endpoints
  getPendingInstitutions: () => {
    return api.get("/dashboard/superadmin/pending-institutions");
  },

  approveInstitution: (institutionId) => {
    return api.post(`/dashboard/superadmin/approve-institution/${institutionId}`);
  },

  rejectInstitution: (institutionId, reason) => {
    return api.post(`/dashboard/superadmin/reject-institution/${institutionId}`, { reason });
  },

  getPlatformHealth: () => {
    return api.get("/dashboard/superadmin/platform-health");
  },

  getRecentActivity: () => {
    return api.get("/dashboard/superadmin/recent-activity");
  },

  createTestInstitutions: () => {
    return api.post("/dashboard/superadmin/create-test-institutions");
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

export const departmentService = {
  getDepartmentDashboard: (id) => {
    return api.get(`/department/dashboard/${id}`);
  },

  addFaculty: (departmentId, facultyData) => {
    return api.post(`/department/${departmentId}/faculty`, facultyData);
  },

  getFaculty: (departmentId) => {
    return api.get(`/department/${departmentId}/faculty`);
  },

  getStudents: (departmentId) => {
    return api.get(`/department/${departmentId}/students`);
  },

  getAnalytics: (departmentId, period = "month") => {
    return api.get(`/department/analytics/${departmentId}?period=${period}`);
  },

  generateReport: (departmentId, reportType, params) => {
    return api.post(`/department/reports/${departmentId}`, {
      reportType,
      ...params,
    });
  },
};

export const eventService = {
  getCollegeEvents: (collegeId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/events/college/${collegeId}?${queryString}`);
  },

  getInstituteEvents: (instituteId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/events/institute/${instituteId}?${queryString}`);
  },

  getFacultyEvents: (facultyId) => {
    return api.get(`/events/faculty/${facultyId}`);
  },

  getDepartmentEvents: (departmentId) => {
    return api.get(`/events/department/${departmentId}`);
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

export const instituteService = {
  getInstituteDashboard: (id) => {
    return api.get(`/institute/dashboard/${id}`);
  },

  getInstituteReports: (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/institute/reports/${id}?${queryString}`);
  },

  getColleges: (id) => {
    return api.get(`/institute/colleges/${id}`);
  },

  addCollege: (collegeData) => {
    return api.post(`/institute/colleges`, collegeData);
  },

  getDepartments: (id) => {
    return api.get(`/institute/departments/${id}`);
  },

  getFaculty: (id) => {
    return api.get(`/institute/faculty/${id}`);
  },

  getStudents: (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/institute/students/${id}?${queryString}`);
  },

  getAnalytics: (id) => {
    return api.get(`/institute/analytics/${id}`);
  },
};

export default api;
