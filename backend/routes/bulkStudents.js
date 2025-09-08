const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");
const Student = require("../model/student");
const Faculty = require("../model/faculty");
const bcrypt = require("bcryptjs");
const { requireAuth } = require("../middleware/auth");

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept only Excel files
    const allowedMimes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel files are allowed!"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Bulk student upload route
router.post(
  "/bulk-upload",
  requireAuth,
  upload.single("excelFile"),
  async (req, res) => {
    try {
      console.log("=== BULK STUDENT UPLOAD ===");
      console.log("Request user:", req.user);
      console.log("File:", req.file);

      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No Excel file uploaded" });
      }

      // Find the faculty
      const faculty = await Faculty.findById(req.user._id).populate(
        "department"
      );
      if (!faculty) {
        return res.status(404).json({ error: "Faculty not found" });
      }

      console.log("Faculty found:", faculty.name);

      // Parse the Excel file
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      console.log("Parsed Excel data:", data);

      if (!data || data.length === 0) {
        return res
          .status(400)
          .json({ error: "Excel file is empty or invalid" });
      }

      // Validate required columns
      const requiredColumns = ["firstName", "lastName", "email", "rollNumber"];
      const firstRow = data[0];
      const missingColumns = requiredColumns.filter(
        (col) => !(col in firstRow)
      );

      if (missingColumns.length > 0) {
        return res.status(400).json({
          error: `Missing required columns: ${missingColumns.join(", ")}`,
          note: "Required columns: firstName, lastName, email, rollNumber",
        });
      }

      const results = {
        success: [],
        errors: [],
        duplicates: [],
      };

      // Process each student
      for (let i = 0; i < data.length; i++) {
        const studentData = data[i];
        const rowNumber = i + 2; // +2 because Excel rows start at 1 and we skip header

        try {
          // Validate required fields
          if (
            !studentData.firstName ||
            !studentData.lastName ||
            !studentData.email ||
            !studentData.rollNumber
          ) {
            results.errors.push({
              row: rowNumber,
              data: studentData,
              error: "Missing required fields",
            });
            continue;
          }

          // Check if student already exists
          const existingStudent = await Student.findOne({
            $or: [
              { email: studentData.email },
              { studentID: studentData.rollNumber },
            ],
          });

          if (existingStudent) {
            results.duplicates.push({
              row: rowNumber,
              data: studentData,
              existing: existingStudent.email,
            });
            continue;
          }

          // Generate password (default or from Excel)
          const password =
            studentData.password || `${studentData.rollNumber}@123`;
          const hashedPassword = await bcrypt.hash(password, 10);

          // Create student object
          const newStudent = new Student({
            name: {
              first: studentData.firstName.trim(),
              last: studentData.lastName.trim(),
            },
            email: studentData.email.toLowerCase().trim(),
            password: hashedPassword,
            studentID: studentData.rollNumber.toString().trim(),
            department: faculty.department._id,
            coordinator: faculty._id,
            contactNumber: studentData.contactNumber || "",
            dob: studentData.dateOfBirth
              ? new Date(studentData.dateOfBirth)
              : null,
            gender: studentData.gender || "",
            address: {
              line1: studentData.address || "",
              city: "",
              state: "",
              country: "",
              pincode: "",
            },
            enrollmentYear: studentData.year || new Date().getFullYear(),
            batch: studentData.batch || new Date().getFullYear().toString(),
            status: "Active",
          });

          // Save student
          const savedStudent = await newStudent.save();

          // Add student to faculty's students array
          faculty.students.push(savedStudent._id);

          results.success.push({
            row: rowNumber,
            studentId: savedStudent._id,
            name: `${savedStudent.name.first} ${savedStudent.name.last}`,
            email: savedStudent.email,
            rollNumber: savedStudent.studentID,
          });
        } catch (error) {
          console.error(`Error processing student at row ${rowNumber}:`, error);
          results.errors.push({
            row: rowNumber,
            data: studentData,
            error: error.message,
          });
        }
      }

      // Save faculty with updated students array
      if (results.success.length > 0) {
        await faculty.save();
      }

      console.log("Bulk upload results:", results);

      res.json({
        message: "Bulk upload completed",
        summary: {
          total: data.length,
          successful: results.success.length,
          errors: results.errors.length,
          duplicates: results.duplicates.length,
        },
        results,
      });
    } catch (error) {
      console.error("Bulk upload error:", error);
      res.status(500).json({
        error: "Server error during bulk upload",
        details: error.message,
      });
    }
  }
);

// Download Excel template route
router.get("/download-template", (req, res) => {
  try {
    // Create a sample Excel template
    const templateData = [
      {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        rollNumber: "ST001",
        contactNumber: "+91-9876543210",
        dateOfBirth: "2000-01-15",
        gender: "Male",
        address: "123 Main Street, City",
        year: 2,
        semester: 3,
        password: "ST001@123",
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        rollNumber: "ST002",
        contactNumber: "+91-9876543211",
        dateOfBirth: "2000-03-22",
        gender: "Female",
        address: "456 Oak Avenue, City",
        year: 2,
        semester: 3,
        password: "ST002@123",
      },
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=student_upload_template.xlsx"
    );

    // Send the file
    res.send(excelBuffer);
  } catch (error) {
    console.error("Template download error:", error);
    res.status(500).json({ error: "Failed to generate template" });
  }
});

module.exports = router;
