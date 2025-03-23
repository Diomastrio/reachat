import express from "express";
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

export default router;
