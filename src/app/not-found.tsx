'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const BUILDINGS = Array.from({ length: 12 }, (_, i) => ({
  left: Math.random() * 90 + 2,
  width: 30 + Math.random() * 50,
  height: 60 + Math.random() * 180,
  delay: Math.random() * 2,
  shade: Math.floor(15 + Math.random() * 25),
}));

const WINDOWS_PER_FLOOR = 4;
const FLOOR_HEIGHT = 18;

export default function NotFound() {
  const [visible, setVisible] = useState(false);
  const [wanderX, setWanderX] = useState(50);

  useEffect(() => {
    setVisible(true);
    const interval = setInterval(() => {
      setWanderX((prev) => {
        const next = prev + (Math.random() - 0.5) * 8;
        return Math.max(10, Math.min(90, next));
      });
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0a0a12] overflow-hidden flex flex-col items-center justify-center select-none">
      {/* Starry sky */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() > 0.9 ? 2 : 1,
              height: Math.random() > 0.9 ? 2 : 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 50}%`,
              opacity: 0.3 + Math.random() * 0.5,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Skyline */}
      <div className="absolute bottom-0 left-0 right-0 h-[55%]">
        {BUILDINGS.map((b, i) => {
          const floors = Math.floor(b.height / FLOOR_HEIGHT);
          return (
            <div
              key={i}
              className="absolute bottom-0"
              style={{
                left: `${b.left}%`,
                width: b.width,
                height: b.height,
                background: `rgb(${b.shade}, ${b.shade}, ${b.shade + 8})`,
                transform: visible
                  ? 'translateY(0)'
                  : 'translateY(100%)',
                transition: `transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)`,
                transitionDelay: `${b.delay}s`,
              }}
            >
              {/* Windows */}
              {Array.from({ length: floors }).map((_, f) =>
                Array.from({ length: WINDOWS_PER_FLOOR }).map((_, w) => {
                  const lit = Math.random() > 0.35;
                  return (
                    <div
                      key={`${f}-${w}`}
                      className="absolute"
                      style={{
                        width: '22%',
                        height: FLOOR_HEIGHT * 0.45,
                        left: `${6 + w * 24}%`,
                        bottom: f * FLOOR_HEIGHT + 4,
                        background: lit
                          ? `rgba(255, ${200 + Math.random() * 55}, ${100 + Math.random() * 80}, ${0.6 + Math.random() * 0.4})`
                          : 'rgba(0,0,0,0.3)',
                        boxShadow: lit
                          ? `0 0 ${4 + Math.random() * 6}px rgba(255,200,100,0.3)`
                          : 'none',
                      }}
                    />
                  );
                })
              )}
            </div>
          );
        })}

        {/* Road */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#1a1a20]">
          <div className="absolute top-1/2 left-0 right-0 h-[2px] flex gap-4 px-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="flex-1 h-full bg-yellow-500/40 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Lost person emoji wandering */}
      <div
        className="absolute bottom-8 text-2xl transition-all duration-500 ease-in-out"
        style={{ left: `${wanderX}%` }}
      >
        🚶
      </div>

      {/* 404 Content */}
      <div
        className="relative z-10 text-center px-6"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 1s ease-out 1.5s',
        }}
      >
        <h1 className="text-[120px] font-bold leading-none tracking-tighter text-white/10">
          404
        </h1>
        <p className="text-xl text-gray-300 mt-2 mb-1">
          Escritório não encontrado
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Parece que esse endereço não existe na nossa cidade.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-white text-sm transition-all duration-300"
        >
          <span className="text-lg">🏙️</span>
          Voltar para a cidade
        </Link>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
