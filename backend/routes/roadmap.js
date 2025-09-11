const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Roadmap = require("../model/roadmap");

// GET /api/roadmap/:id - Fetch roadmap by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid roadmap ID format"
      });
    }

    // Find the roadmap by ID and populate student information
    const roadmap = await Roadmap.findById(id)
      .populate('student_id', 'name email studentID')
      .lean();

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found"
      });
    }

    // Return the roadmap data
    res.status(200).json({
      success: true,
      data: roadmap
    });

  } catch (error) {
    console.error("Error fetching roadmap:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching roadmap",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/roadmap/student/:studentId - Fetch roadmaps by student ID
router.get("/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    // Validate if the studentId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format"
      });
    }

    // Find roadmaps for the specific student
    const roadmaps = await Roadmap.find({ student_id: studentId })
      .populate('student_id', 'name email studentID')
      .sort({ created_at: -1 })
      .lean();

    if (!roadmaps || roadmaps.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No roadmaps found for this student"
      });
    }

    res.status(200).json({
      success: true,
      data: roadmaps,
      count: roadmaps.length
    });

  } catch (error) {
    console.error("Error fetching student roadmaps:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching student roadmaps",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/roadmap/create-sample - Create sample roadmap data for testing
router.post("/create-sample", async (req, res) => {
  try {
    const Student = require("../model/student");
    
    // Find a student to associate with the roadmap
    const student = await Student.findOne();
    if (!student) {
      return res.status(400).json({
        success: false,
        message: "No students found. Please create a student first."
      });
    }

    // Check if roadmap already exists for this student
    const existingRoadmap = await Roadmap.findOne({ student_id: student._id });
    if (existingRoadmap) {
      return res.status(200).json({
        success: true,
        message: "Roadmap already exists for this student",
        data: existingRoadmap,
        roadmapId: existingRoadmap._id
      });
    }

    // Create sample roadmap data
    const sampleRoadmap = new Roadmap({
      student_id: student._id,
      potential_roadmaps: [
        {
          career_title: "Full Stack Developer",
          existing_skills: [
            "JavaScript",
            "HTML/CSS",
            "React Basics",
            "Node.js Fundamentals"
          ],
          match_score: 0.85,
          sequenced_roadmap: [
            "Master Advanced JavaScript ES6+ features and async programming",
            "Learn React.js ecosystem including Redux, Context API, and hooks",
            "Build proficiency in Node.js and Express.js for backend development",
            "Learn database technologies: MongoDB, PostgreSQL, and Redis",
            "Master RESTful API design and GraphQL",
            "Learn containerization with Docker and deployment strategies",
            "Study system design principles and microservices architecture",
            "Practice with real-world projects and contribute to open source"
          ]
        },
        {
          career_title: "Data Scientist",
          existing_skills: [
            "Python Basics",
            "Statistics",
            "Mathematics"
          ],
          match_score: 0.72,
          sequenced_roadmap: [
            "Master Python programming and data structures",
            "Learn data manipulation with Pandas and NumPy",
            "Study statistics, probability, and linear algebra",
            "Learn data visualization with Matplotlib, Seaborn, and Plotly",
            "Master machine learning algorithms and scikit-learn",
            "Study deep learning with TensorFlow or PyTorch",
            "Learn SQL and database management",
            "Practice with real datasets and Kaggle competitions"
          ]
        }
      ],
      created_at: new Date(),
      updated_at: new Date()
    });

    const savedRoadmap = await sampleRoadmap.save();
    
    res.status(201).json({
      success: true,
      message: "Sample roadmap created successfully",
      data: savedRoadmap,
      roadmapId: savedRoadmap._id,
      studentName: `${student.name.first} ${student.name.last}`,
      accessUrl: `/student/roadmap/${savedRoadmap._id}`
    });

  } catch (error) {
    console.error("Error creating sample roadmap:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while creating sample roadmap",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
