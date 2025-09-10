const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const Institute = require("../model/institute");
const Student = require("../model/student");
const OcrOutput = require("../model/ocrOutput");
const router = express.Router();

// Super Admin Dashboard
router.get(
  "/superadmin",
  requireAuth,
  requireRole(["superadmin"]),
  async (req, res) => {
    try {
      const [institutesCount, activeStudentsCount, activitiesCount, pendingApprovalsAgg] =
        await Promise.all([
          Institute.countDocuments({}),
          Student.countDocuments({ status: "Active" }),
          OcrOutput.countDocuments({}),
          Student.aggregate([
            { $unwind: "$achievements" },
            { $match: { "achievements.status": "Pending" } },
            { $count: "count" },
          ]),
        ]);

      const pendingApprovals = pendingApprovalsAgg?.[0]?.count || 0;

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
          pendingApprovals,
        },
      });
    } catch (error) {
      console.error("Superadmin dashboard metrics error:", error);
      res.status(500).json({ error: "Failed to load dashboard metrics" });
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
