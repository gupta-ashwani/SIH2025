const express = require("express");
const router = express.Router();
const Institute = require("../model/institute");
const College = require("../model/college");
const Department = require("../model/department");
const Faculty = require("../model/faculty");
const Student = require("../model/student");
const Event = require("../model/event");
const { requireAuth } = require("../middleware/auth");

// Get institute dashboard data
router.get("/dashboard/:id", requireAuth, async (req, res) => {
  try {
    const instituteId = req.params.id;

    // Verify the user has access to this institute
    if (req.user.role !== "institute" && req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Access denied" });
    }

    if (req.user.role === "institute" && req.user._id.toString() !== instituteId) {
      return res.status(403).json({ error: "Access denied to this institute" });
    }

    // Get institute basic info
    const institute = await Institute.findById(instituteId).select("-password");
    if (!institute) {
      return res.status(404).json({ error: "Institute not found" });
    }

    // Get colleges under this institute
    const colleges = await College.find({ institute: instituteId })
      .populate("departments", "name code")
      .select("name code type status departments");

    // Get all departments under this institute
    const departments = await Department.find({ institute: instituteId })
      .populate("hod", "name designation")
      .populate("college", "name")
      .select("name code college hod faculties status");

    // Get faculty count
    const facultyCount = await Faculty.countDocuments({
      department: { $in: departments.map(d => d._id) }
    });

    // Get student count
    const studentCount = await Student.countDocuments({
      department: { $in: departments.map(d => d._id) }
    });

    // Get recent events
    const recentEvents = await Event.find({ institute: instituteId })
      .populate("organizer", "name")
      .populate("department", "name")
      .populate("college", "name")
      .sort({ date: -1 })
      .limit(5)
      .select("title type date location status organizer department college");

    // Get upcoming events
    const upcomingEvents = await Event.find({
      institute: instituteId,
      date: { $gte: new Date() },
      status: "Active"
    })
      .populate("organizer", "name")
      .populate("department", "name")
      .populate("college", "name")
      .sort({ date: 1 })
      .limit(10)
      .select("title type date location organizer department college maxParticipants");

    // Calculate college-wise statistics
    const collegeStats = await Promise.all(
      colleges.map(async (college) => {
        const collegeDepartments = await Department.find({ college: college._id });
        const departmentIds = collegeDepartments.map(d => d._id);
        
        const facultyCount = await Faculty.countDocuments({
          department: { $in: departmentIds }
        });
        
        const studentCount = await Student.countDocuments({
          department: { $in: departmentIds }
        });

        return {
          _id: college._id,
          name: college.name,
          type: college.type,
          departmentCount: collegeDepartments.length,
          facultyCount,
          studentCount,
          status: college.status
        };
      })
    );

    // Get department-wise faculty and student counts
    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const facultyCount = await Faculty.countDocuments({ department: dept._id });
        const studentCount = await Student.countDocuments({ department: dept._id });
        
        return {
          _id: dept._id,
          name: dept.name,
          code: dept.code,
          college: dept.college,
          hod: dept.hod,
          facultyCount,
          studentCount,
          status: dept.status
        };
      })
    );

    // Get achievement statistics
    const achievementStats = await Student.aggregate([
      {
        $match: {
          department: { $in: departments.map(d => d._id) }
        }
      },
      {
        $unwind: "$achievements"
      },
      {
        $group: {
          _id: "$achievements.status",
          count: { $sum: 1 }
        }
      }
    ]);

    const dashboardData = {
      institute: {
        _id: institute._id,
        name: institute.name,
        code: institute.code,
        type: institute.type,
        email: institute.email,
        contactNumber: institute.contactNumber,
        website: institute.website,
        address: institute.address,
        status: institute.status,
        approvalStatus: institute.approvalStatus
      },
      statistics: {
        totalColleges: colleges.length,
        totalDepartments: departments.length,
        totalFaculty: facultyCount,
        totalStudents: studentCount,
        totalEvents: recentEvents.length,
        upcomingEvents: upcomingEvents.length
      },
      colleges: collegeStats,
      departments: departmentStats,
      recentEvents,
      upcomingEvents,
      achievementStats: achievementStats.reduce((acc, stat) => {
        acc[stat._id.toLowerCase()] = stat.count;
        return acc;
      }, { pending: 0, approved: 0, rejected: 0 })
    };

    res.json(dashboardData);
  } catch (error) {
    console.error("Institute dashboard error:", error);
    res.status(500).json({ error: "Failed to fetch institute dashboard data" });
  }
});

// Get institute profile
router.get("/profile/:id", requireAuth, async (req, res) => {
  try {
    const instituteId = req.params.id;

    if (req.user.role !== "institute" && req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Access denied" });
    }

    if (req.user.role === "institute" && req.user._id.toString() !== instituteId) {
      return res.status(403).json({ error: "Access denied to this institute" });
    }

    const institute = await Institute.findById(instituteId).select("-password");
    if (!institute) {
      return res.status(404).json({ error: "Institute not found" });
    }

    res.json(institute);
  } catch (error) {
    console.error("Institute profile error:", error);
    res.status(500).json({ error: "Failed to fetch institute profile" });
  }
});

// Add college to institute
router.post("/colleges", requireAuth, async (req, res) => {
  try {
    const {
      name,
      code,
      email,
      password,
      contactNumber,
      address,
      website,
      type,
      institute
    } = req.body;

    // Verify the user has access to this institute
    if (req.user.role !== "institute" && req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Access denied" });
    }

    if (req.user.role === "institute" && req.user._id.toString() !== institute) {
      return res.status(403).json({ error: "Access denied to this institute" });
    }

    // Check if college code already exists
    const existingCollege = await College.findOne({ code: code.toUpperCase() });
    if (existingCollege) {
      return res.status(400).json({ error: "College code already exists" });
    }

    // Check if email already exists
    const existingEmail = await College.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Create new college
    const college = new College({
      institute,
      name: name.trim(),
      code: code.toUpperCase(),
      email: email.toLowerCase(),
      password, // In production, this should be hashed
      contactNumber,
      address,
      website,
      type: type || 'Other'
    });

    await college.save();

    res.status(201).json({
      message: "College added successfully",
      college: {
        _id: college._id,
        name: college.name,
        code: college.code,
        email: college.email,
        type: college.type,
        status: college.status
      }
    });
  } catch (error) {
    console.error("Add college error:", error);
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ error: `${field} already exists` });
    }
    res.status(500).json({ error: "Failed to add college" });
  }
});

module.exports = router;
