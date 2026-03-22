'use client';

import { useState, useEffect, useCallback } from 'react';

const TOUR_KEY = 'tour_completed';

interface Step {
  message: string;
  /** Tailwind/inline position classes for the tooltip box */
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
    transform?: string;
  };
  /** Which side the arrow points toward */
  arrowDirection: 'up' | 'down' | 'left' | 'right';
}

const steps: Step[] = [
  {
    message: 'Esta é a cidade dos escritórios de advocacia',
    position: {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },
    arrowDirection: 'down',
  },
  {
    message: 'Cada prédio representa um escritório real',
    position: {
      top: '55%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },
    arrowDirection: 'up',
  },
  {
    message: 'Registre o seu e apareça no ranking',
    position: {
      top: '80px',
      right: '16px',
    },
    arrowDirection: 'up',
  },
];

function Arrow({ direction }: { direction: Step['arrowDirection'] }) {
  const base = 'absolute border-[6px] border-transparent';

  if (direction === 'up') {
    // Arrow points up — triangle hangs above the box
    return (
      <span
        className={`${base} -top-[12px] left-1/2 -translate-x-1/2`}
        style={{ borderBottomColor: '#ffffff' }}
      />
    );
  }

  if (direction === 'down') {
    // Arrow points down — triangle hangs below the box
    return (
      <span
        className={`${base} -bottom-[12px] left-1/2 -translate-x-1/2`}
        style={{ borderTopColor: '#ffffff' }}
      />
    );
  }

  if (direction === 'left') {
    return (
      <span
        className={`${base} -left-[12px] top-1/2 -translate-y-1/2`}
        style={{ borderRightColor: '#ffffff' }}
      />
    );
  }

  // right
  return (
    <span
      className={`${base} -right-[12px] top-1/2 -translate-y-1/2`}
      style={{ borderLeftColor: '#ffffff' }}
    />
  );
}

export default function GuidedTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      const done = localStorage.getItem(TOUR_KEY);
      if (!done) setVisible(true);
    } catch {
      // localStorage unavailable — skip tour
    }
  }, []);

  const completeTour = useCallback(() => {
    try {
      localStorage.setItem(TOUR_KEY, '1');
    } catch {
      // ignore
    }
    setVisible(false);
  }, []);

  const handleNext = useCallback(() => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      completeTour();
    }
  }, [step, completeTour]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Only dismiss when clicking directly on the overlay, not on the tooltip
      if (e.target === e.currentTarget) {
        completeTour();
      }
    },
    [completeTour],
  );

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') completeTour();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible, completeTour]);

  if (!visible) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    // Overlay — dims the background
    <div
      className="fixed inset-0 z-[100] bg-black/50"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Tour guiado"
    >
      {/* Tooltip */}
      <div
        className="absolute w-[280px] bg-white text-black"
        style={{
          top: current.position.top,
          bottom: current.position.bottom,
          left: current.position.left,
          right: current.position.right,
          transform: current.position.transform,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pointing arrow */}
        <Arrow direction={current.arrowDirection} />

        <div className="px-5 py-4">
          {/* Step counter */}
          <p className="text-[10px] uppercase tracking-widest text-[#888] mb-2 select-none">
            {step + 1}/{steps.length}
          </p>

          {/* Message */}
          <p className="text-sm font-medium leading-snug text-black">
            {current.message}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between mt-4">
            {/* Dismiss link */}
            <button
              onClick={completeTour}
              className="text-[#888] text-xs hover:text-black transition-colors underline underline-offset-2"
            >
              Pular
            </button>

            {/* Next / Start */}
            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-black text-white text-xs font-medium hover:bg-[#222] transition-colors"
            >
              {isLast ? 'Começar' : 'Próximo'}
            </button>
          </div>
        </div>

        {/* Step progress bar */}
        <div className="flex h-[2px]">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`flex-1 transition-colors duration-300 ${
                i <= step ? 'bg-black' : 'bg-[#ddd]'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
