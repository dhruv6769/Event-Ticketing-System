import { useEffect, useRef, useState } from 'react';

interface MetricCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number; // ms
  className?: string;
}

export default function MetricCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 1200,
  className = '',
}: MetricCounterProps) {
  const [displayed, setDisplayed] = useState(0);
  const startTime = useRef<number | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const start = 0;
    const end = value;
    startTime.current = null;

    const animate = (ts: number) => {
      if (!startTime.current) startTime.current = ts;
      const progress = Math.min((ts - startTime.current) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.floor(start + (end - start) * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  return (
    <span className={`font-mono tabular-nums ${className}`}>
      {prefix}{displayed.toLocaleString()}{suffix}
    </span>
  );
}
