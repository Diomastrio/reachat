import mongoose from "mongoose";

// Esquema para respuestas individuales
const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  selectedOptions: [String], // IDs de opciones o texto seleccionado
  textAnswer: { type: String }, // Para respuestas cortas/largas
  isCorrect: { type: Boolean },
  pointsEarned: { type: Number, default: 0 },
  feedback: { type: String }, // Feedback específico para esta respuesta
});

// Esquema principal para los intentos de cuestionario
const quizAttemptSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: [answerSchema],
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    totalScore: { type: Number, default: 0 },
    maxScore: { type: Number, required: true },
    percentageScore: { type: Number },
    passed: { type: Boolean },
    timeSpent: { type: Number }, // Tiempo en segundos
    status: {
      type: String,
      enum: ["in-progress", "completed", "abandoned"],
      default: "in-progress",
    },
  },
  { timestamps: true }
);

const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);

export default QuizAttempt;
