const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const router = express.Router();

// Super Admin Dashboard
router.get(
  "/superadmin",
  requireAuth,
  requireRole(["superadmin"]),
  (req, res) => {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      dashboardType: "superadmin",
    });
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
