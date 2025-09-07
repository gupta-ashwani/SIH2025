const express = require("express");
const passport = require("../config/passport");
const router = express.Router();

// Login route
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Authentication error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!user) {
      return res.status(401).json({
        error: info.message || "Authentication failed",
      });
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Login failed" });
      }

      // Role-based redirect URLs for frontend
      const redirectUrls = {
        superadmin: "/dashboard/superadmin",
        institute: "/dashboard/institute",
        college: "/dashboard/college",
        department: "/dashboard/department",
        faculty: `/faculty/dashboard/${user._id}`,
        student: `/students/dashboard/${user._id}`,
      };

      const redirectUrl = redirectUrls[user.role] || "/dashboard";

      // Return JSON response with user data and redirect URL
      res.json({
        success: true,
        user: {
          _id: user._id,
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        redirectUrl,
      });
    });
  })(req, res, next);
});

// Logout route
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ success: true, message: "Logged out successfully" });
  });
});

// Check authentication status
router.get("/status", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        _id: req.user._id,
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
      },
    });
  } else {
    res.json({ authenticated: false });
  }
});

module.exports = router;
