import express from "express";
import path from "path";
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  submitAssignment,
  gradeSubmission,
  submitAssignmentWithFiles,
} from "../controllers/assign.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../utils/multerConfig.js";
import Assignment from "../models/assign.model.js"; // Make sure this is added if not already present
import mime from "mime-types"; // You may need to install this package
import fs from "fs";

const router = express.Router();

// Assignment routes
router.post("/", protectRoute, upload.array("files", 5), createAssignment);
router.get("/", protectRoute, getAssignments);
router.get("/:id", protectRoute, getAssignmentById);
router.post("/:id/submit", protectRoute, submitAssignment);
router.post(
  "/:id/submissions/:submissionId/grade",
  protectRoute,
  gradeSubmission
);

// File upload route
router.post(
  "/:assignmentId/submit-with-files",
  protectRoute,
  upload.array("files", 5),
  submitAssignmentWithFiles
);

// Add this route to your assignments router
router.get(
  "/:id/files/assignment/:attachmentId",
  protectRoute,
  async (req, res) => {
    try {
      const { id, attachmentId } = req.params;

      const assignment = await Assignment.findById(id);
      if (!assignment) {
        return res.status(404).send("Assignment not found");
      }

      // Find the attachment in the assignment
      const attachment = assignment.attachments.id(attachmentId);
      if (!attachment) {
        return res.status(404).send("Attachment not found");
      }

      // Use path from attachment metadata
      const filePath = attachment.path;

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).send("File not found on server");
      }

      // Set proper headers for binary file transfer
      res.setHeader(
        "Content-Type",
        attachment.mimetype || "application/octet-stream"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(attachment.originalname)}"`
      );
      res.setHeader("Cache-Control", "no-cache");

      // Use streams for file transfer
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Error serving file:", error);
      res.status(500).send("Error serving file");
    }
  }
);

// Updated route to serve files using the path stored in the attachment schema
router.get("/files/:filename", protectRoute, async (req, res) => {
  try {
    const { filename } = req.params;

    // Find assignment that contains this file (either in assignment attachments or submission attachments)
    const assignment = await Assignment.findOne({
      $or: [
        { "attachments.filename": filename },
        { "submissions.attachments.filename": filename },
      ],
    });

    if (!assignment) {
      return res.status(404).send("File not found");
    }

    // Try to find attachment in assignment attachments
    let attachment = assignment.attachments.find(
      (a) => a.filename === filename
    );

    // If not there, look in submissions
    if (!attachment) {
      for (const submission of assignment.submissions) {
        attachment = submission.attachments.find(
          (a) => a.filename === filename
        );
        if (attachment) break;
      }
    }

    if (!attachment) {
      return res.status(404).send("File not found");
    }

    // Use the path stored in the attachment metadata
    const filePath = attachment.path;

    // Verify file exists on disk
    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File not found on server");
    }

    // Set proper headers for binary file download
    res.setHeader(
      "Content-Type",
      attachment.mimetype || "application/octet-stream"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(attachment.originalname)}"`
    );
    res.setHeader("Cache-Control", "no-cache");

    // Use streams for efficient file transfer
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error serving file:", error);
    res.status(500).send("Error serving file");
  }
});

export default router;
