require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Student = require("./model/student");
const Department = require("./model/department");
const Faculty = require("./model/faculty");

async function createDemoStudent() {
  try {
    // Connect to database
    await mongoose.connect(process.env.DBURL);
    console.log("Connected to database");

    // Check if demo student already exists
    const existingStudent = await Student.findOne({
      $or: [
        { email: "ashwani.demo@student.com" },
        { studentID: "DEMO2024001" },
      ],
    });
    if (existingStudent) {
      console.log("Demo student already exists:", {
        email: "ashwani.demo@student.com",
        password: "password123",
        studentId: existingStudent._id,
        rollNumber: existingStudent.studentID,
      });
      await mongoose.disconnect();
      return;
    }

    // Find a department to assign (create one if none exists)
    let department = await Department.findOne();
    if (!department) {
      console.log("No department found, creating demo department...");
      department = new Department({
        name: "Computer Science and Engineering",
        code: "CSE",
        description: "Department of Computer Science and Engineering",
        establishedYear: 2020,
        status: "Active",
      });
      await department.save();
      console.log("Demo department created");
    }

    // Find a faculty member to assign as coordinator (optional)
    const coordinator = await Faculty.findOne();

    // Create comprehensive demo student data
    const demoStudentData = {
      // Basic required fields
      department: department._id,
      coordinator: coordinator?._id || null,
      name: {
        first: "Ashwani",
        last: "Gupta",
      },
      studentID: "DEMO2024001",
      email: "ashwani.demo@student.com",
      password: await bcrypt.hash("password123", 12),

      // Personal information
      dateOfBirth: new Date("2003-05-15"),
      gender: "Male",
      contactNumber: "+91-9876543210",
      bio: "Passionate computer science student with interests in full-stack development, AI/ML, and competitive programming. Always eager to learn new technologies and contribute to innovative projects.",
      profilePicture: null,

      // Emergency contact
      emergencyContact: {
        name: "Rajesh Gupta",
        phone: "+91-9876543211",
        relationship: "Father",
      },

      // Academic details
      course: "Computer Science and Engineering",
      year: "2nd Year",
      enrollmentYear: 2023,
      batch: "2027",
      gpa: 8.75,
      attendance: 92.5,

      // Address
      address: {
        line1: "123 Tech Street",
        line2: "Near Innovation Park",
        city: "Bangalore",
        state: "Karnataka",
        country: "India",
        pincode: "560001",
      },

      // Skills
      skills: {
        technical: [
          "JavaScript",
          "React.js",
          "Node.js",
          "Python",
          "Java",
          "MongoDB",
          "MySQL",
          "Git",
          "AWS",
          "Docker",
          "HTML/CSS",
          "Express.js",
        ],
        soft: [
          "Leadership",
          "Team Collaboration",
          "Problem Solving",
          "Communication",
          "Time Management",
          "Critical Thinking",
          "Adaptability",
          "Project Management",
        ],
      },

      // Interests
      interests: [
        "Web Development",
        "Machine Learning",
        "Competitive Programming",
        "Open Source Contributing",
        "Tech Blogging",
        "Photography",
        "Cricket",
        "Chess",
      ],

      // Social media
      social: {
        linkedin: "https://linkedin.com/in/ashwani-gupta-demo",
        github: "https://github.com/ashwani-demo",
      },

      // Education background
      education: [
        {
          institution: "Delhi Public School",
          location: "New Delhi, India",
          year: "2021",
          degree: "Class XII (Science) - 95.2%",
        },
        {
          institution: "Delhi Public School",
          location: "New Delhi, India",
          year: "2019",
          degree: "Class X - 96.8%",
        },
      ],

      // Projects
      projects: [
        {
          title: "E-Commerce Platform",
          link: "https://github.com/ashwani-demo/ecommerce-platform",
          tech: "React.js, Node.js, MongoDB, Express.js, Stripe API",
          description: [
            "Built a full-stack e-commerce platform with user authentication",
            "Implemented shopping cart functionality and payment integration",
            "Designed responsive UI with modern React patterns",
            "Added admin dashboard for inventory management",
          ],
        },
        {
          title: "Student Management System",
          link: "https://github.com/ashwani-demo/student-management",
          tech: "MERN Stack, JWT Authentication, Cloudinary",
          description: [
            "Developed comprehensive student management system",
            "Features include attendance tracking and grade management",
            "Implemented role-based access control",
            "Added file upload functionality for documents",
          ],
        },
        {
          title: "Weather Prediction App",
          link: "https://github.com/ashwani-demo/weather-app",
          tech: "Python, Machine Learning, Flask, OpenWeather API",
          description: [
            "Created ML model for weather prediction using historical data",
            "Built REST API using Flask framework",
            "Integrated with OpenWeather API for real-time data",
            "Achieved 85% accuracy in weather predictions",
          ],
        },
      ],

      // Achievements (sample data)
      achievements: [
        {
          title: "First Prize in Hackathon 2024",
          type: "Hackathon",
          description:
            "Won first place in college-level hackathon for developing an innovative IoT-based solution for smart farming.",
          fileUrl: null,
          status: "Approved",
          comment: "Excellent innovation and implementation",
          uploadedAt: new Date("2024-03-15"),
          reviewedAt: new Date("2024-03-20"),
          verifiedBy: coordinator?._id || null,
        },
        {
          title: "Full Stack Web Development Certification",
          type: "Course",
          description:
            "Completed comprehensive full-stack web development course from FreeCodeCamp with 100% score.",
          fileUrl: null,
          status: "Approved",
          comment: "Great dedication to learning",
          uploadedAt: new Date("2024-02-10"),
          reviewedAt: new Date("2024-02-15"),
          verifiedBy: coordinator?._id || null,
        },
        {
          title: "Summer Internship at Tech Corp",
          type: "Internship",
          description:
            "Completed 2-month summer internship as Software Development Intern, worked on React.js and Node.js projects.",
          fileUrl: null,
          status: "Approved",
          comment: "Excellent performance during internship",
          uploadedAt: new Date("2024-07-20"),
          reviewedAt: new Date("2024-07-25"),
          verifiedBy: coordinator?._id || null,
        },
        {
          title: "Google Cloud Platform Workshop",
          type: "Workshop",
          description:
            "Attended 3-day intensive workshop on GCP services including Compute Engine, App Engine, and Cloud Functions.",
          fileUrl: null,
          status: "Pending",
          comment: null,
          uploadedAt: new Date("2024-08-15"),
          reviewedAt: null,
          verifiedBy: null,
        },
        {
          title: "Community Service - Teaching Underprivileged Kids",
          type: "CommunityService",
          description:
            "Volunteered to teach basic computer skills to underprivileged children at local NGO for 6 months.",
          fileUrl: null,
          status: "Approved",
          comment: "Commendable social responsibility",
          uploadedAt: new Date("2024-01-10"),
          reviewedAt: new Date("2024-01-15"),
          verifiedBy: coordinator?._id || null,
        },
      ],

      // Other fields
      resumeGenerated: true,
      status: "Active",
      resumePdfUrl: null,
    };

    // Create the demo student
    const demoStudent = new Student(demoStudentData);
    await demoStudent.save();

    console.log("Demo student created successfully!");
    console.log("Login credentials:");
    console.log("Email: ashwani.demo@student.com");
    console.log("Password: password123");
    console.log("Student ID:", demoStudent._id);
    console.log("Roll Number:", demoStudent.studentID);

    await mongoose.disconnect();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error creating demo student:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the function
createDemoStudent();
