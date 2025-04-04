import { create } from "zustand";
import { quizService } from "../lib/quizService";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useQuizStore = create((set, get) => ({
  quizzes: [],
  currentQuiz: null,
  currentAttempt: null,
  quizStatistics: null,
  isLoading: false,
  error: null,

  // Obtener todos los cuestionarios
  getQuizzes: async () => {
    set({ isLoading: true, error: null });
    try {
      const quizzes = await quizService.getQuizzes();
      set({ quizzes, isLoading: false });
    } catch (error) {
      set({
        error: error.message || "Error al obtener cuestionarios",
        isLoading: false,
      });
      toast.error(error.message || "Error al obtener cuestionarios");
    }
  },

  // Obtener cuestionario por ID
  getQuizById: async (quizId) => {
    set({ isLoading: true, error: null });
    try {
      const quiz = await quizService.getQuizById(quizId);
      set({ currentQuiz: quiz, isLoading: false });
      return quiz;
    } catch (error) {
      set({
        error: error.message || "Error al obtener el cuestionario",
        isLoading: false,
      });
      toast.error(error.message || "Error al obtener el cuestionario");
    }
  },

  // Crear cuestionario
  createQuiz: async (quizData) => {
    set({ isLoading: true, error: null });
    try {
      const newQuiz = await quizService.createQuiz(quizData);
      set((state) => ({
        quizzes: [newQuiz, ...state.quizzes],
        isLoading: false,
      }));
      toast.success("Cuestionario creado exitosamente");
      return newQuiz;
    } catch (error) {
      set({
        error: error.message || "Error al crear cuestionario",
        isLoading: false,
      });
      toast.error(error.message || "Error al crear cuestionario");
    }
  },

  // Iniciar intento de cuestionario
  startQuizAttempt: async (quizId) => {
    set({ isLoading: true, error: null });
    try {
      const attemptData = await quizService.startQuizAttempt(quizId);
      set({
        currentAttempt: attemptData,
        isLoading: false,
      });
      return attemptData;
    } catch (error) {
      set({
        error: error.message || "Error al iniciar cuestionario",
        isLoading: false,
      });
      toast.error(error.message || "Error al iniciar cuestionario");
    }
  },

  // Enviar respuestas de cuestionario
  submitQuizAttempt: async (attemptId, answers) => {
    set({ isLoading: true, error: null });
    try {
      const result = await quizService.submitQuizAttempt(attemptId, answers);
      set({
        currentAttempt: null,
        isLoading: false,
      });
      toast.success("Cuestionario enviado correctamente");
      return result;
    } catch (error) {
      set({
        error: error.message || "Error al enviar respuestas",
        isLoading: false,
      });
      toast.error(error.message || "Error al enviar respuestas");
    }
  },

  // Obtener estadísticas
  getQuizStatistics: async (quizId) => {
    set({ isLoading: true, error: null });
    try {
      const statistics = await quizService.getQuizStatistics(quizId);
      set({
        quizStatistics: statistics,
        isLoading: false,
      });
      return statistics;
    } catch (error) {
      set({
        error: error.message || "Error al obtener estadísticas",
        isLoading: false,
      });
      toast.error(error.message || "Error al obtener estadísticas");
    }
  },

  // Suscribir a eventos de socket.io
  subscribeToQuizEvents: () => {
    const socket = useAuthStore.getState().socket;

    if (!socket) return;

    socket.on("newQuiz", (data) => {
      toast.success(`Nuevo cuestionario recibido: ${data.title}`);
      get().getQuizzes();
    });

    socket.on("quizAttemptCompleted", (data) => {
      toast.success(
        `${data.student} completó el cuestionario "${data.title}" con puntuación: ${data.score}`
      );
    });
  },

  // Cancelar suscripción
  unsubscribeFromQuizEvents: () => {
    const socket = useAuthStore.getState().socket;

    if (!socket) return;

    socket.off("newQuiz");
    socket.off("quizAttemptCompleted");
  },
}));
