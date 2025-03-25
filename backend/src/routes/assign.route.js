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

      // Send the file from the filesystem
      const filePath = path.join(process.cwd(), "uploads/", attachment.file);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).send("File not found on server");
      }

      // Set proper headers for binary file transfer
      const contentType =
        mime.lookup(attachment.title) || "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(attachment.title)}"`
      );
      res.setHeader("Cache-Control", "no-cache");

      // Use streams instead of sendFile for more reliable binary transfer
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Error serving file:", error);
      res.status(500).send("Error serving file");
    }
  }
);

router.get("/files/:filename", protectRoute, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), "uploads/", filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File not found on server");
    }

    // Find original name and mime type as before
    const assignment = await Assignment.findOne({
      "submissions.attachments.filename": filename,
    });

    let originalName = filename;
    let mimeType = "application/octet-stream";

    if (assignment) {
      // Your existing code to find attachment details
      // ...
    }

    // Set proper headers for binary file transfer
    const contentType = mime.lookup(originalName) || mimeType;
    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(originalName)}"`
    );
    res.setHeader("Cache-Control", "no-cache");

    // Use streams instead of sendFile for more reliable binary transfer
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error serving file:", error);
    res.status(500).send("Error serving file");
  }
});

export default router;
