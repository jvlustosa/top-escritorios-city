'use client';

import { useState, useRef, useCallback, ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: 'top' | 'bottom';
  maxWidth?: number;
}

export default function Tooltip({ children, content, position = 'top', maxWidth = 220 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisible(true), 150);
  }, []);

  const hide = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  }, []);

  const isTop = position === 'top';

  return (
    <span className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      <span
        className={`
          pointer-events-none absolute left-1/2 -translate-x-1/2 z-50
          bg-[#0a0a0a] border border-[#222] px-3 py-2
          text-[10px] leading-relaxed text-[#888] font-normal
          transition-opacity duration-150
          ${isTop ? 'bottom-full mb-2' : 'top-full mt-2'}
          ${visible ? 'opacity-100' : 'opacity-0'}
        `}
        style={{ maxWidth, width: 'max-content' }}
      >
        {content}
        {/* Arrow */}
        <span
          className={`
            absolute left-1/2 -translate-x-1/2
            w-2 h-2 bg-[#0a0a0a] border-[#222] rotate-45
            ${isTop ? 'top-full -mt-1 border-r border-b' : 'bottom-full -mb-1 border-l border-t'}
          `}
        />
      </span>
    </span>
  );
}
