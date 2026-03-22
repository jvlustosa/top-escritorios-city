'use client';

import { useState, FormEvent, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PRACTICE_AREAS } from '@/data/practice-areas';

const stateCapitals: Record<string, string> = {
  AC: 'Rio Branco', AL: 'Maceió', AP: 'Macapá', AM: 'Manaus',
  BA: 'Salvador', CE: 'Fortaleza', DF: 'Brasília', ES: 'Vitória',
  GO: 'Goiânia', MA: 'São Luís', MT: 'Cuiabá', MS: 'Campo Grande',
  MG: 'Belo Horizonte', PA: 'Belém', PB: 'João Pessoa', PR: 'Curitiba',
  PE: 'Recife', PI: 'Teresina', RJ: 'Rio de Janeiro', RN: 'Natal',
  RS: 'Porto Alegre', RO: 'Porto Velho', RR: 'Boa Vista', SC: 'Florianópolis',
  SP: 'São Paulo', SE: 'Aracaju', TO: 'Palmas',
};

function parseOabState(oab: string): string | null {
  const match = oab.trim().match(/\/([A-Za-z]{2})$/);
  if (!match) return null;
  return match[1].toUpperCase();
}

/* ─── Completion indicator ─────────────────────────────────────────────── */

function FieldCheck({ done }: { done: boolean }) {
  return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
      <div
        className="transition-all duration-300"
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          backgroundColor: done ? 'rgba(255,255,255,0.08)' : 'transparent',
          border: done ? '1.5px solid rgba(255,255,255,0.3)' : '1.5px solid #282828',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {done && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
    </div>
  );
}

/* ─── Building preview with enhanced visualization ─────────────────────── */

