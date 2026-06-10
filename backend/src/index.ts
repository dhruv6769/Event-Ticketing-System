import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

const prisma = new PrismaClient({});
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey_change_in_production";

app.use(cors());
app.use(express.json());

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Email already in use" });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password_hash, quick_upi_balance: 5000.0 }
    });
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, balance: user.quick_upi_balance, avatar: user.avatar_url } });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, balance: user.quick_upi_balance, avatar: user.avatar_url } });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Middleware to verify JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// ==========================================
// PROFILE & BOOKING ROUTES
// ==========================================

app.get("/api/users/profile", authenticateToken, async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        bookings: {
          orderBy: { created_at: 'desc' }
        }
      }
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/bookings", authenticateToken, async (req: any, res: any) => {
  try {
    const { eventTitle, eventVenue, eventDate, seatsSummary, totalAmount } = req.body;
    
    // Create booking
    const booking = await prisma.booking.create({
      data: {
        user_id: req.user.userId,
        event_title: eventTitle,
        event_venue: eventVenue,
        event_date: eventDate,
        seats_summary: seatsSummary,
        total_amount: totalAmount,
        status: "CONFIRMED",
        qr_code_url: `TICKET-` + Date.now()
      }
    });

    // Deduct balance
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { quick_upi_balance: { decrement: totalAmount } }
    });

    res.json({ booking });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ error: "Failed to process booking" });
  }
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
