const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const Institute = require("../model/institute");
const Student = require("../model/student");
const OcrOutput = require("../model/ocrOutput");
const SuperAdmin = require("../model/superadmin");
const bcrypt = require("bcrypt");
const router = express.Router();

// Super Admin Dashboard
router.get(
  "/superadmin",
  requireAuth,
  requireRole(["superadmin"]),
  async (req, res) => {
    try {
      const [institutesCount, activeStudentsCount, activitiesCount, pendingApprovalsCount] =
        await Promise.all([
          Institute.countDocuments({ approvalStatus: "Approved" }),
          Student.countDocuments({ status: "Active" }),
          OcrOutput.countDocuments({}),
          Institute.countDocuments({ approvalStatus: "Pending" }),
        ]);

      res.json({
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
        dashboardType: "superadmin",
        metrics: {
          institutes: institutesCount,
          activeStudents: activeStudentsCount,
          activitiesLogged: activitiesCount,
          pendingApprovals: pendingApprovalsCount,
        },
      });
    } catch (error) {
      console.error("Superadmin dashboard metrics error:", error);
      res.status(500).json({ error: "Failed to load dashboard metrics" });
    }
  }
);

// Get pending institution approvals
router.get(
  "/superadmin/pending-institutions",
  requireAuth,
  requireRole(["superadmin"]),
  async (req, res) => {
    try {
      const pendingInstitutions = await Institute.find({ 
        approvalStatus: "Pending" 
      }).sort({ createdAt: 1 });

      const formattedInstitutions = pendingInstitutions.map(institute => ({
        id: institute._id,
        name: institute.name,
        location: `${institute.location?.city || 'N/A'}, ${institute.location?.state || 'N/A'}`,
        type: institute.type,
        students: institute.studentCount,
        requested: getTimeAgo(institute.createdAt),
        contact: institute.email,
        avatar: institute.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase(),
        createdAt: institute.createdAt
      }));

      res.json({
        institutions: formattedInstitutions,
        count: formattedInstitutions.length
      });
    } catch (error) {
      console.error("Pending institutions fetch error:", error);
      res.status(500).json({ error: "Failed to load pending institutions" });
    }
  }
);

// Approve institution
router.post(
  "/superadmin/approve-institution/:id",
  requireAuth,
  requireRole(["superadmin"]),
  async (req, res) => {
    try {
      const institutionId = req.params.id;
      
      const institution = await Institute.findById(institutionId);
      if (!institution) {
        return res.status(404).json({ error: "Institution not found" });
      }

      if (institution.approvalStatus !== "Pending") {
        return res.status(400).json({ error: "Institution is not pending approval" });
      }

      // Update institution status
      await Institute.findByIdAndUpdate(institutionId, {
        approvalStatus: "Approved",
        status: "Active",
        approvedBy: req.user._id,
        approvedAt: new Date()
      });

      res.json({
        message: "Institution approved successfully",
        institution: {
          id: institution._id,
          name: institution.name,
          status: "Approved"
        }
      });
    } catch (error) {
      console.error("Institution approval error:", error);
      res.status(500).json({ error: "Failed to approve institution" });
    }
  }
);

// Reject institution
router.post(
  "/superadmin/reject-institution/:id",
  requireAuth,
  requireRole(["superadmin"]),
  async (req, res) => {
    try {
      const institutionId = req.params.id;
      const { reason } = req.body;
      
      const institution = await Institute.findById(institutionId);
      if (!institution) {
        return res.status(404).json({ error: "Institution not found" });
      }

      if (institution.approvalStatus !== "Pending") {
        return res.status(400).json({ error: "Institution is not pending approval" });
      }

      // Update institution status
      await Institute.findByIdAndUpdate(institutionId, {
        approvalStatus: "Rejected",
        status: "Rejected",
        approvedBy: req.user._id,
        approvedAt: new Date(),
        rejectionReason: reason || "No reason provided"
      });

      res.json({
        message: "Institution rejected successfully",
        institution: {
          id: institution._id,
          name: institution.name,
          status: "Rejected"
        }
      });
    } catch (error) {
      console.error("Institution rejection error:", error);
      res.status(500).json({ error: "Failed to reject institution" });
    }
  }
);

