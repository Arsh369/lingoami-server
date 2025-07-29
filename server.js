const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const connectDB = require("./config/db");
dotenv.config();

// Init express and HTTP server
const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend dev URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Connect MongoDB
connectDB();

// Middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Socket.IO Logic
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // Existing chat functionality
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", ({ to, from, message }) => {
    const sendUserSocket = onlineUsers.get(to);
    const messageData = {
      from,
      message,
      createdAt: new Date().toISOString(), // ✅ add timestamp here
    };
    if (sendUserSocket) {
      io.to(sendUserSocket).emit("msg-receive", messageData);
    }
  });

  // Video chat functionality
  // Join user to their unique room (maybe their userId)
  socket.on("join-video-room", (userId) => {
    socket.join(userId);
    socket.userId = userId;
  });

  // Handle sending offer
  socket.on("video-offer", ({ targetUserId, offer, callerId }) => {
    io.to(targetUserId).emit("video-offer", { offer, callerId });
  });

  // Handle sending answer
  socket.on("video-answer", ({ targetUserId, answer }) => {
    io.to(targetUserId).emit("video-answer", { answer });
  });

  // Handle sending ICE candidates
  socket.on("ice-candidate", ({ targetUserId, candidate }) => {
    io.to(targetUserId).emit("ice-candidate", { candidate });
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    // Clean up from onlineUsers map
    for (let [key, value] of onlineUsers.entries()) {
      if (value === socket.id) {
        onlineUsers.delete(key);
        break;
      }
    }
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));