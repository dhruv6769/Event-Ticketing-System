"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: "*" },
});
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey_change_in_production";
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
app.post("/api/auth/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        const existing = yield prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: "Email already in use" });
        }
        const password_hash = yield bcrypt_1.default.hash(password, 10);
        const user = yield prisma.user.create({
            data: { name, email, password_hash, quick_upi_balance: 5000.0 }
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, balance: user.quick_upi_balance, avatar: user.avatar_url } });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}));
app.post("/api/auth/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(401).json({ error: "Invalid credentials" });
        const valid = yield bcrypt_1.default.compare(password, user.password_hash);
        if (!valid)
            return res.status(401).json({ error: "Invalid credentials" });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, balance: user.quick_upi_balance, avatar: user.avatar_url } });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}));
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});
// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null)
        return res.sendStatus(401);
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
        if (err)
            return res.sendStatus(403);
        req.user = user;
        next();
    });
};
// ==========================================
// PROFILE & BOOKING ROUTES
// ==========================================
app.get("/api/users/profile", authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma.user.findUnique({
            where: { id: req.user.userId },
            include: {
                bookings: {
                    orderBy: { created_at: 'desc' }
                }
            }
        });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}));
app.post("/api/bookings", authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventTitle, eventVenue, eventDate, seatsSummary, totalAmount } = req.body;
        // Create booking
        const booking = yield prisma.booking.create({
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
        yield prisma.user.update({
            where: { id: req.user.userId },
            data: { quick_upi_balance: { decrement: totalAmount } }
        });
        res.json({ booking });
    }
    catch (error) {
        console.error("Booking error:", error);
        res.status(500).json({ error: "Failed to process booking" });
    }
}));
const lockMap = {};
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    socket.on("lock_seat", (_a) => __awaiter(void 0, [_a], void 0, function* ({ seatId, userId, eventId }) {
        // Basic real-time mock lock broadcast without Redis dependency
        const lockKey = `seat_lock:${eventId}:${seatId}`;
        lockMap[lockKey] = userId;
        io.emit("seat_locked", { seatId, eventId, userId });
    }));
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});
const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
