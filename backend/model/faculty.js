const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    name: {
      first: { type: String, required: true },
      last: { type: String },
    },
    facultyID: {
      type: String,
      required: true,
      unique: true, // e.g., Employee/Staff ID
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
    designation: {
      type: String,
      enum: [
        "Professor",
        "Associate Professor",
        "Assistant Professor",
        "Lecturer",
        "Coordinator",
        "HOD",
      ],
      default: "Assistant Professor",
    },
    contactNumber: String,
    isCoordinator: {
      type: Boolean,
      default: false,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    achievementsReviewed: [
      {
        achievementId: {
          type: mongoose.Schema.Types.ObjectId,
        },
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
        },
        status: {
          type: String,
          enum: ["Approved", "Rejected"],
        },
        comment: String,
        reviewedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Faculty", facultySchema);
