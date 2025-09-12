import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3030/api";

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
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const superAdminService = {
  // Dashboard Statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get("/dashboard/superadmin");
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  },

  // Colleges Management
  getAllColleges: async (page = 1, limit = 10, search = "", status = "") => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status && { status })
      });
      
      const response = await api.get(`/dashboard/superadmin/institutes?${params}`);
      return {
        colleges: (response.data.institutes || []).map(institute => ({
          id: institute._id,
          name: institute.name,
          students: institute.totalStudents || 0,
          faculty: institute.totalFaculty || 0,
          status: institute.status || 'Active',
          lastActive: institute.lastActive || 'Recently',
          type: institute.type,
          location: institute.address?.state,
          email: institute.email,
          code: institute.code
        })),
        totalPages: response.data.totalPages || 1,
        currentPage: response.data.currentPage || 1
      };
    } catch (error) {
      console.error("Error fetching colleges:", error);
      throw error;
    }
  },

  // College Actions
  approveCollege: async (collegeId) => {
    try {
      const response = await api.post(`/dashboard/superadmin/approve-institution/${collegeId}`);
      return response.data;
    } catch (error) {
      console.error("Error approving college:", error);
      throw error;
    }
  },

  rejectCollege: async (collegeId, reason) => {
    try {
      const response = await api.post(`/dashboard/superadmin/reject-institution/${collegeId}`, { reason });
      return response.data;
    } catch (error) {
      console.error("Error rejecting college:", error);
      throw error;
    }
  },

  deleteCollege: async (collegeId) => {
    try {
      const response = await api.delete(`/superadmin/colleges/${collegeId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting college:", error);
      throw error;
    }
  },

  // System Alerts
  getSystemAlerts: async () => {
    try {
      const response = await api.get("/dashboard/superadmin/platform-health");
      return {
        alerts: [
          {
            id: 1,
            type: "info",
            message: `System Uptime: ${response.data.healthMetrics?.systemUptime || 'N/A'}`,
            time: "Live"
          },
          {
            id: 2,
            type: "info",
            message: `Active Institutions: ${response.data.healthMetrics?.activeInstitutions || 'N/A'}`,
            time: "Live"
          },
          {
            id: 3,
            type: response.data.healthMetrics?.dataSyncStatus?.includes('pending') ? 'warning' : 'info',
            message: `Data Sync: ${response.data.healthMetrics?.dataSyncStatus || 'Unknown'}`,
            time: "Live"
          }
        ]
      };
    } catch (error) {
      console.error("Error fetching system alerts:", error);
      return { alerts: [] };
    }
  },

  // Recent Activities
  getRecentActivities: async (limit = 10) => {
    try {
      const response = await api.get("/dashboard/superadmin/recent-activity");
      return {
        activities: (response.data.activities || []).map(activity => ({
          id: activity.id,
          action: activity.title,
          time: activity.time,
          type: activity.type?.includes('approved') ? 'college' : 
                activity.type?.includes('rejected') ? 'support' :
                activity.type?.includes('registered') ? 'system' : 'college'
        }))
      };
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      return { activities: [] };
    }
  },

  // System Health
  getSystemHealth: async () => {
    try {
      const response = await api.get("/superadmin/system/health");
      return response.data;
    } catch (error) {
      console.error("Error fetching system health:", error);
      throw error;
    }
  },

  // User Management
  getAllUsers: async (page = 1, limit = 10, role = "", search = "") => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(role && { role }),
        ...(search && { search }),
      });
      
      const response = await api.get(`/superadmin/users?${params}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // Admin Management
  createAdmin: async (adminData) => {
    try {
      const response = await api.post("/superadmin/admins", adminData);
      return response.data;
    } catch (error) {
      console.error("Error creating admin:", error);
      throw error;
    }
  },

  updateAdminPrivileges: async (adminId, privileges) => {
    try {
      const response = await api.put(`/superadmin/admins/${adminId}/privileges`, { privileges });
      return response.data;
    } catch (error) {
      console.error("Error updating admin privileges:", error);
      throw error;
    }
  },

  // System Management
  createBackup: async () => {
    try {
      const response = await api.post("/dashboard/superadmin/backup");
      return response.data;
    } catch (error) {
      console.error("Error creating backup:", error);
      throw error;
    }
  },

  // Institute Management
  addNewInstitute: async (instituteData) => {
    try {
      const response = await api.post("/dashboard/superadmin/add-institute", instituteData);
      return response.data;
    } catch (error) {
      console.error("Error adding institute:", error);
      throw error;
    }
  },

  // Admin Management
  addAdmin: async (adminData) => {
    try {
      const response = await api.post("/dashboard/superadmin/add-admin", adminData);
      return response.data;
    } catch (error) {
      console.error("Error adding admin:", error);
      throw error;
    }
  },

  getBackupHistory: async () => {
    try {
      const response = await api.get("/superadmin/system/backup/history");
      return response.data;
    } catch (error) {
      console.error("Error fetching backup history:", error);
      throw error;
    }
  },

  restoreBackup: async (backupId) => {
    try {
      const response = await api.post(`/superadmin/system/backup/${backupId}/restore`);
      return response.data;
    } catch (error) {
      console.error("Error restoring backup:", error);
      throw error;
    }
  },

  // Analytics
  getAnalytics: async (period = "month") => {
    try {
      const response = await api.get(`/superadmin/analytics?period=${period}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching analytics:", error);
      throw error;
    }
  },

  // Reports
  generateReport: async (reportType, params = {}) => {
    try {
      const response = await api.post("/superadmin/reports/generate", {
        type: reportType,
        ...params,
      });
      return response.data;
    } catch (error) {
      console.error("Error generating report:", error);
      throw error;
    }
  },

  downloadReport: async (reportId) => {
    try {
      const response = await api.get(`/superadmin/reports/${reportId}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error("Error downloading report:", error);
      throw error;
    }
  },

  // Platform Settings
  getPlatformSettings: async () => {
    try {
      const response = await api.get("/superadmin/settings");
      return response.data;
    } catch (error) {
      console.error("Error fetching platform settings:", error);
      throw error;
    }
  },

  updatePlatformSettings: async (settings) => {
    try {
      const response = await api.put("/superadmin/settings", settings);
      return response.data;
    } catch (error) {
      console.error("Error updating platform settings:", error);
      throw error;
    }
  },

  // Notifications
  sendNotification: async (notificationData) => {
    try {
      const response = await api.post("/superadmin/notifications/send", notificationData);
      return response.data;
    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  },

  // Pending Institutions
  getPendingInstitutions: async () => {
    try {
      const response = await api.get("/dashboard/superadmin/pending-institutions");
      return {
        institutions: (response.data.institutions || []).map((institution, index) => ({
          id: institution.id || index + 1,
          name: institution.name,
          type: institution.type,
          submittedBy: institution.submittedBy,
          submittedTime: institution.submittedTime,
          reviewStatus: institution.reviewStatus || ['under-review', 'documentation-pending', 'final-review'][index % 3],
          location: institution.location,
          email: institution.email,
          phone: institution.phone,
          appliedDate: institution.appliedDate,
          expectedStudents: institution.expectedStudents,
          expectedFaculty: institution.expectedFaculty,
          status: 'pending'
        }))
      };
    } catch (error) {
      console.error("Error fetching pending institutions:", error);
      // Return mock data for demonstration
      return { 
        institutions: [
          {
            id: 1,
            name: "Indian Institute of Science, Bangalore",
            type: "Technical University",
            submittedBy: "Dr. Rajesh Kumar",
            submittedTime: "2 days ago",
            reviewStatus: "under-review"
          },
          {
            id: 2,
            name: "National Institute of Design, Ahmedabad",
            type: "Design Institute",
            submittedBy: "Prof. Meera Sharma",
            submittedTime: "5 days ago",
            reviewStatus: "documentation-pending"
          },
          {
            id: 3,
            name: "Jawaharlal Nehru University, Delhi",
            type: "Central University",
            submittedBy: "Dr. Amit Verma",
            submittedTime: "1 week ago",
            reviewStatus: "final-review"
          }
        ]
      };
    }
  },

  // Audit Logs
  getAuditLogs: async (page = 1, limit = 50, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      });
      
      const response = await api.get(`/superadmin/audit-logs?${params}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      throw error;
    }
  },
};

export default superAdminService;
