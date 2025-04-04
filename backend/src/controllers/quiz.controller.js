import Quiz from "../models/quiz.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Crear un nuevo cuestionario
export const createQuiz = async (req, res) => {
  try {
    const { title, description, questions, assignedTo, ...quizData } = req.body;
    const creatorId = req.user._id;

    if (!title) {
      return res.status(400).json({ error: "El título es obligatorio" });
    }

    const newQuiz = new Quiz({
      title,
      description,
      questions: questions || [],
      assignedTo: assignedTo || [],
      creatorId,
      ...quizData,
    });

    await newQuiz.save();

    // Notificar a los usuarios asignados
    if (assignedTo && assignedTo.length > 0) {
      for (const userId of assignedTo) {
        const receiverSocketId = getReceiverSocketId(userId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newQuiz", {
            quizId: newQuiz._id,
            creator: req.user.fullName,
            title: newQuiz.title,
          });
        }
      }
    }

    res.status(201).json(newQuiz);
  } catch (error) {
    console.error("Error en createQuiz:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener todos los cuestionarios
export const getQuizzes = async (req, res) => {
  try {
    const userId = req.user._id;

    const quizzes = await Quiz.find({
      $or: [{ creatorId: userId }, { assignedTo: userId }, { isPublic: true }],
    }).populate("creatorId", "fullName profilePic");

    res.status(200).json(quizzes);
  } catch (error) {
    console.error("Error en getQuizzes:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener un cuestionario por ID
export const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const quiz = await Quiz.findById(id)
      .populate("creatorId", "fullName profilePic")
      .populate("assignedTo", "fullName profilePic");

    if (!quiz) {
      return res.status(404).json({ error: "Cuestionario no encontrado" });
    }

    // Verificar acceso
    const isCreator = quiz.creatorId._id.toString() === userId.toString();
    const isAssigned = quiz.assignedTo.some(
      (user) => user._id.toString() === userId.toString()
    );

    if (!isCreator && !isAssigned && !quiz.isPublic) {
      return res
        .status(403)
        .json({ error: "No tienes acceso a este cuestionario" });
    }

    res.status(200).json(quiz);
  } catch (error) {
    console.error("Error en getQuizById:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Iniciar un intento de cuestionario
export const startQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user._id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Cuestionario no encontrado" });
    }

    // Verificar si el usuario puede realizar el cuestionario
    const isAssigned = quiz.assignedTo.some(
      (id) => id.toString() === userId.toString()
    );
    if (!isAssigned && !quiz.isPublic) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para realizar este cuestionario" });
    }

    // Calcular puntuación máxima posible
    const maxScore = quiz.questions.reduce(
      (total, q) => total + (q.points || 1),
      0
    );

    // Crear un nuevo intento
    const quizAttempt = new QuizAttempt({
      quizId,
      userId,
      maxScore,
      answers: [],
      startedAt: new Date(),
    });

    await quizAttempt.save();

    // Si hay tiempo límite, devolver preguntas mezcladas si es necesario
    let quizQuestions = [...quiz.questions];
    if (quiz.shuffleQuestions) {
      quizQuestions = quizQuestions.sort(() => Math.random() - 0.5);
    }

    // No enviar las respuestas correctas al cliente
    const sanitizedQuestions = quizQuestions.map((q) => {
      const sanitized = {
        _id: q._id,
        text: q.text,
        type: q.type,
        points: q.points,
        category: q.category,
      };

      // Si es opción múltiple, incluir las opciones pero no cuál es correcta
      if (q.options && q.options.length > 0) {
        sanitized.options = q.options.map((opt) => ({
          _id: opt._id,
          text: opt.text,
        }));
      }

      return sanitized;
    });

    res.status(200).json({
      attemptId: quizAttempt._id,
      timeLimit: quiz.timeLimit,
      questions: sanitizedQuestions,
    });
  } catch (error) {
    console.error("Error en startQuizAttempt:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Enviar respuesta de cuestionario
export const submitQuizAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body;
    const userId = req.user._id;

    const quizAttempt = await QuizAttempt.findById(attemptId);
    if (!quizAttempt) {
      return res
        .status(404)
        .json({ error: "Intento de cuestionario no encontrado" });
    }

    // Verificar que el intento pertenezca al usuario
    if (quizAttempt.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para enviar este intento" });
    }

    // Verificar que el intento no haya sido completado ya
    if (quizAttempt.status === "completed") {
      return res.status(400).json({ error: "Este intento ya fue completado" });
    }

    // Obtener el cuestionario para verificar respuestas
    const quiz = await Quiz.findById(quizAttempt.quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Cuestionario no encontrado" });
    }

    // Procesar y calificar respuestas
    let totalScore = 0;
    const processedAnswers = [];

    for (const answer of answers) {
      const question = quiz.questions.id(answer.questionId);
      if (!question) continue;

      let isCorrect = false;
      let pointsEarned = 0;

      // Evaluar según el tipo de pregunta
      if (question.type === "multiple-choice") {
        // Para preguntas de opción múltiple
        if (answer.selectedOptions && answer.selectedOptions.length > 0) {
          // Verificar que todas las opciones seleccionadas sean correctas
          const selectedOptions = question.options.filter((opt) =>
            answer.selectedOptions.includes(opt._id.toString())
          );

          const allCorrect = selectedOptions.every((opt) => opt.isCorrect);
          const allSelected = question.options
            .filter((opt) => opt.isCorrect)
            .every((opt) =>
              answer.selectedOptions.includes(opt._id.toString())
            );

          isCorrect = allCorrect && allSelected;
          pointsEarned = isCorrect ? question.points : 0;
        }
      } else if (question.type === "true-false") {
        // Para preguntas de verdadero/falso (un caso especial de opción múltiple)
        if (answer.selectedOptions && answer.selectedOptions.length === 1) {
          const selectedOption = question.options.find(
            (opt) => opt._id.toString() === answer.selectedOptions[0]
          );
          isCorrect = selectedOption && selectedOption.isCorrect;
          pointsEarned = isCorrect ? question.points : 0;
        }
      } else if (question.type === "short-answer") {
        // Para preguntas de respuesta corta
        if (answer.textAnswer) {
          // Comparar ignorando mayúsculas/minúsculas y espacios extra
          const normalizedSubmitted = answer.textAnswer.trim().toLowerCase();
          const normalizedCorrect = question.correctAnswer.trim().toLowerCase();
          isCorrect = normalizedSubmitted === normalizedCorrect;
          pointsEarned = isCorrect ? question.points : 0;
        }
      } else if (question.type === "long-answer") {
        // Para respuestas largas, se requiere revisión manual
        isCorrect = null;
        pointsEarned = 0; // Será calificado manualmente después
      }

      processedAnswers.push({
        questionId: question._id,
        selectedOptions: answer.selectedOptions || [],
        textAnswer: answer.textAnswer || "",
        isCorrect,
        pointsEarned,
      });

      totalScore += pointsEarned;
    }

    // Actualizar el intento con las respuestas evaluadas
    const percentageScore = (totalScore / quizAttempt.maxScore) * 100;
    const passed = percentageScore >= quiz.passScore;
    const timeSpent = Math.floor((new Date() - quizAttempt.startedAt) / 1000); // Segundos

    quizAttempt.answers = processedAnswers;
    quizAttempt.totalScore = totalScore;
    quizAttempt.percentageScore = percentageScore;
    quizAttempt.passed = passed;
    quizAttempt.completedAt = new Date();
    quizAttempt.timeSpent = timeSpent;
    quizAttempt.status = "completed";

    await quizAttempt.save();

    // Notificar al creador sobre el nuevo intento
    const creatorSocketId = getReceiverSocketId(quiz.creatorId);
    if (creatorSocketId) {
      io.to(creatorSocketId).emit("quizAttemptCompleted", {
        quizId: quiz._id,
        student: req.user.fullName,
        title: quiz.title,
        score: percentageScore.toFixed(1),
      });
    }

    res.status(200).json({
      attemptId: quizAttempt._id,
      totalScore,
      percentageScore,
      passed,
      timeSpent,
    });
  } catch (error) {
    console.error("Error en submitQuizAttempt:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener estadísticas de un cuestionario
export const getQuizStatistics = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user._id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Cuestionario no encontrado" });
    }

    // Solo el creador puede ver todas las estadísticas
    if (quiz.creatorId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para ver estas estadísticas" });
    }

    // Obtener todos los intentos para este cuestionario
    const attempts = await QuizAttempt.find({ quizId }).populate(
      "userId",
      "fullName profilePic"
    );

    // Calcular estadísticas
    const totalAttempts = attempts.length;
    const completedAttempts = attempts.filter(
      (a) => a.status === "completed"
    ).length;
    const averageScore =
      attempts.reduce((acc, curr) => acc + (curr.percentageScore || 0), 0) /
      Math.max(completedAttempts, 1);
    const passRate =
      (attempts.filter((a) => a.passed).length /
        Math.max(completedAttempts, 1)) *
      100;
    const averageTime =
      attempts.reduce((acc, curr) => acc + (curr.timeSpent || 0), 0) /
      Math.max(completedAttempts, 1);

    // Estadísticas por pregunta
    const questionStats = quiz.questions.map((question) => {
      const questionAttempts = attempts.flatMap((a) =>
        a.answers.filter(
          (ans) => ans.questionId.toString() === question._id.toString()
        )
      );

      const totalAnswers = questionAttempts.length;
      const correctAnswers = questionAttempts.filter((a) => a.isCorrect).length;
      const accuracy = (correctAnswers / Math.max(totalAnswers, 1)) * 100;

      return {
        questionId: question._id,
        text:
          question.text.substring(0, 50) +
          (question.text.length > 50 ? "..." : ""),
        type: question.type,
        totalAnswers,
        correctAnswers,
        accuracy,
      };
    });

    res.status(200).json({
      totalAttempts,
      completedAttempts,
      averageScore,
      passRate,
      averageTime,
      questionStats,
      attempts: attempts.map((a) => ({
        id: a._id,
        user: a.userId,
        score: a.percentageScore,
        passed: a.passed,
        completedAt: a.completedAt,
        timeSpent: a.timeSpent,
        status: a.status,
      })),
    });
  } catch (error) {
    console.error("Error en getQuizStatistics:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