// Get platform health metrics
router.get(
  "/superadmin/platform-health",
  requireAuth,
  requireRole(["superadmin"]),
  async (req, res) => {
    try {
      const [totalInstitutions, activeInstitutions, pendingSync, securityAlerts] = await Promise.all([
        Institute.countDocuments({}),
        Institute.countDocuments({ status: "Active", approvalStatus: "Approved" }),
        Institute.countDocuments({ approvalStatus: "Pending" }),
        0 // Mock security alerts - in real app, this would come from security monitoring
      ]);

      const healthMetrics = {
        systemUptime: "99.9%", // Mock data - in real app, this would come from monitoring
        activeInstitutions: `${activeInstitutions}/${totalInstitutions}`,
        dataSyncStatus: pendingSync > 0 ? `${pendingSync} pending` : "All synced",
        securityAlerts: securityAlerts > 0 ? `${securityAlerts} alerts` : "All clear"
      };

      res.json({ healthMetrics });
    } catch (error) {
      console.error("Platform health fetch error:", error);
      res.status(500).json({ error: "Failed to load platform health" });
    }
  }
);

// Get recent activity
router.get(
  "/superadmin/recent-activity",
  requireAuth,
  requireRole(["superadmin"]),
  async (req, res) => {
    try {
      const activities = [];

      // Get recent approved institutions
      const recentApprovals = await Institute.find({ 
        approvalStatus: "Approved",
        approvedAt: { $exists: true }
      })
      .sort({ approvedAt: -1 })
      .limit(10)
      .populate('approvedBy', 'name');

      recentApprovals.forEach(institute => {
        activities.push({
          id: institute._id,
          type: "institution_approved",
          title: `${institute.name}: Institution approved and activated`,
          time: getTimeAgo(institute.approvedAt),
          approvedBy: institute.approvedBy?.name || "System",
          timestamp: institute.approvedAt
        });
      });

      // Get recent rejected institutions
      const recentRejections = await Institute.find({ 
        approvalStatus: "Rejected",
        approvedAt: { $exists: true }
      })
      .sort({ approvedAt: -1 })
      .limit(5)
      .populate('approvedBy', 'name');

      recentRejections.forEach(institute => {
        activities.push({
          id: institute._id,
          type: "institution_rejected",
          title: `${institute.name}: Institution registration rejected`,
          time: getTimeAgo(institute.approvedAt),
          approvedBy: institute.approvedBy?.name || "System",
          timestamp: institute.approvedAt
        });
      });

      // Get recent new institution registrations
      const recentRegistrations = await Institute.find({ 
        approvalStatus: "Pending"
      })
      .sort({ createdAt: -1 })
      .limit(5);

      recentRegistrations.forEach(institute => {
        activities.push({
          id: institute._id,
          type: "institution_registered",
          title: `${institute.name}: New institution registration request`,
          time: getTimeAgo(institute.createdAt),
          approvedBy: "System",
          timestamp: institute.createdAt
        });
      });

      // Sort all activities by timestamp (most recent first)
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10)
        .map(activity => {
          // Remove timestamp from response
          const { timestamp, ...activityWithoutTimestamp } = activity;
          return activityWithoutTimestamp;
        });

      res.json({ activities: sortedActivities });
    } catch (error) {
      console.error("Recent activity fetch error:", error);
      res.status(500).json({ error: "Failed to load recent activity" });
    }
  }
);

// Helper function to get time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInDays > 0) {
    return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
  } else if (diffInHours > 0) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  } else {
    return "Just now";
  }
}

