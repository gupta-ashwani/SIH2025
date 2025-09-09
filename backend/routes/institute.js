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

      // College-wise breakdown
      const collegeStats = colleges.map((college) => {
        const collegeDepartments = departments.filter(
          (d) => d.college?.toString() === college._id.toString()
        );
        const collegeDepartmentIds = collegeDepartments.map((d) => d._id);

        const collegeFaculty = faculty.filter((f) =>
          collegeDepartmentIds.includes(f.department)
        );
        const collegeStudents = students.filter((s) =>
          collegeDepartmentIds.includes(s.department)
        );

        return {
          id: college._id,
          name: college.name,
          code: college.code,
          type: college.type || "Engineering College",
          departmentCount: collegeDepartments.length,
          facultyCount: collegeFaculty.length,
          studentCount: collegeStudents.length,
          establishedYear: college.establishedYear,
          location: college.location,
        };
      });

      res.json({
        institute,
        stats,
        recentStudents,
        recentEvents,
        collegeStats,
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

// Get reports data
router.get(
  "/reports/:id",
  requireAuth,
  requireRole(["institute"]),
  async (req, res) => {
    try {
      const instituteId = req.params.id;
      const {
        type = "overview",
        department = "all",
        dateRange = "month",
      } = req.query;

      // Verify access
      if (req.user._id.toString() !== instituteId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Get base data
      const institute = await Institute.findById(instituteId);
      const departments = await Department.find({
        institute: instituteId,
      }).populate("college", "name");
      const departmentIds = departments.map((d) => d._id);

      let filter = { department: { $in: departmentIds } };

      // Apply department filter if specific department selected
      if (department !== "all") {
        filter.department = department;
      }

      // Apply date range filter
      const dateFilter = getDateRangeFilter(dateRange);
      if (dateFilter) {
        filter.createdAt = dateFilter;
      }

      const students = await Student.find(filter).populate(
        "department",
        "name code"
      );
      const faculty = await Faculty.find(filter).populate(
        "department",
        "name code"
      );
      const events = await Event.find({
        institute: instituteId,
        ...(dateFilter && { createdAt: dateFilter }),
      });

      // Generate report data based on type
      let reportData = {};

      switch (type) {
        case "overview":
          reportData = generateOverviewReport(
            institute,
            departments,
            students,
            faculty,
            events
          );
          break;
        case "department":
          reportData = generateDepartmentReport(departments, students, faculty);
          break;
        case "faculty":
          reportData = generateFacultyReport(faculty, students);
          break;
        case "student":
          reportData = generateStudentReport(students);
          break;
        case "events":
          reportData = generateEventsReport(events);
          break;
        default:
          reportData = generateOverviewReport(
            institute,
            departments,
            students,
            faculty,
            events
          );
      }

      res.json({
        reportData,
        meta: {
          institute: institute.name,
          type,
          department: department === "all" ? "All Departments" : department,
          dateRange,
          generatedAt: new Date(),
          totalRecords: {
            students: students.length,
            faculty: faculty.length,
            events: events.length,
            departments: departments.length,
          },
        },
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
      });
    } catch (error) {
      console.error("Reports fetch error:", error);
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

// Helper functions for reports
function getDateRangeFilter(dateRange) {
  const now = new Date();

  switch (dateRange) {
    case "week":
      return { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
    case "month":
      return {
        $gte: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
      };
    case "quarter":
      return {
        $gte: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()),
      };
    case "year":
      return {
        $gte: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
      };
    default:
      return null;
  }
}

function generateOverviewReport(
  institute,
  departments,
  students,
  faculty,
  events
) {
  return {
    summary: {
      institute: institute.name,
      totalColleges: departments.reduce((acc, dept) => {
        const collegeId = dept.college?._id?.toString();
        if (collegeId && !acc.includes(collegeId)) {
          acc.push(collegeId);
        }
        return acc;
      }, []).length,
      totalDepartments: departments.length,
      totalFaculty: faculty.length,
      totalStudents: students.length,
      totalEvents: events.length,
    },
    departmentBreakdown: departments.map((dept) => {
      const deptStudents = students.filter(
        (s) => s.department?._id?.toString() === dept._id.toString()
      );
      const deptFaculty = faculty.filter(
        (f) => f.department?._id?.toString() === dept._id.toString()
      );

      return {
        name: dept.name,
        code: dept.code,
        college: dept.college?.name || "N/A",
        students: deptStudents.length,
        faculty: deptFaculty.length,
        ratio:
          deptFaculty.length > 0
            ? (deptStudents.length / deptFaculty.length).toFixed(1)
            : "N/A",
      };
    }),
  };
}

function generateDepartmentReport(departments, students, faculty) {
  return {
    departments: departments.map((dept) => {
      const deptStudents = students.filter(
        (s) => s.department?._id?.toString() === dept._id.toString()
      );
      const deptFaculty = faculty.filter(
        (f) => f.department?._id?.toString() === dept._id.toString()
      );

      const avgGPA =
        deptStudents.length > 0
          ? (
              deptStudents.reduce((sum, s) => sum + (s.gpa || 0), 0) /
              deptStudents.length
            ).toFixed(2)
          : "N/A";

      const avgAttendance =
        deptStudents.length > 0
          ? (
              deptStudents.reduce((sum, s) => sum + (s.attendance || 0), 0) /
              deptStudents.length
            ).toFixed(1)
          : "N/A";

      return {
        name: dept.name,
        code: dept.code,
        college: dept.college?.name || "N/A",
        students: deptStudents.length,
        faculty: deptFaculty.length,
        averageGPA: avgGPA,
        averageAttendance: avgAttendance,
        studentFacultyRatio:
          deptFaculty.length > 0
            ? (deptStudents.length / deptFaculty.length).toFixed(1)
            : "N/A",
      };
    }),
  };
}

function generateFacultyReport(faculty, students) {
  return {
    totalFaculty: faculty.length,
    facultyByDepartment: faculty.reduce((acc, fac) => {
      const deptName = fac.department?.name || "Unknown";
      acc[deptName] = (acc[deptName] || 0) + 1;
      return acc;
    }, {}),
    facultyList: faculty.map((fac) => {
      const facultyStudents = students.filter(
        (s) => s.coordinator?.toString() === fac._id.toString()
      );

      return {
        name: `${fac.name?.first || ""} ${fac.name?.last || ""}`.trim(),
        email: fac.email,
        department: fac.department?.name || "Unknown",
        designation: fac.designation || "N/A",
        studentsAssigned: facultyStudents.length,
        status: fac.status || "Active",
      };
    }),
  };
}

function generateStudentReport(students) {
  const studentsWithGPA = students.filter((s) => s.gpa && s.gpa > 0);
  const studentsWithAttendance = students.filter(
    (s) => s.attendance && s.attendance > 0
  );

  return {
    totalStudents: students.length,
    academicStats: {
      averageGPA:
        studentsWithGPA.length > 0
          ? (
              studentsWithGPA.reduce((sum, s) => sum + s.gpa, 0) /
              studentsWithGPA.length
            ).toFixed(2)
          : "N/A",
      averageAttendance:
        studentsWithAttendance.length > 0
          ? (
              studentsWithAttendance.reduce((sum, s) => sum + s.attendance, 0) /
              studentsWithAttendance.length
            ).toFixed(1)
          : "N/A",
      studentsAbove8GPA: studentsWithGPA.filter((s) => s.gpa >= 8).length,
      studentsAbove90Attendance: studentsWithAttendance.filter(
        (s) => s.attendance >= 90
      ).length,
    },
    departmentDistribution: students.reduce((acc, student) => {
      const deptName = student.department?.name || "Unknown";
      acc[deptName] = (acc[deptName] || 0) + 1;
      return acc;
    }, {}),
    yearDistribution: students.reduce((acc, student) => {
      const year = student.year || "Unknown";
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {}),
  };
}

function generateEventsReport(events) {
  return {
    totalEvents: events.length,
    eventsByType: events.reduce((acc, event) => {
      const type = event.eventType || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}),
    eventsByStatus: events.reduce((acc, event) => {
      const status = event.status || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {}),
    upcomingEvents: events.filter((e) => new Date(e.eventDate) > new Date())
      .length,
    pastEvents: events.filter((e) => new Date(e.eventDate) <= new Date())
      .length,
    recentEvents: events
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map((event) => ({
        title: event.title,
        type: event.eventType,
        date: event.eventDate,
        status: event.status,
        venue: event.venue || "N/A",
      })),
  };
}

module.exports = router;
