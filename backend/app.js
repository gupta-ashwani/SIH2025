require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("./config/passport");

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:3001"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const dbUrl = process.env.DBURL;
main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log("DB connection error:", err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

// Session configuration
const sessionConfig = {
  store: MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600, // lazy session update
  }),
  name: "session",
  secret: process.env.SECRET || "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Routes
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const studentRoutes = require("./routes/students");
const facultyRoutes = require("./routes/faculty");
const departmentRoutes = require("./routes/department");
const eventRoutes = require("./routes/events");
const bulkStudentsRoutes = require("./routes/bulkStudents");

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/department", departmentRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bulk-students", bulkStudentsRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    port: process.env.PORT || 3030,
  });
});

// Test route to create a sample user (for development only)
app.post("/api/test/create-user", async (req, res) => {
  try {
    const bcrypt = require("bcryptjs");
    const Student = require("./model/student");

    // Check if test user already exists
    const existingUser = await Student.findOne({ email: "test@student.com" });
    if (existingUser) {
      return res.json({
        message: "Test user already exists",
        email: "test@student.com",
        password: "password123",
        userId: existingUser._id,
      });
    }

    // Temporarily modify the student schema to make department optional
    // This is just for testing - in production you'd have proper department setup
    const studentData = {
      name: { first: "Test", last: "Student" },
      studentID: "TEST001",
      email: "test@student.com",
      password: await bcrypt.hash("password123", 12),
      batch: "2024",
      enrollmentYear: 2024,
      gpa: 8.5,
      attendance: 85,
    };

    // Create the student without department validation for testing
    const testStudent = new Student(studentData);

    // Remove the department requirement temporarily for this test
    testStudent.department = new mongoose.Types.ObjectId(); // Use a dummy ObjectId

    await testStudent.save();
    res.json({
      message: "Test user created successfully",
      email: "test@student.com",
      password: "password123",
      userId: testStudent._id,
    });
  } catch (error) {
    console.error("Error creating test user:", error);
    res
      .status(500)
      .json({ error: "Failed to create test user", details: error.message });
  }
});

// Test route to create a sample faculty (for development only)
app.post("/api/test/create-faculty", async (req, res) => {
  try {
    const bcrypt = require("bcryptjs");
    const Faculty = require("./model/faculty");
    const Student = require("./model/student");

    // Check if test faculty already exists
    const existingFaculty = await Faculty.findOne({
      email: "test@faculty.com",
    });
    if (existingFaculty) {
      return res.json({
        message: "Test faculty already exists",
        email: "test@faculty.com",
        password: "password123",
        facultyId: existingFaculty._id,
      });
    }

    // Get all students to assign to faculty
    const students = await Student.find({});
    const studentIds = students.map((student) => student._id);

    const facultyData = {
      name: { first: "Test", last: "Faculty" },
      facultyID: "FAC001",
      email: "test@faculty.com",
      password: await bcrypt.hash("password123", 12),
      designation: "Professor",
      contactNumber: "+1234567890",
      isCoordinator: true,
      students: studentIds,
      department: new mongoose.Types.ObjectId(), // Use a dummy ObjectId
    };

    const testFaculty = new Faculty(facultyData);
    await testFaculty.save();

    res.json({
      message: "Test faculty created successfully",
      email: "test@faculty.com",
      password: "password123",
      facultyId: testFaculty._id,
      studentsAssigned: studentIds.length,
    });
  } catch (error) {
    console.error("Error creating test faculty:", error);
    res
      .status(500)
      .json({ error: "Failed to create test faculty", details: error.message });
  }
});

