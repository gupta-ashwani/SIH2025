const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    coordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
    },
    name: {
      first: { type: String, required: true },
      last: { type: String },
    },
    studentID: {
      type: String,
      required: true,
      unique: true, // e.g., Roll number
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    dob: Date,
    dateOfBirth: Date, // Alternative field name for consistency
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    contactNumber: String,
    bio: String,
    profilePicture: String,
    contact: {
      phone: String,
      address: String,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    course: String, // e.g., "Computer Science", "Mechanical Engineering"
    year: String, // e.g., "2nd Year", "Final Year"
    interests: [String],
    skills: {
      technical: [String],
      soft: [String],
    },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
    },
    enrollmentYear: Number,
    batch: String,
    // certificates & achievements
    achievements: [
      {
        title: String,
        type: {
          type: String,
          enum: [
            "Workshop",
            "Conference",
            "Hackathon",
            "Internship",
            "Course",
            "Competition",
            "CommunityService",
            "Leadership",
          ],
        },
        description: String,
        fileUrl: String,
        status: {
          type: String,
          enum: ["Pending", "Approved", "Rejected"],
          default: "Pending",
        },
        comment: String,
        rejectionComment: String, // For backward compatibility
        uploadedAt: { type: Date, default: Date.now },
        reviewedAt: Date,
        verifiedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Faculty",
        },
      },
    ],
    // academic performance
    gpa: Number,
    attendance: Number,
    // Remove old skills field as we've updated it above
    resumeGenerated: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    resumePdfUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
