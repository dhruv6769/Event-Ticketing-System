import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Landing from '../pages/Landing';
import Home from '../pages/Home';
import Venues from '../pages/Venues';
import EventDetails from '../pages/EventDetails';
import SeatSelection from '../pages/SeatSelection';
import Profile from '../pages/Profile';
import Payment from '../pages/Payment';
import Admin from '../pages/Admin';
import Login from '../pages/Login';
import Leaderboard from '../pages/Leaderboard';

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <>
      {/* Cinema Curtain Wipe */}
      <AnimatePresence>
        <motion.div
          key={`curtain-${location.pathname}`}
          className="fixed inset-0 z-[500] pointer-events-none"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: [0, 1, 0], originX: [0, 0, 1] }}
          transition={{
            duration: 0.7,
            times: [0, 0.45, 1],
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            background: 'linear-gradient(135deg, #e63946 0%, #0d0d12 100%)',
            transformOrigin: 'left',
          }}
        />
      </AnimatePresence>

      {/* Page Content */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/"           element={<PageFade><Landing /></PageFade>} />
          <Route path="/events"     element={<PageFade><Home /></PageFade>} />
          <Route path="/venues"     element={<PageFade><Venues /></PageFade>} />
          <Route path="/event/:id"  element={<PageFade><EventDetails /></PageFade>} />
          <Route path="/book/:eventId" element={<ProtectedRoute><PageFade><SeatSelection /></PageFade></ProtectedRoute>} />
          <Route path="/profile"    element={<ProtectedRoute><PageFade><Profile /></PageFade></ProtectedRoute>} />
          <Route path="/payment"    element={<ProtectedRoute><PageFade><Payment /></PageFade></ProtectedRoute>} />
          <Route path="/leaderboard" element={<PageFade><Leaderboard /></PageFade>} />
          <Route path="/admin"      element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/login"      element={<Login />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

function PageFade({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, delay: 0.35, ease: 'easeOut' }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
  if (!isAdminLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
