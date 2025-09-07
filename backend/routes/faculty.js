const express = require("express");
const router = express.Router();
const Faculty = require("../model/faculty");
const Student = require("../model/student");
const { isLoggedIn } = require("../middleware/auth");

// Faculty Dashboard
router.get("/dashboard/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    
    const faculty = await Faculty.findById(id)
      .populate("department", "name")
      .populate("students", "name studentID");

    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    // Get pending reviews count
    const pendingReviews = await Student.aggregate([
      {
        $match: {
          _id: { $in: faculty.students }
        }
      },
      {
        $unwind: "$achievements"
      },
      {
        $match: {
          "achievements.status": "Pending"
        }
      },
      {
        $count: "total"
      }
    ]);

    // Get this week's approved achievements
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const approvedThisWeek = faculty.achievementsReviewed.filter(
      review => review.status === "Approved" && review.reviewedAt >= oneWeekAgo
    ).length;

    // Get recent pending reviews for display
    const recentPendingReviews = await Student.aggregate([
      {
        $match: {
          _id: { $in: faculty.students }
        }
      },
      {
        $unwind: "$achievements"
      },
      {
        $match: {
          "achievements.status": "Pending"
        }
      },
      {
        $sort: {
          "achievements.uploadedAt": -1
        }
      },
      {
        $limit: 5
      },
      {
        $project: {
          student: {
            _id: "$_id",
            name: "$name"
          },
          achievement: "$achievements"
        }
      }
    ]);

    // Get student statistics
    const studentStats = {
      active: faculty.students.length,
      highPerformers: await Student.countDocuments({
        _id: { $in: faculty.students },
        gpa: { $gte: 8.0 }
      }),
      recentSubmissions: await Student.aggregate([
        {
          $match: {
            _id: { $in: faculty.students }
          }
        },
        {
          $unwind: "$achievements"
        },
        {
          $match: {
            "achievements.uploadedAt": { $gte: oneWeekAgo }
          }
        },
        {
          $count: "total"
        }
      ]).then(result => result[0]?.total || 0)
    };

    // Get recent activities
    const recentActivities = faculty.achievementsReviewed
      .slice(-5)
      .reverse()
      .map(review => ({
        description: `${review.status} achievement review`,
        timestamp: review.reviewedAt,
        action: review.status
      }));

    const stats = {
      totalStudents: faculty.students.length,
      pendingReviews: pendingReviews[0]?.total || 0,
      approvedThisWeek,
      totalReviews: faculty.achievementsReviewed.length
    };

    res.json({
      faculty,
      stats,
      pendingReviews: recentPendingReviews,
      recentActivities,
      studentStats
    });

  } catch (error) {
    console.error("Faculty dashboard error:", error);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

// Get Reviews
router.get("/reviews/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const { filter = "all" } = req.query;
    
    const faculty = await Faculty.findById(id).populate("students");
    
    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    let matchStage = {
      _id: { $in: faculty.students }
    };

    // Apply filter for achievement status
    if (filter !== "all") {
      matchStage["achievements.status"] = filter === "pending" ? "Pending" : 
                                         filter === "approved" ? "Approved" : 
                                         "Rejected";
    }

    const reviews = await Student.aggregate([
      {
        $match: matchStage
      },
      {
        $unwind: "$achievements"
      },
      {
        $match: filter !== "all" ? {
          "achievements.status": filter === "pending" ? "Pending" : 
                               filter === "approved" ? "Approved" : 
                               "Rejected"
        } : {}
      },
      {
        $sort: {
          "achievements.uploadedAt": -1
        }
      },
      {
        $project: {
          student: {
            _id: "$_id",
            name: "$name",
            studentID: "$studentID"
          },
          achievement: "$achievements"
        }
      }
    ]);

    res.json({ reviews });

  } catch (error) {
    console.error("Reviews error:", error);
    res.status(500).json({ error: "Failed to load reviews" });
  }
});

// Review Achievement
router.post("/review/:facultyId/:achievementId", isLoggedIn, async (req, res) => {
  try {
    const { facultyId, achievementId } = req.params;
    const { status, comment, studentId } = req.body;

    // Update student's achievement status
    await Student.updateOne(
      { _id: studentId, "achievements._id": achievementId },
      {
        $set: {
          "achievements.$.status": status,
          "achievements.$.comment": comment || "",
          "achievements.$.reviewedAt": new Date()
        }
      }
    );

    // Add to faculty's reviewed achievements
    await Faculty.updateOne(
      { _id: facultyId },
      {
        $push: {
          achievementsReviewed: {
            achievementId,
            studentId,
            status,
            comment: comment || "",
            reviewedAt: new Date()
          }
        }
      }
    );

    res.json({ message: "Achievement reviewed successfully" });

  } catch (error) {
    console.error("Review error:", error);
    res.status(500).json({ error: "Failed to review achievement" });
  }
});

