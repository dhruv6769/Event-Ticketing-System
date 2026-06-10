import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface AlertToastProps {
  show: boolean;
  type: ToastType;
  message: string;
  title?: string;
  onClose?: () => void;
}

const typeConfig: Record<ToastType, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  success: {
    icon: CheckCircle,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.25)',
  },
  error: {
    icon: XCircle,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.25)',
  },
  warning: {
    icon: AlertTriangle,
    color: '#f4c430',
    bg: 'rgba(244,196,48,0.08)',
    border: 'rgba(244,196,48,0.25)',
  },
  info: {
    icon: Info,
    color: '#00d4ff',
    bg: 'rgba(0,212,255,0.08)',
    border: 'rgba(0,212,255,0.25)',
  },
};

export default function AlertToast({ show, type, message, title, onClose }: AlertToastProps) {
  const cfg = typeConfig[type];
  const Icon = cfg.icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 pointer-events-none"
          style={{ backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}
        >
          <motion.div
            initial={{ scale: 0.75, y: 40, rotateX: 25 }}
            animate={{ scale: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.75, y: 40, rotateX: -25, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="relative max-w-sm w-full rounded-3xl p-7 text-center pointer-events-auto overflow-hidden"
            style={{
              background: 'rgba(13,13,18,0.95)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: `1px solid ${cfg.border}`,
              boxShadow: `0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px ${cfg.border}`,
            }}
          >
            {/* Top gradient bar */}
            <div
              className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
              style={{ background: `linear-gradient(90deg, ${cfg.color}, transparent)` }}
            />

            {/* Background glow blob */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-[60px] pointer-events-none"
              style={{ background: cfg.color, opacity: 0.12 }}
            />

            {/* Close button */}
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors rounded-full p-1 hover:bg-white/10"
              >
                <X size={16} />
              </button>
            )}

            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.1, damping: 14 }}
              className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 relative z-10"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
            >
              <Icon size={32} style={{ color: cfg.color }} />
            </motion.div>

            {/* Title */}
            {title && (
              <p className="font-bold text-lg text-white mb-1 relative z-10 font-heading tracking-wider">
                {title}
              </p>
            )}

            {/* Message */}
            <p className="relative z-10 text-gray-300 text-sm leading-relaxed font-medium">
              {message}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