// Add new admin
router.post(
  "/superadmin/add-admin",
  requireAuth,
  requireRole(["superadmin"]),
  async (req, res) => {
    try {
      const { name, email, password, contactNumber, permissions, status } = req.body;

      // Validate required fields
      if (!name || !name.first || !email || !password) {
        return res.status(400).json({ 
          error: "Missing required fields: first name, email, and password are required" 
        });
      }

      // Check if admin already exists
      const existingAdmin = await SuperAdmin.findOne({ email: email.toLowerCase() });
      if (existingAdmin) {
        return res.status(400).json({ error: "Admin with this email already exists" });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new admin
      const newAdmin = new SuperAdmin({
        name: {
          first: name.first,
          last: name.last || ""
        },
        email: email.toLowerCase(),
        password: hashedPassword,
        contactNumber: contactNumber || "",
        permissions: permissions || ["full_access"],
        status: status || "Active"
      });

      await newAdmin.save();

      // Return admin data without password
      const adminResponse = {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        contactNumber: newAdmin.contactNumber,
        permissions: newAdmin.permissions,
        status: newAdmin.status,
        createdAt: newAdmin.createdAt
      };

      res.status(201).json({
        message: "Admin created successfully",
        admin: adminResponse
      });
    } catch (error) {
      console.error("Add admin error:", error);
      res.status(500).json({ error: "Failed to create admin" });
    }
  }
);

// Create test institutions for demonstration (only for development)
router.post(
  "/superadmin/create-test-institutions",
  requireAuth,
  requireRole(["superadmin"]),
  async (req, res) => {
    try {
      const testInstitutions = [
        {
          name: "MIT Institute of Technology",
          code: "MIT001",
          type: "University",
          email: "admin@mit.edu",
          password: "password123",
          contactNumber: "+91-9876543210",
          address: {
            line1: "123 Tech Street",
            city: "Mumbai",
            state: "Maharashtra",
            country: "India",
            pincode: "400001"
          },
          location: {
            city: "Mumbai",
            state: "Maharashtra",
            country: "India"
          },
          studentCount: 8400,
          approvalStatus: "Pending"
        },
        {
          name: "Delhi University",
          code: "DU001",
          type: "University",
          email: "registry@du.ac.in",
          password: "password123",
          contactNumber: "+91-9876543211",
          address: {
            line1: "456 University Road",
            city: "New Delhi",
            state: "Delhi",
            country: "India",
            pincode: "110001"
          },
          location: {
            city: "New Delhi",
            state: "Delhi",
            country: "India"
          },
          studentCount: 47000,
          approvalStatus: "Pending"
        },
        {
          name: "IIT Hyderabad",
          code: "IITH001",
          type: "University",
          email: "dean@iith.ac.in",
          password: "password123",
          contactNumber: "+91-9876543212",
          address: {
            line1: "789 Engineering Campus",
            city: "Hyderabad",
            state: "Telangana",
            country: "India",
            pincode: "500032"
          },
          location: {
            city: "Hyderabad",
            state: "Telangana",
            country: "India"
          },
          studentCount: 4200,
          approvalStatus: "Pending"
        }
      ];

      const createdInstitutions = [];
      for (const institutionData of testInstitutions) {
        // Check if institution already exists
        const existing = await Institute.findOne({ 
          $or: [
            { code: institutionData.code },
            { email: institutionData.email }
          ]
        });
        
        if (!existing) {
          const institution = new Institute(institutionData);
          await institution.save();
          createdInstitutions.push(institution);
        }
      }

      res.json({
        message: "Test institutions created successfully",
        count: createdInstitutions.length,
        institutions: createdInstitutions.map(inst => ({
          id: inst._id,
          name: inst.name,
          code: inst.code,
          email: inst.email
        }))
      });
    } catch (error) {
      console.error("Create test institutions error:", error);
      res.status(500).json({ error: "Failed to create test institutions" });
    }
  }
);

// Institute Dashboard
router.get(
  "/institute",
  requireAuth,
  requireRole(["institute"]),
  (req, res) => {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      dashboardType: "institute",
    });
  }
);

// College Dashboard
router.get("/college", requireAuth, requireRole(["college"]), (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
    dashboardType: "college",
  });
});

// Department Dashboard
router.get(
  "/department/:id",
  requireAuth,
  requireRole(["department"]),
  (req, res) => {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      dashboardType: "department",
    });
  }
);

// Faculty Dashboard
router.get("/faculty", requireAuth, requireRole(["faculty"]), (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
    dashboardType: "faculty",
  });
});

// Student Dashboard - Redirect to specific student dashboard
router.get("/student", requireAuth, requireRole(["student"]), (req, res) => {
  res.json({
    redirectUrl: `/students/dashboard/${req.user._id}`,
  });
});

module.exports = router;
