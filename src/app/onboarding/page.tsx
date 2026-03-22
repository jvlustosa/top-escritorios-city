'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const TOUR_KEY = 'tour_completed';

interface StepConfig {
  title: string;
  description: string;
  illustration: 'city' | 'building' | 'ranking' | 'register';
}

const steps: StepConfig[] = [
  {
    title: 'Bem-vindo à cidade dos escritórios',
    description:
      'Uma cidade 3D interativa onde cada prédio representa um escritório de advocacia real. Explore, compare e encontre os melhores do Brasil.',
    illustration: 'city',
  },
  {
    title: 'Cada prédio conta uma história',
    description:
      'O tamanho e os detalhes de cada prédio refletem a reputação e o faturamento do escritório. Quanto maior, maior o destaque.',
    illustration: 'building',
  },
  {
    title: 'Suba no ranking',
    description:
      'Escritórios verificados ganham posições melhores, prédios maiores e mais visibilidade. Conecte sua conta Asaas para crescer.',
    illustration: 'ranking',
  },
  {
    title: 'Registre seu escritório',
    description:
      'Crie seu prédio na cidade em menos de 1 minuto. É gratuito e você aparece imediatamente no mapa.',
    illustration: 'register',
  },
];

/* ─── Minimal Illustrations ──────────────────────────────────────────────── */

function CityIllustration() {
  return (
    <div className="flex items-end justify-center gap-1 h-48">
      {[32, 56, 44, 80, 36, 100, 48, 68, 40, 88, 34, 60, 44].map((h, i) => (
        <div
          key={i}
          className="animate-grow-up"
          style={{
            width: i === 5 ? 16 : 10 + (i % 3) * 2,
            height: h,
            backgroundColor: i === 5 ? '#fff' : '#222',
            animationDelay: `${i * 60}ms`,
          }}
        />
      ))}
    </div>
  );
}

function BuildingIllustration() {
  return (
    <div className="flex flex-col items-center justify-end h-48">
      {/* Simple building silhouette */}
      <div className="w-[2px] h-5 bg-[#666]" />
      <div className="w-16 h-20 bg-[#2a2a2a] border border-[#444]" />
      <div className="w-24 h-28 bg-[#2a2a2a] border border-[#444] border-t-0" />
      <div className="w-28 h-1 bg-[#444]" />
    </div>
  );
}

