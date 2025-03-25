import { axiosInstance } from "./axios";

export const assignmentService = {
  createAssignment: async (assignmentData) => {
    try {
      const response = await axiosInstance.post("/assignments", assignmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to create assignment" };
    }
  },

  getAssignments: async () => {
    try {
      const response = await axiosInstance.get("/assignments");
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to fetch assignments" };
    }
  },

  getAssignmentById: async (assignmentId) => {
    try {
      const response = await axiosInstance.get(`/assignments/${assignmentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to fetch assignment" };
    }
  },

  submitAssignment: async (assignmentId, submissionData) => {
    try {
      const response = await axiosInstance.post(
        `/assignments/${assignmentId}/submit`,
        submissionData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to submit assignment" };
    }
  },

  submitAssignmentWithFiles: async (assignmentId, submissionData) => {
    try {
      const response = await axiosInstance.post(
        `/assignments/${assignmentId}/submit-with-files`,
        submissionData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error submitting assignment"
      );
    }
  },

  gradeSubmission: async (assignmentId, submissionId, gradeData) => {
    try {
      const response = await axiosInstance.post(
        `/assignments/${assignmentId}/submissions/${submissionId}/grade`,
        gradeData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to grade submission" };
    }
  },
};
