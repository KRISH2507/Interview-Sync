import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join-room", ({ roomId, userId }) => {
    if (!roomId) return;
    socket.join(roomId);
    socket.to(roomId).emit("peer-joined", { userId, socketId: socket.id });
  });

  socket.on("offer", ({ roomId, offer }) => {
    if (!roomId || !offer) return;
    socket.to(roomId).emit("offer", { offer, senderId: socket.id });
  });

  socket.on("answer", ({ roomId, answer }) => {
    if (!roomId || !answer) return;
    socket.to(roomId).emit("answer", { answer, senderId: socket.id });
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    if (!roomId || !candidate) return;
    socket.to(roomId).emit("ice-candidate", { candidate, senderId: socket.id });
  });
});

connectDB().then(() => {
  httpServer.on("error", (error) => {
    if (error?.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Stop the existing process and restart.`);
      process.exit(1);
    }

    console.error("Server startup error:", error);
    process.exit(1);
  });

  httpServer.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
  );
});