function RankingIllustration() {
  const bars = [
    { label: '3º', h: 48, color: '#666' },
    { label: '1º', h: 96, color: '#fff' },
    { label: '2º', h: 72, color: '#999' },
  ];
  return (
    <div className="flex items-end justify-center gap-4 h-48">
      {bars.map((bar, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <span className="text-sm font-bold" style={{ color: bar.color }}>
            {bar.label}
          </span>
          <div
            className="w-16 animate-grow-up"
            style={{
              height: bar.h,
              backgroundColor: bar.color,
              animationDelay: `${i * 150}ms`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

function RegisterIllustration() {
  return (
    <div className="flex flex-col items-center justify-center h-48">
      <div className="w-56 space-y-3">
        <div className="h-2 w-20 bg-[#333] rounded-full" />
        <div className="h-10 w-full bg-[#111] border border-[#222]" />
        <div className="h-2 w-16 bg-[#333] rounded-full" />
        <div className="h-10 w-full bg-[#111] border border-[#222]" />
        <div className="h-11 w-full bg-white flex items-center justify-center">
          <span className="text-black text-xs font-semibold">
            Criar meu escritório
          </span>
        </div>
      </div>
    </div>
  );
}

function StepIllustration({ type }: { type: StepConfig['illustration'] }) {
  switch (type) {
    case 'city':
      return <CityIllustration />;
    case 'building':
      return <BuildingIllustration />;
    case 'ranking':
      return <RankingIllustration />;
    case 'register':
      return <RegisterIllustration />;
  }
}

/* ─── Main page ───────────────────────────────────────────────────────────── */

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      const done = localStorage.getItem(TOUR_KEY);
      if (done) {
        router.replace('/');
      }
    } catch {
      // localStorage unavailable
    }
  }, [mounted, router]);

  const completeTour = useCallback(() => {
    try {
      localStorage.setItem(TOUR_KEY, '1');
    } catch {
      // ignore
    }
    router.push('/');
  }, [router]);

  const goToRegister = useCallback(() => {
    try {
      localStorage.setItem(TOUR_KEY, '1');
    } catch {
      // ignore
    }
    router.push('/register');
  }, [router]);

  const handleNext = useCallback(() => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      goToRegister();
    }
  }, [step, goToRegister]);

  const handlePrev = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') completeTour();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNext, handlePrev, completeTour]);

  if (!mounted) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <main className="min-h-screen bg-black flex flex-col">
      {/* Nav */}
      <nav className="border-b border-[#111] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <span className="text-white text-base sm:text-lg font-semibold tracking-tight">
          top<span className="text-[#555]">.escritorio</span>
          <span className="text-[#888]">.ai</span>
        </span>
        <button
          onClick={completeTour}
          className="text-[#888] text-xs sm:text-sm hover:text-white transition-colors"
        >
          Pular tour
        </button>
      </nav>

      {/* Content — centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-16">
        <div className="w-full max-w-xl">
          {/* Illustration */}
          <div className="mb-8 sm:mb-12 border border-[#111] bg-[#050505] p-4 sm:p-8 rounded">
            <StepIllustration type={current.illustration} />
          </div>

          {/* Step counter */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-white text-xs font-bold bg-[#222] px-2.5 py-1 rounded-full">
              {step + 1}/{steps.length}
            </span>
            <span className="text-[#777] text-xs uppercase tracking-widest">
              {step === 0 && 'A cidade'}
              {step === 1 && 'Os prédios'}
              {step === 2 && 'O ranking'}
              {step === 3 && 'Seu escritório'}
            </span>
          </div>

          {/* Title */}
          <h1
            key={`title-${step}`}
            className="text-white text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight animate-fade-in leading-tight"
          >
            {current.title}
          </h1>

          {/* Description */}
          <p
            key={`desc-${step}`}
            className="text-[#ccc] text-sm sm:text-base md:text-lg mt-3 sm:mt-4 leading-relaxed animate-fade-in max-w-lg"
          >
            {current.description}
          </p>

          {/* Actions */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3">
            {step > 0 && (
              <button
                onClick={handlePrev}
                className="px-5 sm:px-6 py-3 sm:py-3.5 border border-[#333] text-white text-sm font-medium rounded-lg hover:bg-[#111] transition-colors"
              >
                Voltar
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-8 sm:px-10 py-3 sm:py-3.5 bg-white text-black text-sm font-bold rounded-lg hover:bg-[#e0e0e0] transition-colors"
            >
              {isLast ? 'Registrar meu escritório' : 'Próximo'}
            </button>

            {isLast && (
              <button
                onClick={completeTour}
                className="px-5 sm:px-6 py-3 sm:py-3.5 text-[#888] text-sm hover:text-white transition-colors"
              >
                Só explorar
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="flex gap-1.5 mt-12">
            {steps.map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 transition-all duration-300 cursor-pointer rounded-full"
                style={{
                  backgroundColor: i <= step ? '#fff' : '#1a1a1a',
                }}
                onClick={() => setStep(i)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer attribution */}
      <div className="px-6 py-4 border-t border-[#111]">
        <a
          href="https://chatjuridico.com.br?utm_source=top_escritorio&utm_medium=onboarding&utm_campaign=footer_badge"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/[0.04] border border-white/[0.06] rounded-full hover:bg-white/[0.08] transition-all group"
        >
          <img
            src="/brands/chat-juridico-icon-white.svg"
            alt=""
            className="h-3.5 w-3.5 opacity-40 group-hover:opacity-70 transition-opacity"
          />
          <span className="text-[10px] text-[#555] group-hover:text-[#888] transition-colors tracking-wide uppercase">
            Potencializado por{' '}
            <span className="text-[#777] group-hover:text-white font-medium">
              ChatJuridico
            </span>
          </span>
        </a>
      </div>
    </main>
  );
}
