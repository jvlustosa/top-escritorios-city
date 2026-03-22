'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { mockOffices, rankOffices, RankedOffice } from '@/data/mock-offices';
import OfficeSidebar from '@/components/OfficeSidebar';
import MobileCardGrid from '@/components/MobileCardGrid';
import SocialProofCounter from '@/components/SocialProofCounter';

function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function DesktopMapNotice() {
  return (
    <div className="px-4 pt-2 pb-1 shrink-0">
      <div className="flex items-start gap-3 rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-3">
        <MonitorIcon className="w-9 h-9 text-[#5c5c5c] shrink-0 mt-0.5" />
        <div>
          <p className="text-white text-xs font-medium tracking-wide">Mapa em 3D — só no computador</p>
          <p className="text-[#666] text-[11px] leading-snug mt-1">
            Abra esta página no desktop para explorar a cidade interativa. Abaixo você navega a lista no celular.
          </p>
        </div>
      </div>
    </div>
  );
}

function CityLoadingScreen({ isReady }: { isReady: boolean }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fake progress: fast to ~85%, then slow drip
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) { clearInterval(intervalRef.current!); return 85; }
        return prev + 3;
      });
    }, 50);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // When actually ready: rapidly fill to 100% then fade out
  useEffect(() => {
    if (!isReady) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Animate from current progress to 100 fast
    const rush = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(rush);
          return 100;
        }
        return Math.min(prev + 8, 100);
      });
    }, 20);

    // Fade out after reaching 100%
    const fadeTimer = setTimeout(() => setVisible(false), 400);

    return () => { clearInterval(rush); clearTimeout(fadeTimer); };
  }, [isReady]);

  if (!visible) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden"
      style={{
        opacity: isReady && progress >= 100 ? 0 : 1,
        transition: 'opacity 0.3s ease-out',
        pointerEvents: isReady ? 'none' : 'auto',
      }}
    >
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
          className="h-full bg-white/60 rounded-full transition-all duration-150 ease-out"
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
  const router = useRouter();
  const [offices] = useState<RankedOffice[]>(() => rankOffices(mockOffices));
  const [selectedOffice, setSelectedOffice] = useState<RankedOffice | null>(null);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [timeMode, setTimeMode] = useState<'auto' | 'day' | 'night'>('auto');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [showHelicopterModal, setShowHelicopterModal] = useState(false);
  const handleSceneReady = useCallback(() => setSceneReady(true), []);

  // Redirect first-time visitors to onboarding page
  useEffect(() => {
    try {
      const done = localStorage.getItem('tour_completed');
      if (!done) {
        router.replace('/onboarding');
      }
    } catch {
      // localStorage unavailable
    }
  }, [router]);

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

      {/* Header — minimal floating elements */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none">
        <div className="flex items-start justify-between">
          <div className="pointer-events-auto flex items-center gap-3">
            <h1 className="text-white text-base font-semibold tracking-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
              top<span className="text-[#999]">.escritorio</span><span className="text-[#ccc]">.ai</span>
            </h1>
            <a
              href="https://chatjuridico.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-black/40 backdrop-blur-sm border border-white/[0.1] rounded-full hover:bg-black/60 transition-all group"
            >
              <img src="/brands/chat-juridico-icon-white.svg" alt="" className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity" />
              <span className="text-[9px] text-[#aaa] group-hover:text-white transition-colors tracking-wide uppercase">
                por <span className="text-white/80 group-hover:text-white font-medium">ChatJuridico</span>
              </span>
            </a>
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="flex items-center bg-black/40 backdrop-blur-sm border border-white/[0.1] rounded overflow-hidden">
              {(['auto', 'day', 'night'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTimeMode(mode)}
                  className={`px-2 py-1.5 transition-colors ${
                    timeMode === mode
                      ? 'bg-white/[0.15] text-white'
                      : 'text-[#888] hover:text-[#ccc] hover:bg-white/[0.05]'
                  }`}
                  title={mode === 'auto' ? 'Automático' : mode === 'day' ? 'Dia' : 'Noite'}
                >
                  {mode === 'auto' ? (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                  ) : mode === 'day' ? (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            <a
              href="/register"
              className="px-3 py-1.5 bg-white text-black text-[11px] font-medium rounded hover:bg-[#e0e0e0] transition-colors"
            >
              Registrar
            </a>
          </div>
        </div>
      </div>

      {isMobile === null ? (
        // Initial render — matches server output, avoids hydration mismatch
        <CityLoadingScreen isReady={false} />
      ) : isMobile ? (
        <div className="pt-20 h-full overflow-y-auto flex flex-col">
          <DesktopMapNotice />
          <div className="flex-1 min-h-0">
            <MobileCardGrid offices={offices} onSelectOffice={handleSelectOffice} />
          </div>
        </div>
      ) : (
        <>
          <CityLoadingScreen isReady={sceneReady} />
          <CityScene offices={offices} onSelectOffice={handleSelectOffice} onHelicopterClick={() => setShowHelicopterModal(true)} timeOverride={timeMode} onReady={handleSceneReady} />
        </>
      )}

      {/* Hint — fades after first click */}
      {isMobile === false && !hasInteracted && !selectedOffice && (
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

      {/* ─── Adv10x / G10 Helicopter Modal ─── */}
      {showHelicopterModal && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowHelicopterModal(false)}
        >
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div
            className="relative w-full max-w-lg mx-4 bg-gradient-to-b from-[#0e1117] to-[#0a0a0a] border border-[#1e2a3a] rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Accent top bar */}
            <div className="h-1 bg-gradient-to-r from-[#7BA7C9] via-[#5b8fb9] to-[#7BA7C9]" />

            <div className="p-8">
              {/* Close */}
              <button
                onClick={() => setShowHelicopterModal(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-[#666] hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Fechar"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>

              {/* Logo area */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-[#7BA7C9]/10 border border-[#7BA7C9]/20 flex items-center justify-center">
                  <span className="text-[#7BA7C9] font-bold text-lg tracking-tight">G10</span>
                </div>
                <div>
                  <h2 className="text-white text-xl font-bold tracking-tight">Advogado 10x</h2>
                  <p className="text-[#7BA7C9] text-sm font-medium">by G10 Advogados</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-[#999] text-sm leading-relaxed mb-6">
                O programa <span className="text-white font-medium">Advogado 10x</span> transforma a prática jurídica com tecnologia de ponta,
                inteligência artificial e automação. Multiplique sua produtividade por 10 e entregue resultados
                extraordinários para seus clientes.
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { icon: '⚡', title: 'IA Jurídica', desc: 'Pesquisa e análise automatizada' },
                  { icon: '📊', title: 'Dashboard', desc: 'Métricas e KPIs em tempo real' },
                  { icon: '🤖', title: 'Automação', desc: 'Petições e documentos inteligentes' },
                  { icon: '🏆', title: 'Mentoria', desc: 'Acesso a advogados de elite' },
                ].map((f) => (
                  <div key={f.title} className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <div className="text-lg mb-1">{f.icon}</div>
                    <div className="text-white text-xs font-semibold mb-0.5">{f.title}</div>
                    <div className="text-[#666] text-[11px]">{f.desc}</div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex gap-3">
                <a
                  href="https://g10advogados.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-[#7BA7C9] hover:bg-[#8fb8d6] text-black text-sm font-semibold text-center rounded-lg transition-colors"
                >
                  Conhecer o G10
                </a>
                <a
                  href="https://instagram.com/g10advogado10x"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-medium text-center rounded-lg border border-white/[0.08] transition-colors"
                >
                  Seguir @advogado10x
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
