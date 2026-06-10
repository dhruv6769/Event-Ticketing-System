import { } from 'react';
import { motion } from 'framer-motion';

type NeoButtonVariant = 'crimson' | 'gold' | 'ghost' | 'electric' | 'success' | 'danger';

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: NeoButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<NeoButtonVariant, { bg: string; border: string; shadow: string; shimmer: string }> = {
  crimson: {
    bg: 'linear-gradient(135deg, #e63946, #c1121f)',
    border: 'rgba(230,57,70,0.4)',
    shadow: '0 8px 32px rgba(230,57,70,0.35)',
    shimmer: 'rgba(255,255,255,0.2)',
  },
  gold: {
    bg: 'linear-gradient(135deg, #f4c430, #c9960b)',
    border: 'rgba(244,196,48,0.4)',
    shadow: '0 8px 32px rgba(244,196,48,0.25)',
    shimmer: 'rgba(255,255,255,0.25)',
  },
  electric: {
    bg: 'linear-gradient(135deg, #00d4ff, #0089a7)',
    border: 'rgba(0,212,255,0.4)',
    shadow: '0 8px 32px rgba(0,212,255,0.25)',
    shimmer: 'rgba(255,255,255,0.2)',
  },
  success: {
    bg: 'linear-gradient(135deg, #22c55e, #16a34a)',
    border: 'rgba(34,197,94,0.4)',
    shadow: '0 8px 32px rgba(34,197,94,0.25)',
    shimmer: 'rgba(255,255,255,0.2)',
  },
  danger: {
    bg: 'linear-gradient(135deg, #ef4444, #b91c1c)',
    border: 'rgba(239,68,68,0.4)',
    shadow: '0 8px 32px rgba(239,68,68,0.25)',
    shimmer: 'rgba(255,255,255,0.2)',
  },
  ghost: {
    bg: 'rgba(255,255,255,0.05)',
    border: 'rgba(255,255,255,0.12)',
    shadow: '0 4px 16px rgba(0,0,0,0.3)',
    shimmer: 'rgba(255,255,255,0.08)',
  },
};

const sizeStyles = {
  sm: 'px-5 py-2 text-xs rounded-xl gap-1.5',
  md: 'px-7 py-3 text-sm rounded-2xl gap-2',
  lg: 'px-10 py-4 text-base rounded-2xl gap-3',
};

export default function NeoButton({
  variant = 'crimson',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: NeoButtonProps) {
  const v = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={isDisabled ? {} : { scale: 1.02, y: -1 }}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      disabled={isDisabled}
      className={`
        relative inline-flex items-center justify-center font-bold tracking-wide
        overflow-hidden transition-all duration-200 shimmer select-none
        ${sizeStyles[size]} ${className}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      style={{
        background: v.bg,
        border: `1px solid ${v.border}`,
        boxShadow: isDisabled ? 'none' : v.shadow,
        color: variant === 'gold' ? '#0d0d12' : '#ffffff',
      }}
      {...(props as any)}
    >
      {/* Shimmer overlay */}
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(105deg, transparent 40%, ${v.shimmer} 50%, transparent 60%)`,
        }}
      />

      {/* Loading spinner */}
      {loading && (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"
        />
      )}

      {!loading && icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="relative z-10">{children}</span>
      {!loading && iconRight && <span className="flex-shrink-0">{iconRight}</span>}
    </motion.button>
  );
}
