# BookYourShow - Premium Event Ticketing System

A robust, production-ready premium event ticketing system where users can register, view live events, request wallet credits, lock seats in real-time, and purchase tickets for movies, sports, comedy shows, and concerts.

## Live Website
🚀 **Frontend Client:** [event-ticketing-system-seven.vercel.app](https://event-ticketing-system-seven.vercel.app/)  
⚙️ **Backend API Service:** [event-ticketing-system-r4lb.onrender.com](https://event-ticketing-system-r4lb.onrender.com/)

---

## 🛠️ Architecture & Tech Stack
- **Frontend Application**: React 18, TypeScript, Vite, TailwindCSS, Framer Motion (for premium 3D tilt effects & micro-animations), Lucide React.
- **Backend Service**: Node.js, Express, Socket.io (for real-time seat locking broadcast).
- **Database & ORM**: PostgreSQL database hosted on **Supabase** coupled with **Prisma ORM** for safe queries.
- **Hosting Platforms**: Vercel (Frontend Client) & Render (Backend Service).

---

## ✨ Core Features
- **Holographic Glassmorphism UI**: Beautiful, interactive visual tickets and neon control dashboards.
- **Dynamic User Authentication**: Secured register and login forms routing admins directly to control centers and users to profiles.
- **Dynamic Admin Dashboard**: Admins can approve name settings, manage profile requests, approve wallet transfer requests, delete users, and view real-time revenue stats.
- **Real-Time Seat Booking**: Powered by Socket.io to synchronize seat selections and locks across all online visitors.
