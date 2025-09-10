const mongoose = require("mongoose");

const instituteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ["University", "StandaloneCollege"],
      required: true,
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
    contactNumber: {
      type: String,
    },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
    },
    website: {
      type: String,
    },
    // hierarchy
    colleges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "College",
      },
    ],
    // tracking
    status: {
      type: String,
      enum: ["Active", "Inactive", "Pending", "Rejected"],
      default: "Pending",
    },
    // approval workflow
    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    // additional fields for approval workflow
    studentCount: {
      type: Number,
      default: 0,
    },
    location: {
      city: String,
      state: String,
      country: {
        type: String,
        default: "India",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Institute", instituteSchema);
