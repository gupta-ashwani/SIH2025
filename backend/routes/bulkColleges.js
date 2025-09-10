const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");
const College = require("../model/college");
const Institute = require("../model/institute");
const bcrypt = require("bcryptjs");
const { requireAuth } = require("../middleware/auth");

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
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

// Bulk college upload route
router.post(
  "/bulk-upload",
  requireAuth,
  upload.single("excelFile"),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      if (!req.file) {
        return res.status(400).json({ error: "No Excel file uploaded" });
      }
      // Parse the Excel file
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      if (!data || data.length === 0) {
        return res
          .status(400)
          .json({ error: "Excel file is empty or invalid" });
      }
      // Validate required columns
      const requiredColumns = [
        "name",
        "code",
        "email",
        "password",
        "institute",
      ];
      const firstRow = data[0];
      const missingColumns = requiredColumns.filter(
        (col) => !(col in firstRow)
      );
      if (missingColumns.length > 0) {
        return res
          .status(400)
          .json({ error: `Missing columns: ${missingColumns.join(", ")}` });
      }
      // Prepare bulk insert
      const collegesToInsert = [];
      for (const row of data) {
        // Check for required fields
        if (
          !row.name ||
          !row.code ||
          !row.email ||
          !row.password ||
          !row.institute
        )
          continue;
        // Hash password
        const hashedPassword = await bcrypt.hash(row.password, 10);
        collegesToInsert.push({
          name: row.name,
          code: row.code.toUpperCase(),
          email: row.email.toLowerCase(),
          password: hashedPassword,
          institute: row.institute,
          contactNumber: row.contactNumber || "",
          address: {
            line1: row.line1 || "",
            line2: row.line2 || "",
            city: row.city || "",
            state: row.state || "",
            country: row.country || "",
            pincode: row.pincode || "",
          },
          website: row.website || "",
          type: row.type || "Other",
          status: row.status || "Active",
        });
      }
      if (collegesToInsert.length === 0) {
        return res
          .status(400)
          .json({ error: "No valid college records found in file" });
      }
      // Insert colleges
      await College.insertMany(collegesToInsert);
      res.json({ success: true, count: collegesToInsert.length });
    } catch (error) {
      console.error("Bulk college upload error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;
