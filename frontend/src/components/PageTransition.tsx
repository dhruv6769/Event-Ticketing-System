import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <>
      {/* Cinema curtain wipe — enters covering the screen, then reveals */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`curtain-${location.pathname}`}
          className="fixed inset-0 z-[500] pointer-events-none"
          style={{ transformOrigin: 'left' }}
          initial={{ scaleX: 0, transformOrigin: 'left' }}
          animate={{
            scaleX: [0, 1, 1, 0],
            transformOrigin: ['left', 'left', 'right', 'right'],
          }}
          transition={{
            duration: 0.8,
            times: [0, 0.45, 0.55, 1],
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div
            className="w-full h-full"
            style={{
              background: 'linear-gradient(135deg, #e63946 0%, #0d0d12 100%)',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Page content fade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.4, ease: 'easeOut' }}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
