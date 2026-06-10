import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string; // e.g. "rgba(230,57,70,0.4)"
  intensity?: number; // 0-1
  disabled?: boolean;
}

export default function GlowCard({
  children,
  className = '',
  glowColor = 'rgba(230,57,70,0.35)',
  intensity = 1,
  disabled = false,
}: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [gradientPos, setGradientPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGradientPos({ x, y });
  };

  const handleMouseEnter = () => !disabled && setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setGradientPos({ x: 50, y: 50 });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        boxShadow: isHovered
          ? `0 0 60px ${glowColor.replace(/[\d.]+\)$/, `${0.25 * intensity})`)}` 
          : '0 0 0px transparent',
      }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden ${className}`}
      style={{ willChange: 'box-shadow' }}
    >
      {/* Mouse-tracking inner glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? intensity : 0,
          background: `radial-gradient(circle 300px at ${gradientPos.x}% ${gradientPos.y}%, ${glowColor}, transparent 70%)`,
        }}
      />
      <div className="relative z-10 w-full h-full">{children}</div>
    </motion.div>
  );
}
