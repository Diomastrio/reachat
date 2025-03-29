import mongoose from "mongoose";

// Define a reusable schema for attachments
const attachmentSchema = new mongoose.Schema({
  filename: { type: String, required: true }, // Unique server-generated name (e.g., "1729200000000-file.pdf")
  path: { type: String, required: true }, // Full server path (e.g., "uploads/1729200000000-file.pdf")
  url: { type: String }, // Add this field for Supabase URL
  originalname: { type: String, required: true }, // User-provided name (e.g., "document.pdf")
  mimetype: { type: String, required: true }, // MIME type (e.g., "application/pdf")
  size: { type: Number, required: true }, // File size in bytes
});

// Schema for submissions
const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  attachments: [attachmentSchema], // Array of attachments with detailed metadata
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  grade: {
    score: { type: Number, default: null },
    feedback: { type: String, default: "" },
    gradedAt: Date,
  },
});

// Main assignment schema
const assignmentSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    attachments: [attachmentSchema], // Assignment attachments with detailed metadata
    submissions: [submissionSchema], // Submissions with their own attachments
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;
