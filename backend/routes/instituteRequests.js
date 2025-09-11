const express = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const InstituteRequest = require("../model/instituteRequest");
const Institute = require("../model/institute");
const router = express.Router();

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate unique institute ID
const generateInstituteId = (universityName, aisheCode) => {
  const namePrefix = universityName.substring(0, 3).toUpperCase();
  const codePrefix = aisheCode.substring(0, 3).toUpperCase();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${namePrefix}${codePrefix}${randomSuffix}`;
};

// Generate secure password
const generatePassword = () => {
  return crypto.randomBytes(8).toString("hex");
};

// Submit institute registration request
router.post("/submit", async (req, res) => {
  try {
    const {
      aisheCode,
      instituteType,
      state,
      district,
      universityName,
      address,
      email,
      headOfInstitute,
      modalOfficer,
      naacGrading,
    } = req.body;

    // Check for duplicate registration
    const existingRequest = await InstituteRequest.findOne({
      $or: [
        { email: email },
        { aisheCode: aisheCode },
        { "headOfInstitute.email": headOfInstitute.email },
        { "modalOfficer.email": modalOfficer.email },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Institute with this email or AISHE code already exists",
      });
    }

    // Check if institute already exists in main collection
    const existingInstitute = await Institute.findOne({
      $or: [
        { email: email },
        { aisheCode: aisheCode },
        { "headOfInstitute.email": headOfInstitute.email },
        { "modalOfficer.email": modalOfficer.email },
      ],
    });

    if (existingInstitute) {
      return res.status(400).json({
        success: false,
        message: "Institute is already registered in the system",
      });
    }

    // Create new institute request
    const instituteRequest = new InstituteRequest({
      aisheCode,
      instituteType,
      state,
      district,
      universityName,
      address,
      email,
      headOfInstitute,
      modalOfficer,
      naacGrading,
    });

    await instituteRequest.save();

    res.status(201).json({
      success: true,
      message: "Institute registration request submitted successfully",
      requestId: instituteRequest._id,
    });
  } catch (error) {
    console.error("Error submitting institute request:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get all institute requests (for Super Admin)
router.get("/all", async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    const requests = await InstituteRequest.find(filter)
      .populate("reviewedBy", "name email")
      .populate("linkedInstitute", "name code")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await InstituteRequest.countDocuments(filter);

    res.json({
      success: true,
      data: requests,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching institute requests:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get single institute request details
router.get("/:id", async (req, res) => {
  try {
    const request = await InstituteRequest.findById(req.params.id)
      .populate("reviewedBy", "name email")
      .populate("linkedInstitute", "name code");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Institute request not found",
      });
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Error fetching institute request:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Approve institute request
router.post("/:id/approve", async (req, res) => {
  try {
    const { reviewComment, reviewedBy } = req.body;
    
    const request = await InstituteRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Institute request not found",
      });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Request has already been reviewed",
      });
    }

    // Generate credentials
    const instituteId = generateInstituteId(request.universityName, request.aisheCode);
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create institute in main collection
    const institute = new Institute({
      name: request.universityName,
      code: instituteId,
      aisheCode: request.aisheCode,
      type: request.instituteType,
      email: request.email,
      password: hashedPassword,
      address: {
        line1: request.address,
        state: request.state,
        district: request.district,
        country: "India",
      },
      headOfInstitute: request.headOfInstitute,
      modalOfficer: request.modalOfficer,
      naacGrading: request.naacGrading,
      status: "Active",
      approvalStatus: "Approved",
      approvedBy: reviewedBy,
      approvedAt: new Date(),
    });

    await institute.save();

    // Update request status
    request.status = "Approved";
    request.reviewedBy = reviewedBy;
    request.reviewedAt = new Date();
    request.reviewComment = reviewComment;
    request.generatedInstituteId = instituteId;
    request.generatedPassword = password; // Store plain password for email
    request.linkedInstitute = institute._id;
    
    await request.save();

    // Send approval emails
    const dashboardLink = `${process.env.FRONTEND_URL}/institute/dashboard/${institute._id}`;
    
    const emailTemplate = `
      <h2>Institute Registration Approved</h2>
      <p>Dear ${request.headOfInstitute.name},</p>
      <p>Congratulations! Your institute registration request has been approved.</p>
      
      <h3>Login Credentials:</h3>
      <p><strong>Institute ID:</strong> ${instituteId}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p><strong>Dashboard Link:</strong> <a href="${dashboardLink}">${dashboardLink}</a></p>
      
      <p>Please login and complete your institute profile setup.</p>
      <p>For security reasons, please change your password after first login.</p>
      
      <p>Best regards,<br>SIH2025 Team</p>
    `;

    // Send to Head of Institute
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: request.headOfInstitute.email,
      subject: "Institute Registration Approved - Login Credentials",
      html: emailTemplate,
    });

    // Send to Modal Officer
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: request.modalOfficer.email,
      subject: "Institute Registration Approved - Login Credentials",
      html: emailTemplate.replace(request.headOfInstitute.name, request.modalOfficer.name),
    });

    res.json({
      success: true,
      message: "Institute request approved successfully",
      institute: {
        id: institute._id,
        name: institute.name,
        code: instituteId,
      },
    });
  } catch (error) {
    console.error("Error approving institute request:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Reject institute request
router.post("/:id/reject", async (req, res) => {
  try {
    const { reviewComment, reviewedBy } = req.body;
    
    if (!reviewComment || reviewComment.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment is required for rejection",
      });
    }

    const request = await InstituteRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Institute request not found",
      });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Request has already been reviewed",
      });
    }

    // Update request status
    request.status = "Rejected";
    request.reviewedBy = reviewedBy;
    request.reviewedAt = new Date();
    request.reviewComment = reviewComment;
    
    await request.save();

    // Send rejection emails
    const emailTemplate = `
      <h2>Institute Registration Rejected</h2>
      <p>Dear ${request.headOfInstitute.name},</p>
      <p>We regret to inform you that your institute registration request has been rejected.</p>
      
      <h3>Reason for Rejection:</h3>
      <p>${reviewComment}</p>
      
      <p>You may submit a new registration request after addressing the mentioned issues.</p>
      
      <p>Best regards,<br>SIH2025 Team</p>
    `;

    // Send to Head of Institute
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: request.headOfInstitute.email,
      subject: "Institute Registration Rejected",
      html: emailTemplate,
    });

    // Send to Modal Officer
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: request.modalOfficer.email,
      subject: "Institute Registration Rejected",
      html: emailTemplate.replace(request.headOfInstitute.name, request.modalOfficer.name),
    });

    res.json({
      success: true,
      message: "Institute request rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting institute request:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;
