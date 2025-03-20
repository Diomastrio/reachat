import mongoose from "mongoose";

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
  attachments: [
    {
      filename: String,
      data: Buffer,
      contentType: String, // 'application/pdf'
    },
  ],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  grade: {
    score: {
      type: Number,
      default: null,
    },
    feedback: {
      type: String,
      default: "",
    },
    gradedAt: Date,
  },
});

const assignmentSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    attachments: [
      {
        filename: String,
        data: Buffer,
        contentType: String,
      },
    ],
    submissions: [submissionSchema],
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
