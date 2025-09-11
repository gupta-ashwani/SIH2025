const mongoose = require("mongoose");

const instituteRequestSchema = new mongoose.Schema(
  {
    // University Details
    aisheCode: {
      type: String,
      required: true,
      trim: true,
    },
    instituteType: {
      type: String,
      required: true,
      enum: ["Government", "Private", "Autonomous", "Deemed"],
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    universityName: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    // Head of Institute Details
    headOfInstitute: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
      contact: {
        type: String,
        required: true,
        trim: true,
      },
      alternateContact: {
        type: String,
        trim: true,
      },
    },

    // Admin/Modal Officer Details
    modalOfficer: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
      contact: {
        type: String,
        required: true,
        trim: true,
      },
      alternateContact: {
        type: String,
        trim: true,
      },
    },

    // University Accreditation Details
    naacGrading: {
      type: Boolean,
      required: true,
      default: false,
    },
    naacGrade: {
      type: String,
      enum: ["A++", "A+", "A", "B++", "B+", "B", "C", ""],
      default: "",
    },

    // Request Status
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    // Review Details
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
    },
    reviewedAt: {
      type: Date,
    },
    reviewComment: {
      type: String,
      trim: true,
    },

    // Generated Institute Details (after approval)
    generatedInstituteId: {
      type: String,
      trim: true,
    },
    generatedPassword: {
      type: String,
    },
    linkedInstitute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
    },
  },
  { timestamps: true }
);

// Index for faster queries
instituteRequestSchema.index({ status: 1 });
instituteRequestSchema.index({ email: 1 });
instituteRequestSchema.index({ aisheCode: 1 });

module.exports = mongoose.model("InstituteRequest", instituteRequestSchema);
