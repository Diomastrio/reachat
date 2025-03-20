import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("createAssignment", (data) => {
    const { assignedTo } = data;
    for (const userId of assignedTo) {
      const socketId = userSocketMap[userId];
      if (socketId) {
        io.to(socketId).emit("newAssignment", data);
      }
    }
  });

  socket.on("submitAssignment", (data) => {
    const { creatorId } = data;
    const socketId = userSocketMap[creatorId];
    if (socketId) {
      io.to(socketId).emit("newSubmission", data);
    }
  });

  socket.on("gradeSubmission", (data) => {
    const { studentId } = data;
    const socketId = userSocketMap[studentId];
    if (socketId) {
      io.to(socketId).emit("submissionGraded", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
