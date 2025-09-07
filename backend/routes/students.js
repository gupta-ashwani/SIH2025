const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");
const Student = require("../model/student");
const Department = require("../model/department");
const College = require("../model/college");
const router = express.Router();

// Middleware to check if user can access student data
const checkStudentAccess = (req, res, next) => {
  const studentId = req.params.id;
  const user = req.user;

  // Allow access if:
  // 1. User is the student themselves
  // 2. User is faculty/admin (has role other than student)
  if (user.role === "student" && user._id.toString() !== studentId) {
    return res.status(403).json({
      error: "Access denied. You can only view your own dashboard.",
    });
  }

  next();
};

// Student Dashboard - Dynamic route with ID
router.get(
  "/dashboard/:id",
  requireAuth,
  checkStudentAccess,
  async (req, res) => {
    try {
      const studentId = req.params.id;

      // Fetch student with populated references
      const student = await Student.findById(studentId)
        .populate("department")
        .populate("coordinator");

      if (!student) {
        return res.status(404).json({
          error: "Student not found",
        });
      }

      // Calculate achievement statistics
      const achievements = student.achievements || [];
      const stats = {
        certifications: achievements.filter((a) => a.type === "Course").length,
        internships: achievements.filter((a) => a.type === "Internship").length,
        competitions: achievements.filter((a) => a.type === "Competition")
          .length,
        workshops: achievements.filter((a) => a.type === "Workshop").length,
      };

      // Get recent activities (last 5)
      const recentActivities = achievements
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
        .slice(0, 5);

      // Calculate academic progress
      const academicProgress = {
        cgpa: student.gpa || 0,
        attendance: student.attendance || 0,
      };

      // Mock upcoming events (you can replace with actual events from DB)
      const upcomingEvents = [
        {
          title: "Tech Symposium",
          date: "Dec 20, 2023",
        },
        {
          title: "Career Fair",
          date: "Jan 5, 2024",
        },
        {
          title: "Workshop: AI/ML",
          date: "Jan 12, 2024",
        },
      ];

      res.json({
        student,
        stats,
        recentActivities,
        academicProgress,
        upcomingEvents,
        title: `${student.name.first}'s Dashboard`,
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// Upload page - Return student data for form
router.get("/upload/:id", requireAuth, checkStudentAccess, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        error: "Student not found",
      });
    }

    res.json({
      student,
      title: "Upload New Activity",
    });
  } catch (error) {
    console.error("Upload page error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// Handle file upload
router.post(
  "/upload/:id",
  requireAuth,
  checkStudentAccess,
  upload.single("certificate"),
  async (req, res) => {
    try {
      const student = await Student.findById(req.params.id);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      const { category, title, organization, description, dateCompleted } =
        req.body;

      const newAchievement = {
        title,
        type: category,
        description,
        fileUrl: req.file ? req.file.path : null,
        uploadedAt: new Date(),
        status: "Pending",
      };

      student.achievements.push(newAchievement);
      await student.save();

      res.json({
        success: true,
        message: "Achievement uploaded successfully",
        achievement: newAchievement,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  }
);

// Portfolio page
router.get(
  "/portfolio/:id",
  requireAuth,
  checkStudentAccess,
  async (req, res) => {
    try {
      const student = await Student.findById(req.params.id).populate(
        "department"
      );

      if (!student) {
        return res.status(404).json({
          error: "Student not found",
        });
      }

      // Group achievements by category
      const achievements = student.achievements || [];
      const groupedAchievements = {
        certifications: achievements.filter((a) => a.type === "Course"),
        internships: achievements.filter((a) => a.type === "Internship"),
        competitions: achievements.filter((a) => a.type === "Competition"),
        workshops: achievements.filter((a) => a.type === "Workshop"),
      };

      res.json({
        student,
        groupedAchievements,
        title: `${student.name.first}'s Portfolio`,
      });
    } catch (error) {
      console.error("Portfolio error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// Analytics page
router.get(
  "/analytics/:id",
  requireAuth,
  checkStudentAccess,
  async (req, res) => {
    try {
      const student = await Student.findById(req.params.id).populate(
        "department"
      );

      if (!student) {
        return res.status(404).json({
          error: "Student not found",
        });
      }

      const achievements = student.achievements || [];

      // Calculate detailed analytics
      const analytics = {
        totalAchievements: achievements.length,
        approvedAchievements: achievements.filter(
          (a) => a.status === "Approved"
        ).length,
        pendingAchievements: achievements.filter((a) => a.status === "Pending")
          .length,
        rejectedAchievements: achievements.filter(
          (a) => a.status === "Rejected"
        ).length,

        // Category breakdown
        categoryBreakdown: {
          certifications: achievements.filter((a) => a.type === "Course")
            .length,
          internships: achievements.filter((a) => a.type === "Internship")
            .length,
          competitions: achievements.filter((a) => a.type === "Competition")
            .length,
          workshops: achievements.filter((a) => a.type === "Workshop").length,
          hackathons: achievements.filter((a) => a.type === "Hackathon").length,
          communityService: achievements.filter(
            (a) => a.type === "CommunityService"
          ).length,
        },

        // Academic metrics
        academicMetrics: {
          cgpa: student.gpa || 0,
          attendance: student.attendance || 0,
          enrollmentYear: student.enrollmentYear,
          batch: student.batch,
        },

        // Timeline data (achievements per month)
        timeline: getAchievementTimeline(achievements),

        // Skills analysis
        skills: student.skills || [],

        // Performance insights
        insights: generateInsights(student, achievements),
      };

      res.json({
        student,
        analytics,
        title: `${student.name.first}'s Analytics`,
      });
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// Helper function to generate achievement timeline
function getAchievementTimeline(achievements) {
  const timeline = {};
  achievements.forEach((achievement) => {
    const month = new Date(achievement.uploadedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
    timeline[month] = (timeline[month] || 0) + 1;
  });
  return timeline;
}

// Helper function to generate performance insights
function generateInsights(student, achievements) {
  const insights = [];

  if (student.gpa >= 9.0) {
    insights.push({
      type: "success",
      title: "Excellent Academic Performance",
      description: "Your CGPA is outstanding! Keep up the great work.",
    });
  } else if (student.gpa >= 7.0) {
    insights.push({
      type: "info",
      title: "Good Academic Performance",
      description:
        "Your academic performance is solid. Consider focusing on co-curricular activities.",
    });
  } else {
    insights.push({
      type: "warning",
      title: "Academic Improvement Needed",
      description:
        "Focus on improving your academic performance along with skill development.",
    });
  }

  if (achievements.length >= 10) {
    insights.push({
      type: "success",
      title: "Highly Active Student",
      description: "You have an impressive portfolio of achievements!",
    });
  } else if (achievements.length >= 5) {
    insights.push({
      type: "info",
      title: "Good Activity Level",
      description:
        "You're doing well with extracurricular activities. Keep building your portfolio.",
    });
  } else {
    insights.push({
      type: "warning",
      title: "Increase Activity Participation",
      description:
        "Consider participating in more workshops, competitions, and certification programs.",
    });
  }

  if (student.attendance >= 90) {
    insights.push({
      type: "success",
      title: "Excellent Attendance",
      description: "Your attendance record is exemplary!",
    });
  } else if (student.attendance >= 75) {
    insights.push({
      type: "info",
      title: "Good Attendance",
      description: "Your attendance is satisfactory but could be improved.",
    });
  } else {
    insights.push({
      type: "danger",
      title: "Attendance Concern",
      description:
        "Your attendance needs immediate attention to meet academic requirements.",
    });
  }

  return insights;
}

module.exports = router;
