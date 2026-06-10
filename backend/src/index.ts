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
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, balance: user.quick_upi_balance, avatar: user.avatar_url, role: user.role } });
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
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, balance: user.quick_upi_balance, avatar: user.avatar_url, role: user.role } });
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
        },
        transactions: {
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

// ==========================================
// ADMIN DASHBOARD METRICS ROUTES
// ==========================================

app.get("/api/admin/dashboard-metrics", authenticateToken, async (req: any, res: any) => {
  try {
    const requester = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!requester || requester.role !== "ADMIN") {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const bookings = await prisma.booking.findMany({});
    
    let totalRevenue = 0;
    let totalTicketsSold = 0;
    
    bookings.forEach((b) => {
      totalRevenue += b.total_amount;
      
      const match = b.seats_summary?.match(/- (\d+)\s+Seat/i);
      if (match && match[1]) {
        totalTicketsSold += parseInt(match[1], 10);
      } else {
        totalTicketsSold += 1;
      }
    });
    
    res.json({
      revenue: totalRevenue,
      ticketsSold: totalTicketsSold
    });
  } catch (error) {
    console.error("Dashboard metrics error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==========================================
// ADMIN USER MANAGEMENT ROUTES
// ==========================================

app.get("/api/admin/users", authenticateToken, async (req: any, res: any) => {
  try {
    const requester = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!requester || requester.role !== "ADMIN") {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const users = await prisma.user.findMany({
      orderBy: { created_at: 'desc' }
    });
    
    const sanitizedUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      quick_upi_balance: u.quick_upi_balance,
      avatar_url: u.avatar_url,
      profile: {
        name: u.name,
        email: u.email,
        avatar: u.avatar_url || ''
      }
    }));
    
    res.json(sanitizedUsers);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/admin/users/:email", authenticateToken, async (req: any, res: any) => {
  try {
    const requester = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!requester || requester.role !== "ADMIN") {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const { email } = req.params;
    if (requester.email === email) {
      return res.status(400).json({ error: "Cannot delete yourself" });
    }
    
    const userToDelete = await prisma.user.findUnique({ where: { email } });
    if (!userToDelete) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Delete associated bookings/seatlocks/transactions/etc. to avoid foreign key violations
    await prisma.booking.deleteMany({ where: { user_id: userToDelete.id } });
    await prisma.transaction.deleteMany({ where: { user_id: userToDelete.id } });
    await prisma.supportTicket.deleteMany({ where: { user_id: userToDelete.id } });
    await prisma.nameChangeRequest.deleteMany({ where: { user_id: userToDelete.id } });
    await prisma.notification.deleteMany({ where: { user_id: userToDelete.id } });
    await prisma.review.deleteMany({ where: { user_id: userToDelete.id } });
    await prisma.waitlist.deleteMany({ where: { user_id: userToDelete.id } });
    await prisma.seatLock.deleteMany({ where: { user_id: userToDelete.id } });
    await prisma.auditLog.deleteMany({ where: { admin_id: userToDelete.id } });
    
    await prisma.user.delete({ where: { id: userToDelete.id } });
    
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/admin/users/update-profile", authenticateToken, async (req: any, res: any) => {
  try {
    const requester = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!requester || requester.role !== "ADMIN") {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const { email, name, avatar } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        name: name,
        avatar_url: avatar
      }
    });
    
    res.json({ message: "Profile updated in database", user: updatedUser });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/admin/users/credit-balance", authenticateToken, async (req: any, res: any) => {
  try {
    const requester = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!requester || requester.role !== "ADMIN") {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const { email, amount } = req.body;
    const amountVal = parseFloat(amount);
    
    if (isNaN(amountVal) || amountVal <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    
    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        quick_upi_balance: {
          increment: amountVal
        }
      }
    });
    
    await prisma.transaction.create({
      data: {
        user_id: targetUser.id,
        type: "CREDIT",
        amount: amountVal,
        description: "Funds Added via Admin Approval"
      }
    });
    
    res.json({ message: "Balance updated successfully", balance: updatedUser.quick_upi_balance });
  } catch (error) {
    console.error("Credit balance error:", error);
    res.status(500).json({ error: "Internal server error" });
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