// Test route to create a sample department (for development only)
app.post("/api/test/create-department", async (req, res) => {
  try {
    const bcrypt = require("bcryptjs");
    const Department = require("./model/department");
    const Faculty = require("./model/faculty");
    const Student = require("./model/student");
    const Event = require("./model/event");

    // Check if test department already exists
    let existingDepartment = await Department.findOne({
      email: "test@department.com",
    });

    if (existingDepartment) {
      // Update existing department with real data
      existingDepartment.name = "Computer Science";
      existingDepartment.code = "CSE";
      existingDepartment.contactNumber = "+91-9876543213";
      await existingDepartment.save();

      return res.json({
        message: "Test department already exists and updated",
        email: "test@department.com",
        password: "password123",
        departmentId: existingDepartment._id,
        department: existingDepartment,
      });
    }

    // Create department first
    const departmentData = {
      name: "Computer Science",
      code: "CSE",
      email: "test@department.com",
      password: await bcrypt.hash("password123", 12),
      contactNumber: "+91-9876543213",
      college: new mongoose.Types.ObjectId(),
      institute: new mongoose.Types.ObjectId(),
      faculties: [],
      status: "Active",
    };

    const testDepartment = new Department(departmentData);
    await testDepartment.save();

    // Create sample faculty members for the department
    const facultyMembers = [
      {
        name: { first: "Rajesh", last: "Kumar" },
        facultyID: "FAC001",
        email: "rajesh.kumar@dept.com",
        password: await bcrypt.hash("password123", 12),
        designation: "HOD",
        specialization: "Artificial Intelligence",
        contactNumber: "+91-9876543210",
        department: testDepartment._id,
        college: testDepartment.college,
        institute: testDepartment.institute,
        status: "Active",
      },
      {
        name: { first: "Priya", last: "Sharma" },
        facultyID: "FAC002",
        email: "priya.sharma@dept.com",
        password: await bcrypt.hash("password123", 12),
        designation: "Associate Professor",
        specialization: "Machine Learning",
        contactNumber: "+91-9876543211",
        department: testDepartment._id,
        college: testDepartment.college,
        institute: testDepartment.institute,
        status: "Active",
      },
      {
        name: { first: "Amit", last: "Verma" },
        facultyID: "FAC003",
        email: "amit.verma@dept.com",
        password: await bcrypt.hash("password123", 12),
        designation: "Assistant Professor",
        specialization: "Data Science",
        contactNumber: "+91-9876543212",
        department: testDepartment._id,
        college: testDepartment.college,
        institute: testDepartment.institute,
        status: "Active",
      },
    ];

    const createdFaculty = await Faculty.insertMany(facultyMembers);
    const facultyIds = createdFaculty.map((f) => f._id);

    // Update department with faculty references and HOD
    testDepartment.faculties = facultyIds;
    testDepartment.hod = createdFaculty[0]._id; // Set first faculty as HOD
    await testDepartment.save();

    // Create sample students for the department
    const students = [
      {
        name: { first: "Student", last: "One" },
        studentID: "STU001",
        email: "student1@dept.com",
        password: await bcrypt.hash("password123", 12),
        batch: "2021-2025",
        enrollmentYear: 2021,
        gpa: 8.5,
        attendance: 85,
        department: testDepartment._id,
        college: testDepartment.college,
        institute: testDepartment.institute,
      },
      {
        name: { first: "Student", last: "Two" },
        studentID: "STU002",
        email: "student2@dept.com",
        password: await bcrypt.hash("password123", 12),
        batch: "2022-2026",
        enrollmentYear: 2022,
        gpa: 9.0,
        attendance: 90,
        department: testDepartment._id,
        college: testDepartment.college,
        institute: testDepartment.institute,
      },
    ];

    await Student.insertMany(students);

    // Create sample events for the department
    const now = new Date();
    const events = [
      {
        title: "AI Workshop",
        description: "Workshop on Artificial Intelligence fundamentals",
        type: "Workshop",
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        duration: 4,
        location: "CS Department Lab",
        isOnline: false,
        maxParticipants: 50,
        organizer: createdFaculty[0]._id, // HOD as organizer
        department: testDepartment._id,
        college: testDepartment.college,
        institute: testDepartment.institute,
        status: "Active",
      },
      {
        title: "Tech Symposium 2024",
        description: "Annual technical symposium for Computer Science students",
        type: "Symposium",
        date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        duration: 8,
        location: "Auditorium",
        isOnline: false,
        maxParticipants: 200,
        organizer: createdFaculty[1]._id,
        department: testDepartment._id,
        college: testDepartment.college,
        institute: testDepartment.institute,
        status: "Active",
      },
    ];

    await Event.insertMany(events);

    res.json({
      message: "Test department with sample data created successfully",
      email: "test@department.com",
      password: "password123",
      departmentId: testDepartment._id,
      facultyCreated: createdFaculty.length,
      studentsCreated: students.length,
      eventsCreated: events.length,
      department: testDepartment,
    });
  } catch (error) {
    console.error("Error creating test department:", error);
    res.status(500).json({
      error: "Failed to create test department",
      details: error.message,
    });
  }
});

// Serve React app (for production)
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Catch all handler for React routes (only for non-API routes)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong" } = err;
  res.status(statusCode).json({ error: message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
