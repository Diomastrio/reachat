import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  submitAssignment,
  gradeSubmission,
  submitAssignmentWithFiles,
} from "../controllers/assign.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createAssignment);
router.get("/", protectRoute, getAssignments);
router.get("/:id", protectRoute, getAssignmentById);
router.post("/:id/submit", protectRoute, submitAssignment);
router.post("/:id/grade/:submissionId", protectRoute, gradeSubmission);
router.post(
  "/:assignmentId/submit-with-files",
  protectRoute,
  submitAssignmentWithFiles
);

// Add this route to handle serving files from MongoDB
router.get(
  "/:assignmentId/files/:submissionId/:fileId",
  protectRoute,
  async (req, res) => {
    try {
      const { assignmentId, submissionId, fileId } = req.params;

      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      // Check if accessing assignment files
      if (submissionId === "assignment") {
        const file = assignment.attachments.id(fileId);
        if (!file) {
          return res.status(404).json({ error: "File not found" });
        }

        res.set("Content-Type", file.contentType);
        return res.send(file.data);
      }

      // Check if accessing submission files
      const submission = assignment.submissions.id(submissionId);
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }

      const file = submission.attachments.id(fileId);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      res.set("Content-Type", file.contentType);
      return res.send(file.data);
    } catch (error) {
      console.error("Error serving file:", error);
      res.status(500).json({ error: "Failed to serve file" });
    }
  }
);

export default router;
