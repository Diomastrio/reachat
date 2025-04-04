import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createQuiz,
  getQuizzes,
  getQuizById,
  startQuizAttempt,
  submitQuizAttempt,
  getQuizStatistics,
} from "../controllers/quiz.controller.js";

const router = express.Router();

router.post("/", protectRoute, createQuiz);
router.get("/", protectRoute, getQuizzes);
router.get("/:id", protectRoute, getQuizById);
router.post("/:quizId/attempts", protectRoute, startQuizAttempt);
router.post("/attempts/:attemptId/submit", protectRoute, submitQuizAttempt);
router.get("/:quizId/statistics", protectRoute, getQuizStatistics);

export default router;
