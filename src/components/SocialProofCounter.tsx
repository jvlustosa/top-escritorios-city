'use client';

import { useState, useEffect, useRef } from 'react';

interface SocialProofCounterProps {
  total: number;
  verified: number;
}

function useCountUp(target: number, duration: number, delay: number = 0) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) return;

    const timeout = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * target));

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        } else {
          setCount(target);
        }
      };

      frameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [target, duration, delay]);

  return count;
}

export default function SocialProofCounter({ total, verified }: SocialProofCounterProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Small delay before fade in so it doesn't compete with initial render
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  const totalCount = useCountUp(total, 1500, 400);
  const verifiedCount = useCountUp(verified, 1200, 500);

  return (
    <div
      className="absolute bottom-4 left-5 z-10 pointer-events-none transition-opacity duration-700"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div className="px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full border border-[#222]">
        <p className="text-[#999] text-xs tabular-nums">
          <span className="text-white font-medium">{totalCount}</span> escritórios
          <span className="text-[#555] mx-1.5">·</span>
          <span className="text-emerald-400 font-medium">{verifiedCount}</span> verificados
        </p>
      </div>
    </div>
  );
}