function BuildingPreview({
  name,
  hasOab,
  hasEmail,
  step,
  practiceAreas,
  hasInstagram,
  hasLinkedin,
  hasAddress,
}: {
  name: string;
  hasOab: boolean;
  hasEmail: boolean;
  step: 1 | 2;
  practiceAreas: number;
  hasInstagram: boolean;
  hasLinkedin: boolean;
  hasAddress: boolean;
}) {
  const hasName = name.trim().length > 0;
  const allStep1 = hasName && hasOab && hasEmail;
  const completionLevel = [hasName, hasOab, hasEmail].filter(Boolean).length;

  // Building dimensions react to completion
  const bodyWidth = hasName ? 72 + completionLevel * 6 : 44;
  const towerWidth = hasName ? bodyWidth * 0.65 : 32;
  const bodyHeight = hasName ? 90 + completionLevel * 15 : 24;
  const towerHeight = hasName ? 40 + completionLevel * 8 : 0;

  // Step 2 enrichment — more windows light up, decorations appear
  const step2Enrichment = step === 2;
  const socialCount = [hasInstagram, hasLinkedin].filter(Boolean).length;

  // Window lit probability
  const litChance = hasOab ? (step2Enrichment ? 0.55 + socialCount * 0.1 : 0.35) : 0;

  // Deterministic "random" for window lighting
  const windowLit = useCallback((i: number) => {
    const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return (x - Math.floor(x)) < litChance;
  }, [litChance]);

  // Stars in the background
  const stars = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      x: (Math.sin(i * 73.1 + 17.3) * 43758.5453 % 1) * 100,
      y: (Math.sin(i * 127.7 + 89.1) * 43758.5453 % 1) * 60,
      size: 1 + (i % 3) * 0.5,
      opacity: 0.15 + (i % 4) * 0.08,
    })), []);

  return (
    <div className="flex flex-col items-center justify-end h-full relative overflow-hidden"
      style={{ minHeight: 460, background: 'linear-gradient(to bottom, #050510 0%, #0a0a0f 40%, #0a0a0a 100%)' }}
    >
      {/* Stars */}
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            backgroundColor: '#fff',
            opacity: allStep1 ? s.opacity : s.opacity * 0.4,
            transition: 'opacity 1s ease',
          }}
        />
      ))}

      {/* Background skyline */}
      <div className="absolute bottom-[52px] left-0 right-0 flex items-end justify-center gap-[2px]"
        style={{ opacity: hasName ? 0.06 : 0.03, transition: 'opacity 0.6s ease' }}
      >
        {[22, 48, 34, 62, 28, 0, 38, 56, 30, 44, 26, 52, 36, 20, 42].map((h, i) => (
          <div
            key={i}
            style={{
              width: i === 5 ? 0 : Math.max(5, 11 - Math.abs(i - 7)),
              height: i === 5 ? 0 : h,
              backgroundColor: '#fff',
              transition: 'height 0.6s ease',
            }}
          />
        ))}
      </div>

      {/* Main building */}
      <div
        className="relative z-10 flex flex-col items-center"
        style={{
          transform: step2Enrichment ? 'scale(0.82) translateY(6px)' : 'scale(1)',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Antenna */}
        <div className="flex flex-col items-center">
          <div
            style={{
              width: 1.5,
              height: allStep1 ? 22 : 0,
              backgroundColor: '#666',
              transition: 'height 0.5s ease',
            }}
          />
          <div
            style={{
              width: allStep1 ? 5 : 0,
              height: allStep1 ? 5 : 0,
              borderRadius: '50%',
              backgroundColor: allStep1 ? '#c44' : 'transparent',
              boxShadow: allStep1 ? '0 0 6px 2px rgba(204,68,68,0.4)' : 'none',
              marginBottom: 1,
              transition: 'all 0.4s ease 0.3s',
            }}
          />
        </div>

        {/* Roof spire */}
        <div style={{
          width: 0,
          height: 0,
          borderLeft: `${hasName ? 10 : 6}px solid transparent`,
          borderRight: `${hasName ? 10 : 6}px solid transparent`,
          borderBottom: `${hasName ? 14 : 6}px solid ${hasName ? '#1e1e22' : '#141418'}`,
          transition: 'all 0.5s ease',
        }} />

        {/* Upper tower section */}
        <div style={{
          width: towerWidth,
          maxHeight: towerHeight,
          overflow: 'hidden',
          backgroundColor: '#111116',
          borderLeft: '1px solid #1e1e24',
          borderRight: '1px solid #1e1e24',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2,
          padding: hasName ? '3px 4px' : 0,
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          {Array.from({ length: 12 }).map((_, i) => {
            const lit = windowLit(i);
            return (
              <div
                key={i}
                style={{
                  backgroundColor: lit ? '#3d3a28' : '#151518',
                  boxShadow: lit ? '0 0 4px rgba(255,232,160,0.12)' : 'none',
                  width: '100%',
                  height: 8,
                  transition: 'all 0.4s ease',
                  transitionDelay: `${i * 30}ms`,
                }}
              />
            );
          })}
        </div>

        {/* Main body */}
        <div style={{
          width: bodyWidth,
          maxHeight: bodyHeight,
          overflow: 'hidden',
          backgroundColor: '#111116',
          borderLeft: '1px solid #1e1e24',
          borderRight: '1px solid #1e1e24',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 3,
          padding: hasName ? '4px 5px' : '3px',
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          {Array.from({ length: hasName ? 28 : 4 }).map((_, i) => {
            const lit = windowLit(i + 20);
            return (
              <div
                key={i}
                style={{
                  backgroundColor: lit ? '#3d3a28' : '#151518',
                  boxShadow: lit ? '0 0 5px rgba(255,232,160,0.15)' : 'none',
                  width: '100%',
                  height: 9,
                  transition: 'all 0.4s ease',
                  transitionDelay: `${(i + 12) * 25}ms`,
                }}
              />
            );
          })}
        </div>

        {/* Lobby entrance */}
        <div style={{
          width: bodyWidth + 8,
          height: 22,
          backgroundColor: '#111116',
          borderLeft: '1px solid #1e1e24',
          borderRight: '1px solid #1e1e24',
          borderBottom: '1px solid #1e1e24',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.5s ease',
        }}>
          {/* Entrance warm glow */}
          <div style={{
            position: 'absolute',
            left: '50%',
            bottom: 0,
            transform: 'translateX(-50%)',
            width: 32,
            height: 20,
            backgroundColor: hasEmail ? 'rgba(200,170,60,0.04)' : 'transparent',
            boxShadow: hasEmail
              ? '0 0 20px 8px rgba(200,170,60,0.12), 0 0 40px 16px rgba(200,170,60,0.04)'
              : 'none',
            transition: 'all 0.6s ease',
          }} />
          {/* Door */}
          <div style={{
            position: 'absolute',
            left: '50%',
            bottom: 0,
            transform: 'translateX(-50%)',
            width: 10,
            height: 15,
            backgroundColor: hasEmail ? '#1a1800' : '#0d0d10',
            border: '1px solid #252528',
            borderBottom: 'none',
            transition: 'all 0.4s ease',
          }} />
        </div>

        {/* Foundation */}
        <div style={{
          width: bodyWidth + 20,
          height: 3,
          backgroundColor: '#1e1e22',
          transition: 'all 0.5s ease',
        }} />
      </div>

      {/* Ground plane */}
      <div className="w-full relative z-10">
        <div className="w-full h-px bg-[#1a1a1e]" />
        {/* Ground reflection */}
        <div
          className="mx-auto"
          style={{
            width: bodyWidth,
            height: allStep1 ? 28 : 14,
            background: 'linear-gradient(to bottom, rgba(17,17,22,0.5), transparent)',
            transition: 'all 0.5s ease',
          }}
        />
      </div>

      {/* Name label */}
      <div className="relative z-10 mt-1 px-4">
        <p
          className="text-center font-medium tracking-wide truncate"
          style={{
            maxWidth: 220,
            fontSize: 11,
            color: hasName ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.15)',
            transition: 'color 0.3s ease',
          }}
        >
          {hasName ? name : 'Seu escritório'}
        </p>
      </div>

      {/* Status caption */}
      <p className="relative z-10 text-[10px] text-center mb-5 mt-1 tracking-wider"
        style={{ color: allStep1 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)' }}
      >
        {step === 2
          ? `Tier 1 · ${practiceAreas > 0 ? `${practiceAreas} área${practiceAreas > 1 ? 's' : ''}` : 'Personalizar'}`
          : allStep1
            ? 'Pronto para criar'
            : `${completionLevel}/3 campos`}
      </p>

      {/* Step 2 decoration badges */}
      {step2Enrichment && (hasInstagram || hasLinkedin || hasAddress) && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3 z-20">
          {hasInstagram && (
            <div className="w-5 h-5 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" />
              </svg>
            </div>
          )}
          {hasLinkedin && (
            <div className="w-5 h-5 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="2" />
              </svg>
            </div>
          )}
          {hasAddress && (
            <div className="w-5 h-5 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
                <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" />
              </svg>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Step indicator ─────────────────────────────────────────────────────── */

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-semibold rounded-full"
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            {step}
          </span>
          <p className="text-[#666] text-xs uppercase tracking-widest">
            Passo {step} de 2
          </p>
        </div>
        <span className="text-[#444] text-xs">
          {step === 1 ? 'Dados essenciais' : 'Personalização'}
        </span>
      </div>
      <div className="flex gap-1.5">
        <div className="h-[2px] flex-1 rounded-full bg-white/80 transition-colors duration-300" />
        <div
          className="h-[2px] flex-1 rounded-full transition-colors duration-300"
          style={{ backgroundColor: step === 2 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.06)' }}
        />
      </div>
    </div>
  );
}

/* ─── Success transition ─────────────────────────────────────────────────── */

function SuccessTransition({ name, onComplete }: { name: string; onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div
        className="w-14 h-14 flex items-center justify-center mb-6 rounded-full"
        style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          border: '1.5px solid rgba(255,255,255,0.15)',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 className="text-white text-xl font-semibold tracking-tight">
        Prédio criado
      </h2>
      <p className="text-[#555] text-sm mt-2">
        {name} está na cidade
      </p>
    </div>
  );
}

/* ─── Icon components ────────────────────────────────────────────────────── */

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="18" cy="6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <line x1="8" y1="11" x2="8" y2="16" />
      <line x1="8" y1="8" x2="8" y2="8.01" strokeWidth="2" />
      <path d="M12 16v-5c0-1 1-2 2-2s2 1 2 2v5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTransition, setShowTransition] = useState(false);

  // Step 1 fields
  const [officeName, setOfficeName] = useState('');
  const [oabValue, setOabValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [detectedState, setDetectedState] = useState<string | null>(null);

  // Step 2 fields
  const [slug, setSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [address, setAddress] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  function toggleArea(id: string) {
    setSelectedAreas((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  }

  useEffect(() => {
    const state = parseOabState(oabValue);
    setDetectedState(state);
  }, [oabValue]);

  async function handleStep1Submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = {
      name: officeName,
      oab_number: oabValue,
      email: emailValue,
    };

    try {
      const res = await fetch('/api/offices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const json = await res.json();
        const newSlug = json.office?.slug;
        if (newSlug) {
          setSlug(newSlug);
          setShowTransition(true);
        } else {
          router.push('/');
        }
      } else {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? 'Erro ao registrar. Tente novamente.');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const handleTransitionComplete = useCallback(() => {
    setShowTransition(false);
    setStep(2);
  }, []);

  async function handleStep2Submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data: Record<string, string | string[]> = { slug };
    if (instagram.trim()) data.instagram_url = instagram.trim();
    if (linkedin.trim()) data.linkedin_url = linkedin.trim();
    if (logoUrl.trim()) data.logo_url = logoUrl.trim();
    if (address.trim()) data.address = address.trim();
    if (selectedAreas.length > 0) data.practice_areas = selectedAreas;

    if (Object.keys(data).length <= 1) {
      router.push(`/?new=${slug}`);
      return;
    }

    try {
      const res = await fetch('/api/offices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push(`/?new=${slug}`);
      } else {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? 'Erro ao salvar. Tente novamente.');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function handleSkip() {
    router.push(`/?new=${slug}`);
  }

  const inputClass =
    'w-full px-4 py-3.5 bg-[#0c0c0f] border border-[#1e1e24] rounded-lg text-white text-sm focus:outline-none focus:border-[#3a3a44] focus:bg-[#0e0e12] transition-all duration-200 placeholder-[#3a3a40]';

  return (
    <main className="min-h-screen bg-black">
      {/* Nav */}
      <nav className="border-b border-[#141418] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="/" className="text-white text-lg font-semibold tracking-tight">
            top<span className="text-[#555]">.escritorio</span><span className="text-[#888]">.ai</span>
          </a>
          <a
            href="/"
            className="text-[#444] text-xs hover:text-[#888] transition-colors"
          >
            Voltar ao mapa
          </a>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10 md:py-14">
        <div className="flex flex-col md:flex-row md:gap-10 lg:gap-16">
          {/* Building preview — sticky right column */}
          <div
            className="md:order-2 md:w-[320px] lg:w-[360px] md:flex-shrink-0 rounded-xl overflow-hidden border border-[#141418] mb-8 md:mb-0 md:sticky md:top-6 md:self-start"
          >
            <BuildingPreview
              name={officeName}
              hasOab={detectedState !== null}
              hasEmail={emailValue.includes('@') && emailValue.includes('.')}
              step={step}
              practiceAreas={selectedAreas.length}
              hasInstagram={instagram.trim().length > 0}
              hasLinkedin={linkedin.trim().length > 0}
              hasAddress={address.trim().length > 0}
            />
          </div>

          {/* Form column */}
          <div className="flex-1 md:order-1 max-w-lg">
            {showTransition ? (
              <SuccessTransition
                name={officeName}
                onComplete={handleTransitionComplete}
              />
            ) : (
              <>
                <StepIndicator step={step} />

                {step === 1 && (
                  <>
                    <h1 className="text-white text-3xl font-semibold tracking-tight leading-tight">
                      Crie seu escritório
                    </h1>
                    <p className="text-[#666] text-sm mt-3 leading-relaxed max-w-md">
                      Preencha os dados essenciais. Seu prédio aparece na cidade
                      imediatamente.
                    </p>

                    <form onSubmit={handleStep1Submit} className="mt-10 space-y-7">
                      <div>
                        <label className="block text-[#888] text-xs font-medium uppercase tracking-widest mb-2.5">
                          Nome do escritório
                        </label>
                        <div className="relative">
                          <input
                            name="name"
                            required
                            autoFocus
                            className={inputClass}
                            placeholder="Ex: Silva & Associados"
                            value={officeName}
                            onChange={(e) => setOfficeName(e.target.value)}
                          />
                          <FieldCheck done={officeName.trim().length > 2} />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[#888] text-xs font-medium uppercase tracking-widest mb-2.5">
                          Número OAB
                        </label>
                        <div className="relative">
                          <input
                            name="oab_number"
                            required
                            className={inputClass}
                            placeholder="123456/SP"
                            value={oabValue}
                            onChange={(e) => setOabValue(e.target.value)}
                          />
                          <FieldCheck done={detectedState !== null} />
                        </div>
                        {detectedState && (
                          <p className="mt-2 text-xs flex items-center gap-1.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500/60" />
                            <span className="text-[#888]">
                              {detectedState}
                              {stateCapitals[detectedState]
                                ? ` — ${stateCapitals[detectedState]}`
                                : ''}
                            </span>
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[#888] text-xs font-medium uppercase tracking-widest mb-2.5">
                          Email de contato
                        </label>
                        <div className="relative">
                          <input
                            name="email"
                            type="email"
                            required
                            className={inputClass}
                            placeholder="contato@escritorio.com.br"
                            value={emailValue}
                            onChange={(e) => setEmailValue(e.target.value)}
                          />
                          <FieldCheck done={emailValue.includes('@') && emailValue.includes('.')} />
                        </div>
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/[0.06] border border-red-500/20">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          <p className="text-red-400 text-sm">{error}</p>
                        </div>
                      )}

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full px-6 py-4 bg-white text-black text-sm font-semibold rounded-lg hover:bg-[#e8e8e8] active:bg-[#d8d8d8] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="inline-block w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                              Criando...
                            </span>
                          ) : (
                            'Criar meu escritório'
                          )}
                        </button>
                      </div>

                      <p className="text-[#333] text-[10px] text-center pt-1">
                        Ao criar, você concorda com os termos de uso
                      </p>
                    </form>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h1 className="text-white text-3xl font-semibold tracking-tight leading-tight">
                      Destaque seu prédio
                    </h1>
                    <p className="text-[#666] text-sm mt-3 leading-relaxed max-w-md">
                      Adicione informações para que outros escritórios encontrem você.
                      Tudo aqui é opcional.
                    </p>

                    <form onSubmit={handleStep2Submit} className="mt-10 space-y-7">
                      {/* Practice areas */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-[#888] text-xs font-medium uppercase tracking-widest">
                            Áreas de atuação
                          </label>
                          <span className="text-[#444] text-[10px] tabular-nums">
                            {selectedAreas.length}/4
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {PRACTICE_AREAS.map((area) => {
                            const selected = selectedAreas.includes(area.id);
                            return (
                              <button
                                key={area.id}
                                type="button"
                                onClick={() => toggleArea(area.id)}
                                className="flex flex-col items-center gap-2 p-3.5 rounded-lg border transition-all duration-200"
                                style={{
                                  borderColor: selected ? 'rgba(255,255,255,0.2)' : '#1a1a20',
                                  backgroundColor: selected ? 'rgba(255,255,255,0.04)' : '#0a0a0f',
                                  color: selected ? '#fff' : '#666',
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  style={{ color: selected ? '#fff' : '#444' }}
                                >
                                  <path d={area.icon} />
                                </svg>
                                <span className="text-[10px] leading-tight text-center">
                                  {area.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <label className="block text-[#888] text-xs font-medium uppercase tracking-widest mb-2.5">
                          Endereço do escritório
                        </label>
                        <input
                          type="text"
                          className={inputClass}
                          placeholder="Av. Paulista, 1000 - Bela Vista, São Paulo"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                        <p className="text-[#444] text-[10px] mt-2">
                          Aparecerá no mapa do seu perfil
                        </p>
                      </div>

                      {/* Logo locked card */}
                      <div className="rounded-lg border border-[#1a1a20] bg-[#0a0a0f] p-5 opacity-50">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg border border-[#222] flex items-center justify-center text-[#444]">
                            <LockIcon />
                          </div>
                          <div className="flex-1">
                            <p className="text-[#888] text-sm font-medium">Logo no prédio</p>
                            <p className="text-[#444] text-xs mt-0.5">
                              Desbloqueie com Asaas Tier 2+
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Social links */}
                      <div className="space-y-3">
                        <label className="block text-[#888] text-xs font-medium uppercase tracking-widest">
                          Redes sociais
                        </label>

                        {/* Instagram */}
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]">
                            <InstagramIcon />
                          </div>
                          <input
                            type="url"
                            className={`${inputClass} pl-11`}
                            placeholder="https://instagram.com/seu-escritorio"
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                          />
                        </div>

                        {/* LinkedIn */}
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]">
                            <LinkedInIcon />
                          </div>
                          <input
                            type="url"
                            className={`${inputClass} pl-11`}
                            placeholder="https://linkedin.com/company/seu-escritorio"
                            value={linkedin}
                            onChange={(e) => setLinkedin(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Asaas upsell */}
                      <div className="rounded-lg border border-[#1a1a20] bg-[#0a0a0f] p-5">
                        <p className="text-[#555] text-xs leading-relaxed">
                          Conecte sua conta{' '}
                          <span className="text-[#999] font-medium">Asaas</span>{' '}
                          para verificar faturamento, subir no ranking e desbloquear
                          logo no prédio.
                        </p>
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/[0.06] border border-red-500/20">
                          <p className="text-red-400 text-sm">{error}</p>
                        </div>
                      )}

                      <div className="pt-2 space-y-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full px-6 py-4 bg-white text-black text-sm font-semibold rounded-lg hover:bg-[#e8e8e8] active:bg-[#d8d8d8] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="inline-block w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                              Salvando...
                            </span>
                          ) : (
                            'Salvar e ver meu prédio'
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleSkip}
                          className="w-full px-6 py-3 text-[#555] text-xs hover:text-[#999] transition-colors rounded-lg hover:bg-white/[0.02]"
                        >
                          Pular por agora
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
