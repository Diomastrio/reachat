import { axiosInstance } from "./axios";

export const quizService = {
  // Obtener todos los cuestionarios
  getQuizzes: async () => {
    try {
      const response = await axiosInstance.get("/quizzes");
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error al obtener cuestionarios" };
    }
  },

  // Obtener cuestionario por ID
  getQuizById: async (quizId) => {
    try {
      const response = await axiosInstance.get(`/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { error: "Error al obtener el cuestionario" }
      );
    }
  },

  // Crear un nuevo cuestionario
  createQuiz: async (quizData) => {
    try {
      const response = await axiosInstance.post("/quizzes", quizData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error al crear cuestionario" };
    }
  },

  // Iniciar un intento de cuestionario
  startQuizAttempt: async (quizId) => {
    try {
      const response = await axiosInstance.post(`/quizzes/${quizId}/attempts`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error al iniciar cuestionario" };
    }
  },

  // Enviar respuestas de cuestionario
  submitQuizAttempt: async (attemptId, answers) => {
    try {
      const response = await axiosInstance.post(
        `/quizzes/attempts/${attemptId}/submit`,
        { answers }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error al enviar respuestas" };
    }
  },

  // Obtener estadísticas de un cuestionario
  getQuizStatistics: async (quizId) => {
    try {
      const response = await axiosInstance.get(`/quizzes/${quizId}/statistics`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error al obtener estadísticas" };
    }
  },
};
