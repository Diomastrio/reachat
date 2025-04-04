import mongoose from "mongoose";

// Para las opciones de preguntas de opción múltiple
const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
});

// Esquema para preguntas individuales
const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ["multiple-choice", "true-false", "short-answer", "long-answer"],
  },
  options: [optionSchema],
  correctAnswer: { type: String }, // Para preguntas de respuesta corta
  points: { type: Number, default: 1 },
  category: { type: String },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },
});

// Esquema principal para cuestionarios
const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: [questionSchema],
    timeLimit: { type: Number }, // Tiempo en minutos (null si no hay límite)
    availableFrom: { type: Date },
    availableTo: { type: Date },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isPublic: { type: Boolean, default: false },
    passScore: { type: Number, default: 60 }, // Porcentaje para aprobar
    shuffleQuestions: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
  },
  { timestamps: true }
);

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
