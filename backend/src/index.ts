import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

// const prisma = new PrismaClient({
//  datasources: { db: { url: process.env.DATABASE_URL } }
// });
// const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const lockMap: Record<string, string> = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  
  socket.on("lock_seat", async ({ seatId, userId, eventId }) => {
    // Basic real-time mock lock broadcast without Redis dependency
    const lockKey = `seat_lock:${eventId}:${seatId}`;
    lockMap[lockKey] = userId;
    io.emit("seat_locked", { seatId, eventId, userId });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
