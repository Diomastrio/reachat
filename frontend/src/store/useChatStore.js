/* eslint-disable no-unused-vars */
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { showMessageToast } from "../components/MessageToast";

const useArchiveState = (set, get) => ({
  archivedUserIds: [],
  showArchived: false,
  toggleShowArchived: () =>
    set((state) => ({ showArchived: !state.showArchived })),
  archiveChat: (userId) =>
    set((state) => ({
      archivedUserIds: [...state.archivedUserIds, userId],
      selectedUser:
        state.selectedUser?._id === userId ? null : state.selectedUser,
    })),
  unarchiveChat: (userId) =>
    set((state) => ({
      archivedUserIds: state.archivedUserIds.filter((id) => id !== userId),
    })),
});

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  messageFilter: "todos",
  setMessageFilter: (filter) => set({ messageFilter: filter }),

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  markMessageAsRead: async (messageId) => {
    try {
      const res = await axiosInstance.put(`/messages/read/${messageId}`);

      // Update the message in the messages array
      set((state) => ({
        messages: state.messages.map((message) =>
          message._id === messageId ? { ...message, status: "read" } : message
        ),
      }));

      return res.data;
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      const authUser = useAuthStore.getState().authUser;

      set({
        messages: [...get().messages, newMessage],
      });

      // Show toast notification only for incoming messages
      if (newMessage.senderId !== authUser._id) {
        const sender = get().users.find(
          (user) => user._id === newMessage.senderId
        );

        showMessageToast(newMessage, sender);
      }
    });

    // Listen for message read status updates
    socket.on("messageRead", (messageId) => {
      set((state) => ({
        messages: state.messages.map((message) =>
          message._id === messageId ? { ...message, status: "read" } : message
        ),
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messageRead");
  },

  editMessage: async (messageId, updatedData) => {
    try {
      const res = await axiosInstance.put(
        `/messages/edit/${messageId}`,
        updatedData
      );
      set((state) => ({
        messages: state.messages.map((message) =>
          message._id === messageId ? res.data : message
        ),
      }));
      toast.success("Message updated successfully");
    } catch (error) {
      toast.error("Failed to update message");
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/delete/${messageId}`);
      set((state) => ({
        messages: state.messages.filter((message) => message._id !== messageId),
      }));
      toast.success("Message deleted successfully");
    } catch (error) {
      toast.error("Failed to delete message");
    }
  },
  setSelectedUser: (selectedUser) => set({ selectedUser }),
  ...useArchiveState(set, get),
}));
