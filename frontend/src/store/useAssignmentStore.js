import { create } from "zustand";
import { assignmentService } from "../lib/assignmentService";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useAssignmentStore = create((set, get) => ({
  assignments: [],
  currentAssignment: null,
  isLoading: false,
  error: null,

  getAssignments: async () => {
    set({ isLoading: true, error: null });
    try {
      const assignments = await assignmentService.getAssignments();
      set({ assignments, isLoading: false });
    } catch (error) {
      set({
        error: error.message || "Failed to fetch assignments",
        isLoading: false,
      });
      toast.error(error.message || "Failed to fetch assignments");
    }
  },

  getAssignmentById: async (assignmentId) => {
    set({ isLoading: true, error: null });
    try {
      const assignment = await assignmentService.getAssignmentById(
        assignmentId
      );
      set({ currentAssignment: assignment, isLoading: false });
      return assignment;
    } catch (error) {
      set({
        error: error.message || "Failed to fetch assignment",
        isLoading: false,
      });
      toast.error(error.message || "Failed to fetch assignment");
    }
  },

  createAssignment: async (assignmentData) => {
    set({ isLoading: true, error: null });
    try {
      const newAssignment = await assignmentService.createAssignment(
        assignmentData
      );
      set((state) => ({
        assignments: [newAssignment, ...state.assignments],
        isLoading: false,
      }));
      toast.success("Assignment created successfully");
      return newAssignment;
    } catch (error) {
      set({
        error: error.message || "Failed to create assignment",
        isLoading: false,
      });
      toast.error(error.message || "Failed to create assignment");
    }
  },

  submitAssignment: async (assignmentId, submissionData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedAssignment = await assignmentService.submitAssignment(
        assignmentId,
        submissionData
      );

      // Update the assignment in the assignments array
      set((state) => ({
        assignments: state.assignments.map((a) =>
          a._id === assignmentId ? updatedAssignment : a
        ),
        currentAssignment: updatedAssignment,
        isLoading: false,
      }));

      toast.success("Assignment submitted successfully");
      return updatedAssignment;
    } catch (error) {
      set({
        error: error.message || "Failed to submit assignment",
        isLoading: false,
      });
      toast.error(error.message || "Failed to submit assignment");
    }
  },

  gradeSubmission: async (assignmentId, submissionId, gradeData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedAssignment = await assignmentService.gradeSubmission(
        assignmentId,
        submissionId,
        gradeData
      );

      // Update the assignment in the assignments array
      set((state) => ({
        assignments: state.assignments.map((a) =>
          a._id === assignmentId ? updatedAssignment : a
        ),
        currentAssignment: updatedAssignment,
        isLoading: false,
      }));

      toast.success("Submission graded successfully");
      return updatedAssignment;
    } catch (error) {
      set({
        error: error.message || "Failed to grade submission",
        isLoading: false,
      });
      toast.error(error.message || "Failed to grade submission");
    }
  },

  subscribeToAssignmentEvents: () => {
    const socket = useAuthStore.getState().socket;

    if (!socket) return;

    socket.on("newAssignment", (data) => {
      toast.success(`New assignment received: ${data.title}`);
      get().getAssignments();
    });

    socket.on("newSubmission", (data) => {
      toast.success(`New submission received for: ${data.title}`);
      if (get().currentAssignment?._id === data.assignmentId) {
        get().getAssignmentById(data.assignmentId);
      } else {
        get().getAssignments();
      }
    });

    socket.on("submissionGraded", (data) => {
      toast.success(
        `Your submission for ${data.title} has been graded. Score: ${data.score}`
      );
      if (get().currentAssignment?._id === data.assignmentId) {
        get().getAssignmentById(data.assignmentId);
      } else {
        get().getAssignments();
      }
    });
  },

  unsubscribeFromAssignmentEvents: () => {
    const socket = useAuthStore.getState().socket;

    if (!socket) return;

    socket.off("newAssignment");
    socket.off("newSubmission");
    socket.off("submissionGraded");
  },
}));
