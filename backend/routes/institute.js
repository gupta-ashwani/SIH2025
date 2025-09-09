const express = require("express");
const { requireAuth } = require("../middleware/auth");
const Institute = require("../model/institute");
const College = require("../model/college");
const Department = require("../model/department");
const Faculty = require("../model/faculty");
const Student = require("../model/student");
const Event = require("../model/event");
const router = express.Router();

// Middleware to check institute access
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    next();
  };
};

// Institute Dashboard
router.get(
  "/dashboard/:id",
  requireAuth,
  requireRole(["institute"]),
  async (req, res) => {
    try {
      const instituteId = req.params.id;

      // Verify institute exists and user has access
      const institute = await Institute.findById(instituteId);
      if (!institute) {
        return res.status(404).json({ error: "Institute not found" });
      }

      // Verify user is authorized for this institute
      if (req.user._id.toString() !== instituteId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Get institute statistics
      const colleges = await College.find({ institute: instituteId });
      const collegeIds = colleges.map((c) => c._id);

      const departments = await Department.find({ institute: instituteId });
      const departmentIds = departments.map((d) => d._id);

      const faculty = await Faculty.find({
        department: { $in: departmentIds },
      });
      const students = await Student.find({
        department: { $in: departmentIds },
      });
      const events = await Event.find({ institute: instituteId });

      // Calculate statistics
      const stats = {
        totalColleges: colleges.length,
        totalDepartments: departments.length,
        totalFaculty: faculty.length,
        totalStudents: students.length,
        totalEvents: events.length,
        activeStudents: students.filter((s) => s.status === "Active").length,
        activeFaculty: faculty.filter((f) => f.status === "Active").length,
        recentEvents: events.filter((e) => e.eventDate >= new Date()).length,
      };

      // Get recent activities (last 10)
      const recentStudents = students
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map((student) => ({
          id: student._id,
          name: `${student.name.first} ${student.name.last}`,
          email: student.email,
          department:
            departments.find(
              (d) => d._id.toString() === student.department?.toString()
            )?.name || "Unknown",
          joinDate: student.createdAt,
        }));

      const recentEvents = events
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map((event) => ({
          id: event._id,
          title: event.title,
          eventDate: event.eventDate,
          eventType: event.eventType,
          status: event.status,
        }));

      // Department-wise breakdown
      const departmentStats = departments.map((dept) => {
        const deptFaculty = faculty.filter(
          (f) => f.department?.toString() === dept._id.toString()
        );
        const deptStudents = students.filter(
          (s) => s.department?.toString() === dept._id.toString()
        );

        return {
          name: dept.name,
          code: dept.code,
          facultyCount: deptFaculty.length,
          studentCount: deptStudents.length,
          college:
            colleges.find((c) => c._id.toString() === dept.college?.toString())
              ?.name || "Unknown",
        };
      });

      res.json({
        institute,
        stats,
        recentStudents,
        recentEvents,
        departmentStats,
        title: `${institute.name} - Institute Dashboard`,
      });
    } catch (error) {
      console.error("Institute dashboard error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get all colleges under institute
router.get(
  "/colleges/:id",
  requireAuth,
  requireRole(["institute"]),
  async (req, res) => {
    try {
      const instituteId = req.params.id;

      // Verify access
      if (req.user._id.toString() !== instituteId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const colleges = await College.find({ institute: instituteId }).sort({
        name: 1,
      });

      // Get department counts for each college
      const collegesWithStats = await Promise.all(
        colleges.map(async (college) => {
          const departments = await Department.find({ college: college._id });
          const departmentIds = departments.map((d) => d._id);

          const facultyCount = await Faculty.countDocuments({
            department: { $in: departmentIds },
          });

          const studentCount = await Student.countDocuments({
            department: { $in: departmentIds },
          });

          return {
            ...college.toObject(),
            departmentCount: departments.length,
            facultyCount,
            studentCount,
          };
        })
      );

      res.json({
        colleges: collegesWithStats,
        title: "Colleges Management",
      });
    } catch (error) {
      console.error("Colleges fetch error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get all departments under institute
router.get(
  "/departments/:id",
  requireAuth,
  requireRole(["institute"]),
  async (req, res) => {
    try {
      const instituteId = req.params.id;

      // Verify access
      if (req.user._id.toString() !== instituteId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const departments = await Department.find({ institute: instituteId })
        .populate("college", "name code")
        .populate("hod", "name designation")
        .sort({ name: 1 });

      // Get stats for each department
      const departmentsWithStats = await Promise.all(
        departments.map(async (dept) => {
          const facultyCount = await Faculty.countDocuments({
            department: dept._id,
          });

          const studentCount = await Student.countDocuments({
            department: dept._id,
          });

          return {
            ...dept.toObject(),
            facultyCount,
            studentCount,
          };
        })
      );

      res.json({
        departments: departmentsWithStats,
        title: "Departments Management",
      });
    } catch (error) {
      console.error("Departments fetch error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get all faculty under institute
router.get(
  "/faculty/:id",
  requireAuth,
  requireRole(["institute"]),
  async (req, res) => {
    try {
      const instituteId = req.params.id;

      // Verify access
      if (req.user._id.toString() !== instituteId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const faculty = await Faculty.find({ institute: instituteId })
        .populate("department", "name code")
        .populate("students", "name")
        .sort({ "name.first": 1 });

      const facultyWithStats = faculty.map((fac) => ({
        ...fac.toObject(),
        studentCount: fac.students?.length || 0,
      }));

      res.json({
        faculty: facultyWithStats,
        title: "Faculty Management",
      });
    } catch (error) {
      console.error("Faculty fetch error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get all students under institute
router.get(
  "/students/:id",
  requireAuth,
  requireRole(["institute"]),
  async (req, res) => {
    try {
      const instituteId = req.params.id;
      const { page = 1, limit = 20, department, college, status } = req.query;

      // Verify access
      if (req.user._id.toString() !== instituteId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Build filter
      let filter = { institute: instituteId };

      if (department) {
        filter.department = department;
      }

      if (college) {
        // Get departments of this college
        const collegeDepartments = await Department.find({ college }).select(
          "_id"
        );
        filter.department = { $in: collegeDepartments.map((d) => d._id) };
      }

      if (status) {
        filter.status = status;
      }

      const skip = (page - 1) * limit;

      const students = await Student.find(filter)
        .populate("department", "name code")
        .populate("coordinator", "name designation")
        .sort({ "name.first": 1 })
        .skip(skip)
        .limit(parseInt(limit));

      const totalStudents = await Student.countDocuments(filter);

      res.json({
        students,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalStudents / limit),
          totalStudents,
          limit: parseInt(limit),
        },
        title: "Students Management",
      });
    } catch (error) {
      console.error("Students fetch error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get analytics data
router.get(
  "/analytics/:id",
  requireAuth,
  requireRole(["institute"]),
  async (req, res) => {
    try {
      const instituteId = req.params.id;

      // Verify access
      if (req.user._id.toString() !== instituteId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const departments = await Department.find({ institute: instituteId });
      const departmentIds = departments.map((d) => d._id);

      const students = await Student.find({
        department: { $in: departmentIds },
      });
      const faculty = await Faculty.find({
        department: { $in: departmentIds },
      });
      const events = await Event.find({ institute: instituteId });

      // Calculate various analytics
      const analytics = {
        // Enrollment trends (last 6 months)
        enrollmentTrends: getEnrollmentTrends(students),

        // Department-wise distribution
        departmentDistribution: getDepartmentDistribution(
          departments,
          students,
          faculty
        ),

        // Student performance metrics
        performanceMetrics: getPerformanceMetrics(students),

        // Event participation
        eventMetrics: getEventMetrics(events),

        // Growth statistics
        growthStats: getGrowthStats(students, faculty, events),
      };

      res.json({
        analytics,
        title: "Institute Analytics",
      });
    } catch (error) {
      console.error("Analytics fetch error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Helper functions for analytics
function getEnrollmentTrends(students) {
  const trends = {};
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });

    const count = students.filter((student) => {
      const studentDate = new Date(student.createdAt);
      return (
        studentDate.getFullYear() === date.getFullYear() &&
        studentDate.getMonth() === date.getMonth()
      );
    }).length;

    trends[monthKey] = count;
  }

  return trends;
}

function getDepartmentDistribution(departments, students, faculty) {
  return departments.map((dept) => {
    const deptStudents = students.filter(
      (s) => s.department?.toString() === dept._id.toString()
    );
    const deptFaculty = faculty.filter(
      (f) => f.department?.toString() === dept._id.toString()
    );

    return {
      name: dept.name,
      code: dept.code,
      students: deptStudents.length,
      faculty: deptFaculty.length,
      ratio:
        deptFaculty.length > 0
          ? Math.round(deptStudents.length / deptFaculty.length)
          : 0,
    };
  });
}

function getPerformanceMetrics(students) {
  const studentsWithGPA = students.filter((s) => s.gpa);
  const avgGPA =
    studentsWithGPA.length > 0
      ? studentsWithGPA.reduce((sum, s) => sum + s.gpa, 0) /
        studentsWithGPA.length
      : 0;

  const studentsWithAttendance = students.filter((s) => s.attendance);
  const avgAttendance =
    studentsWithAttendance.length > 0
      ? studentsWithAttendance.reduce((sum, s) => sum + s.attendance, 0) /
        studentsWithAttendance.length
      : 0;

  return {
    averageGPA: parseFloat(avgGPA.toFixed(2)),
    averageAttendance: parseFloat(avgAttendance.toFixed(2)),
    totalStudentsWithGPA: studentsWithGPA.length,
    studentsAbove8GPA: studentsWithGPA.filter((s) => s.gpa >= 8).length,
    studentsAbove90Attendance: studentsWithAttendance.filter(
      (s) => s.attendance >= 90
    ).length,
  };
}

function getEventMetrics(events) {
  const now = new Date();
  const thisMonth = events.filter((e) => {
    const eventDate = new Date(e.createdAt);
    return (
      eventDate.getMonth() === now.getMonth() &&
      eventDate.getFullYear() === now.getFullYear()
    );
  });

  return {
    totalEvents: events.length,
    eventsThisMonth: thisMonth.length,
    upcomingEvents: events.filter((e) => new Date(e.eventDate) > now).length,
    eventsByType: events.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {}),
  };
}

function getGrowthStats(students, faculty, events) {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);

  const studentsThisMonth = students.filter(
    (s) => new Date(s.createdAt) >= lastMonth
  ).length;
  const facultyThisMonth = faculty.filter(
    (f) => new Date(f.createdAt) >= lastMonth
  ).length;
  const eventsThisMonth = events.filter(
    (e) => new Date(e.createdAt) >= lastMonth
  ).length;

  return {
    newStudentsThisMonth: studentsThisMonth,
    newFacultyThisMonth: facultyThisMonth,
    newEventsThisMonth: eventsThisMonth,
  };
}

module.exports = router;
