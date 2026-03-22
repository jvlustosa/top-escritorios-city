'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { mockOffices, rankOffices, RankedOffice } from '@/data/mock-offices';
import OfficeSidebar from '@/components/OfficeSidebar';
import MobileCardGrid from '@/components/MobileCardGrid';
import SocialProofCounter from '@/components/SocialProofCounter';
import GuidedTour from '@/components/GuidedTour';

function CityLoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        if (prev >= 92) return prev + 4;
        if (prev >= 60) return prev + 2;
        return prev + 4;
      });
    }, 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black relative overflow-hidden">
      {/* Animated skyline silhouette */}
      <div className="flex items-end gap-[3px] mb-8">
        {[3, 5, 4, 7, 3, 6, 4, 5, 8, 3, 4, 6, 5, 3, 7, 4].map((h, i) => (
          <div
            key={i}
            className="rounded-t-sm transition-all duration-500"
            style={{
              width: `${6 + (i % 3) * 2}px`,
              height: `${h * 8}px`,
              backgroundColor: (i / 16) * 100 < progress ? '#333' : '#111',
              transform: (i / 16) * 100 < progress ? 'scaleY(1)' : 'scaleY(0.3)',
              transformOrigin: 'bottom',
              transitionDelay: `${i * 50}ms`,
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-48 h-[2px] bg-[#1a1a1a] rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-white/60 rounded-full transition-all duration-200 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Loading text */}
      <p className="text-[#555] text-xs tracking-widest uppercase">
        Construindo a cidade
      </p>
    </div>
  );
}

const CityScene = dynamic(() => import('@/components/CityScene'), {
  ssr: false,
  loading: () => <CityLoadingScreen />,
});

// Isolated component so useSearchParams is inside its own Suspense boundary
function WelcomeToast() {
  const searchParams = useSearchParams();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const newSlug = searchParams.get('new');
    if (newSlug) {
      setShowToast(true);
      // Clean the URL without triggering navigation
      const url = new URL(window.location.href);
      url.searchParams.delete('new');
      window.history.replaceState({}, '', url.pathname + (url.search || ''));
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!showToast) return null;

  return (
    <div className="absolute top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="mt-4 mx-4 px-5 py-3 bg-white text-black text-sm font-medium flex items-center gap-4 pointer-events-auto max-w-lg w-full">
        <span className="flex-1">
          Seu escritório foi adicionado! Verifique para subir no ranking.
        </span>
        <button
          onClick={() => setShowToast(false)}
          className="text-[#555] hover:text-black transition-colors text-xs uppercase tracking-widest flex-shrink-0"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

export default function HomeClient() {
  const [offices] = useState<RankedOffice[]>(() => rankOffices(mockOffices));
  const [selectedOffice, setSelectedOffice] = useState<RankedOffice | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [timeMode, setTimeMode] = useState<'auto' | 'day' | 'night'>('auto');
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  function handleSelectOffice(office: RankedOffice) {
    setSelectedOffice(office);
    setHasInteracted(true);
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Welcome toast — wrapped in Suspense as required by Next.js 14 for useSearchParams */}
      <Suspense fallback={null}>
        <WelcomeToast />
      </Suspense>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-5 pointer-events-none">
        <div className="flex items-center justify-between">
          <div className="pointer-events-auto">
            <h1 className="text-white text-lg font-semibold tracking-tight">
              top<span className="text-[#555]">.escritorio</span><span className="text-[#888]">.ai</span>
            </h1>
            <a
              href="https://chatjuridico.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-2 px-2.5 py-1 bg-white/[0.06] border border-white/[0.08] rounded-full hover:bg-white/[0.1] hover:border-white/[0.15] transition-all group"
            >
              <img src="/brands/chat-juridico-icon-white.svg" alt="" className="h-3.5 w-3.5 opacity-50 group-hover:opacity-80 transition-opacity" />
              <span className="text-[10px] text-[#666] group-hover:text-[#999] transition-colors tracking-wide uppercase">
                Potencializado por <span className="text-[#888] group-hover:text-white font-medium">ChatJuridico</span>
              </span>
            </a>
          </div>
          <div className="flex items-center gap-3 pointer-events-auto">
            <button
              onClick={() => setTimeMode(prev => prev === 'auto' ? 'day' : prev === 'day' ? 'night' : 'auto')}
              className="px-3 py-2 bg-[#1a1a1a] border border-[#333] text-[#aaa] text-xs font-medium rounded hover:bg-[#222] hover:text-white transition-colors"
              title="Alternar dia/noite"
            >
              {timeMode === 'day' ? 'Dia' : timeMode === 'night' ? 'Noite' : 'Auto'}
            </button>
            <a
              href="/register"
              className="px-4 py-2 bg-white text-black text-xs font-medium rounded hover:bg-[#e0e0e0] transition-colors"
            >
              Registrar
            </a>
          </div>
        </div>
      </div>

      {isMobile ? (
        <div className="pt-20 h-full overflow-y-auto">
          <MobileCardGrid offices={offices} onSelectOffice={handleSelectOffice} />
        </div>
      ) : (
        <CityScene offices={offices} onSelectOffice={handleSelectOffice} timeOverride={timeMode} />
      )}

      {/* Hint — fades after first click */}
      {!isMobile && !hasInteracted && !selectedOffice && (
        <div className="absolute bottom-14 left-0 right-0 z-10 flex justify-center pointer-events-none">
          <p className="text-[#666] text-xs bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full border border-[#222] animate-pulse">
            Clique em um predio para ver detalhes
          </p>
        </div>
      )}

      <OfficeSidebar office={selectedOffice} onClose={() => setSelectedOffice(null)} allOffices={offices} />

      {/* Ghost Building CTA */}
      <a
        href="/register"
        className="fixed bottom-[70px] right-5 z-20 flex items-center gap-3 px-4 py-3 bg-black/70 border border-white/[0.08] backdrop-blur-sm rounded-lg hover:bg-black/80 hover:border-white/[0.15] transition-all group"
      >
        {/* Building silhouette icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="28"
          viewBox="0 0 24 28"
          fill="none"
          className="opacity-30 group-hover:opacity-50 transition-opacity"
        >
          <rect x="4" y="6" width="16" height="22" rx="1" fill="white" fillOpacity="0.15" stroke="white" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="3 2" />
          <rect x="7" y="10" width="3" height="3" rx="0.5" fill="white" fillOpacity="0.1" />
          <rect x="14" y="10" width="3" height="3" rx="0.5" fill="white" fillOpacity="0.1" />
          <rect x="7" y="16" width="3" height="3" rx="0.5" fill="white" fillOpacity="0.1" />
          <rect x="14" y="16" width="3" height="3" rx="0.5" fill="white" fillOpacity="0.1" />
          <rect x="10" y="22" width="4" height="6" rx="0.5" fill="white" fillOpacity="0.1" />
        </svg>
        <span className="text-[#666] text-xs group-hover:text-[#999] transition-colors leading-snug">
          Seu escritório<br />poderia estar aqui
        </span>
      </a>

      <SocialProofCounter
        total={offices.length}
        verified={offices.filter((f) => f.verified).length}
      />

      <GuidedTour />

    </main>
  );
}