// Get Faculty Students
router.get("/students/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    
    const faculty = await Faculty.findById(id);
    
    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    const students = await Student.find({
      _id: { $in: faculty.students }
    })
    .populate("department", "name")
    .lean();

    // Enhance student data with calculated fields
    const enhancedStudents = students.map(student => {
      const achievementCount = student.achievements?.length || 0;
      const pendingReviews = student.achievements?.filter(a => a.status === "Pending").length || 0;
      const approvedAchievements = student.achievements?.filter(a => a.status === "Approved").length || 0;
      
      // Calculate performance score based on GPA, achievements, and attendance
      const gpaScore = ((student.gpa || 0) / 10) * 40; // 40% weight
      const achievementScore = Math.min(achievementCount * 5, 30); // 30% weight, max 30
      const attendanceScore = ((student.attendance || 0) / 100) * 30; // 30% weight
      const performanceScore = Math.round(gpaScore + achievementScore + attendanceScore);

      // Get recent achievements
      const recentAchievements = student.achievements
        ?.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
        .slice(0, 3) || [];

      const lastActivity = recentAchievements[0]?.uploadedAt || student.updatedAt;

      return {
        ...student,
        achievementCount,
        pendingReviews,
        performanceScore,
        recentAchievements,
        lastActivity
      };
    });

    res.json({ students: enhancedStudents });

  } catch (error) {
    console.error("Students error:", error);
    res.status(500).json({ error: "Failed to load students" });
  }
});

// Get Analytics
router.get("/analytics/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const { period = "month" } = req.query;
    
    const faculty = await Faculty.findById(id);
    
    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "semester":
        startDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case "year":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default: // month
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // Get submission trend data
    const submissionTrend = await Student.aggregate([
      {
        $match: {
          _id: { $in: faculty.students }
        }
      },
      {
        $unwind: "$achievements"
      },
      {
        $match: {
          "achievements.uploadedAt": { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$achievements.uploadedAt"
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.date": 1 }
      }
    ]);

    // Get achievement types distribution
    const achievementTypes = await Student.aggregate([
      {
        $match: {
          _id: { $in: faculty.students }
        }
      },
      {
        $unwind: "$achievements"
      },
      {
        $group: {
          _id: "$achievements.type",
          count: { $sum: 1 }
        }
      }
    ]);

    // Get student performance data
    const studentPerformance = await Student.find({
      _id: { $in: faculty.students }
    }).select("name gpa achievements");

    // Get top performers
    const topPerformers = studentPerformance
      .map(student => ({
        name: `${student.name.first} ${student.name.last}`,
        achievements: student.achievements?.length || 0,
        score: Math.round(((student.gpa || 0) / 10) * 100)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Get recent activity
    const recentActivity = await Student.aggregate([
      {
        $match: {
          _id: { $in: faculty.students }
        }
      },
      {
        $unwind: "$achievements"
      },
      {
        $sort: {
          "achievements.uploadedAt": -1
        }
      },
      {
        $limit: 10
      },
      {
        $project: {
          title: "$achievements.title",
          student: { $concat: ["$name.first", " ", "$name.last"] },
          type: "$achievements.type",
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$achievements.uploadedAt"
            }
          }
        }
      }
    ]);

    // Calculate overview statistics
    const totalSubmissions = await Student.aggregate([
      {
        $match: {
          _id: { $in: faculty.students }
        }
      },
      {
        $unwind: "$achievements"
      },
      {
        $match: {
          "achievements.uploadedAt": { $gte: startDate }
        }
      },
      {
        $count: "total"
      }
    ]);

    const activeStudents = await Student.countDocuments({
      _id: { $in: faculty.students },
      updatedAt: { $gte: startDate }
    });

    const overview = {
      totalSubmissions: totalSubmissions[0]?.total || 0,
      submissionGrowth: 12, // Mock data - calculate based on previous period
      activeStudents,
      totalStudents: faculty.students.length,
      avgReviewTime: 24, // Mock data - calculate from review timestamps
      reviewTimeImprovement: 15, // Mock data
      approvalRate: 85, // Mock data - calculate from approved vs total reviews
      approvalRateChange: 5 // Mock data
    };

    // Format data for charts
    const analyticsData = {
      overview,
      submissionTrend: {
        labels: submissionTrend.map(item => item._id.date),
        data: submissionTrend.map(item => item.count)
      },
      achievementTypes: {
        labels: achievementTypes.map(item => item._id || "Other"),
        data: achievementTypes.map(item => item.count)
      },
      studentPerformance: {
        labels: studentPerformance.map(s => `${s.name.first} ${s.name.last}`),
        data: studentPerformance.map(s => Math.round(((s.gpa || 0) / 10) * 100))
      },
      topPerformers,
      recentActivity,
      monthlyStats: {
        currentMonth: {
          submissions: totalSubmissions[0]?.total || 0,
          reviews: faculty.achievementsReviewed.filter(r => 
            new Date(r.reviewedAt) >= startDate
          ).length,
          approvals: faculty.achievementsReviewed.filter(r => 
            r.status === "Approved" && new Date(r.reviewedAt) >= startDate
          ).length
        },
        lastMonth: {
          submissions: 45, // Mock data
          reviews: 42,    // Mock data
          approvals: 38   // Mock data
        }
      }
    };

    res.json(analyticsData);

  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ error: "Failed to load analytics" });
  }
});

module.exports = router;
