'use client';

import { useState, FormEvent, useEffect, useCallback } from 'react';
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

/* ─── Completion indicator dot ─────────────────────────────────────────────── */

function FieldCheck({ done }: { done: boolean }) {
  return (
    <div
      className="absolute right-4 top-1/2 -translate-y-1/2"
      style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: done ? '#fff' : 'transparent',
        border: done ? 'none' : '1px solid #333',
        transition: 'all 0.3s ease',
      }}
    />
  );
}

/* ─── Building preview with skyline context ─────────────────────────────── */

function BuildingPreview({
  name,
  hasOab,
  hasEmail,
  step,
}: {
  name: string;
  hasOab: boolean;
  hasEmail: boolean;
  step: 1 | 2;
}) {
  const hasName = name.trim().length > 0;
  const allDone = hasName && hasOab && hasEmail;

  return (
    <div className="flex flex-col items-center justify-end h-full min-h-[420px] relative overflow-hidden">
      {/* Background skyline silhouette — contextual neighboring buildings */}
      <div className="absolute bottom-[52px] left-0 right-0 flex items-end justify-center gap-[3px] opacity-[0.08]">
        {[28, 55, 40, 72, 35, 90, 45, 60, 38, 50, 30, 65, 42].map((h, i) => (
          <div
            key={i}
            style={{
              width: i === 5 ? 0 : Math.max(8, 14 - Math.abs(i - 6)),
              height: i === 5 ? 0 : h,
              backgroundColor: '#fff',
            }}
          />
        ))}
      </div>

      {/* Main building — centered, larger, more detailed */}
      <div
        className="relative z-10 flex flex-col items-center"
        style={{
          transform: step === 2 ? 'scale(0.85) translateY(8px)' : 'scale(1)',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Antenna — appears when all fields complete */}
        <div
          style={{
            width: 2,
            height: allDone ? 18 : 0,
            backgroundColor: '#555',
            transition: 'height 0.4s ease',
            marginBottom: allDone ? 0 : 0,
          }}
        />
        <div
          style={{
            width: allDone ? 6 : 0,
            height: allDone ? 6 : 0,
            borderRadius: '50%',
            backgroundColor: '#888',
            marginBottom: 2,
            transition: 'all 0.3s ease 0.2s',
          }}
        />

        {/* Roof spire */}
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: `${hasName ? 12 : 8}px solid transparent`,
            borderRight: `${hasName ? 12 : 8}px solid transparent`,
            borderBottom: `${hasName ? 16 : 8}px solid ${hasName ? '#2a2a2a' : '#1a1a1a'}`,
            transition: 'all 0.5s ease',
          }}
        />

        {/* Upper section — narrower tower */}
        <div
          style={{
            width: hasName ? 56 : 40,
            overflow: 'hidden',
            maxHeight: hasName ? 50 : 0,
            opacity: hasName ? 1 : 0,
            backgroundColor: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderTop: 'none',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'repeat(3, 1fr)',
            gap: 2,
            padding: 4,
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                backgroundColor: hasOab
                  ? (i % 3 === 0 ? '#4a4a3a' : '#2a2a2a')
                  : '#1a1a1a',
                boxShadow: hasOab && i % 3 === 0
                  ? 'inset 0 0 4px rgba(255, 232, 180, 0.15)'
                  : 'none',
                width: '100%',
                height: '100%',
                transition: 'all 0.4s ease',
                transitionDelay: `${i * 40}ms`,
              }}
            />
          ))}
        </div>

        {/* Main body — wider base */}
        <div
          style={{
            width: hasName ? 80 : 52,
            overflow: 'hidden',
            maxHeight: hasName ? 120 : 20,
            backgroundColor: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderTop: hasName ? 'none' : '1px solid #2a2a2a',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: hasName ? 'repeat(6, 1fr)' : 'repeat(1, 1fr)',
            gap: 3,
            padding: hasName ? 6 : 4,
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {Array.from({ length: hasName ? 24 : 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                backgroundColor: hasOab
                  ? (i % 5 === 0 || i % 7 === 0 ? '#4a4a3a' : '#2a2a2a')
                  : '#1a1a1a',
                boxShadow: hasOab && (i % 5 === 0 || i % 7 === 0)
                  ? 'inset 0 0 6px rgba(255, 232, 180, 0.2)'
                  : 'none',
                width: '100%',
                height: '100%',
                minHeight: 8,
                transition: 'all 0.4s ease',
                transitionDelay: `${(i + 12) * 35}ms`,
              }}
            />
          ))}
        </div>

        {/* Lobby / entrance */}
        <div
          style={{
            width: hasName ? 88 : 60,
            height: 20,
            backgroundColor: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderTop: 'none',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.5s ease',
          }}
        >
          {/* Entrance glow */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 0,
              transform: 'translateX(-50%)',
              width: 28,
              height: 18,
              backgroundColor: hasEmail ? '#b8960010' : 'transparent',
              boxShadow: hasEmail
                ? '0 0 16px 6px rgba(184, 150, 0, 0.2), 0 0 32px 12px rgba(184, 150, 0, 0.08)'
                : 'none',
              borderTop: hasEmail ? '1px solid #b8960030' : '1px solid transparent',
              transition: 'all 0.6s ease',
            }}
          />
          {/* Door */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 0,
              transform: 'translateX(-50%)',
              width: 10,
              height: 14,
              backgroundColor: hasEmail ? '#2a2200' : '#151515',
              border: '1px solid #333',
              borderBottom: 'none',
              transition: 'all 0.4s ease',
            }}
          />
        </div>

        {/* Foundation / sidewalk */}
        <div
          style={{
            width: hasName ? 100 : 72,
            height: 4,
            backgroundColor: '#2a2a2a',
            transition: 'all 0.5s ease',
          }}
        />
      </div>

      {/* Ground line */}
      <div className="w-full h-[1px] bg-[#1a1a1a] relative z-10" />

      {/* Ground reflection */}
      <div
        className="relative z-10"
        style={{
          width: hasName ? 80 : 52,
          height: allDone ? 24 : 12,
          background: 'linear-gradient(to bottom, rgba(26,26,26,0.4), transparent)',
          transition: 'all 0.5s ease',
        }}
      />

      {/* Name label */}
      <div className="relative z-10 mt-2 mb-1">
        <p
          className="text-white text-[11px] font-medium text-center tracking-wide"
          style={{
            maxWidth: 200,
            opacity: hasName ? 1 : 0.2,
            transition: 'opacity 0.3s ease',
          }}
        >
          {hasName ? name : 'Seu escritório'}
        </p>
      </div>

      {/* Status / caption */}
      <p className="relative z-10 text-[#444] text-[10px] text-center mb-6 tracking-wide">
        {step === 2
          ? 'Criado — Tier 1'
          : allDone
            ? 'Pronto para criar'
            : 'Preencha para construir'}
      </p>
    </div>
  );
}

/* ─── Step indicator ─────────────────────────────────────────────────────── */

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <p className="text-[#555] text-xs uppercase tracking-widest">
          Passo {step} de 2
        </p>
        <span className="text-[#333] text-xs">
          {step === 1 ? 'Dados essenciais' : 'Personalização'}
        </span>
      </div>
      <div className="flex gap-1">
        <div className="h-[2px] flex-1 bg-white transition-colors duration-300" />
        <div
          className="h-[2px] flex-1 transition-colors duration-300"
          style={{ backgroundColor: step === 2 ? '#fff' : '#222' }}
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
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="w-12 h-12 border border-white flex items-center justify-center mb-6">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <rect x="3" y="11" width="18" height="11" rx="0" />
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
    'w-full px-4 py-3 bg-[#0a0a0a] border border-[#222] text-white text-sm focus:outline-none focus:border-[#444] transition-colors placeholder-[#444]';

  return (
    <main className="min-h-screen bg-black">
      {/* Nav */}
      <nav className="border-b border-[#222] px-6 py-4">
        <a href="/" className="text-white text-lg font-semibold tracking-tight">
          top<span className="text-[#555]">.escritorio</span><span className="text-[#888]">.ai</span>
        </a>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:gap-12 lg:gap-20">
          {/* Building preview — sticky right column on desktop */}
          <div
            className="md:order-2 md:w-[300px] lg:w-[340px] md:flex-shrink-0 border border-[#1a1a1a] bg-[#080808] mb-8 md:mb-0 md:sticky md:top-8 md:self-start"
            style={{ minHeight: 420 }}
          >
            <BuildingPreview
              name={officeName}
              hasOab={detectedState !== null}
              hasEmail={emailValue.includes('@') && emailValue.includes('.')}
              step={step}
            />
          </div>

          {/* Form column */}
          <div className="flex-1 md:order-1 max-w-lg">
            {/* Success transition overlay */}
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
                    <h1 className="text-white text-3xl font-semibold tracking-tight">
                      Crie seu escritório
                    </h1>
                    <p className="text-[#555] text-sm mt-2 leading-relaxed">
                      Preencha os dados essenciais. Seu prédio aparece na cidade
                      imediatamente.
                    </p>

                    <form onSubmit={handleStep1Submit} className="mt-8 space-y-6">
                      <div className="relative">
                        <label className="block text-[#555] text-xs uppercase tracking-widest mb-2">
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
                        <label className="block text-[#555] text-xs uppercase tracking-widest mb-2">
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
                          <p className="mt-1.5 text-[#555] text-xs">
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
                        <label className="block text-[#555] text-xs uppercase tracking-widest mb-2">
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
                        <p className="text-red-400 text-sm">{error}</p>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3.5 bg-white text-black text-sm font-medium hover:bg-[#e0e0e0] transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Criando...' : 'Criar meu escritório'}
                      </button>

                      <p className="text-[#333] text-[10px] text-center">
                        Ao criar, você concorda com os termos de uso
                      </p>
                    </form>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h1 className="text-white text-3xl font-semibold tracking-tight">
                      Destaque seu prédio
                    </h1>
                    <p className="text-[#555] text-sm mt-2 leading-relaxed">
                      Adicione suas redes para que outros escritórios encontrem você.
                    </p>

                    <form onSubmit={handleStep2Submit} className="mt-8 space-y-5">
                      {/* ── Áreas de atuação — multi-select gallery ── */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[#555] text-xs uppercase tracking-widest">
                            Áreas de atuação
                          </p>
                          <span className="text-[#333] text-[10px]">
                            {selectedAreas.length}/4 selecionadas
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {PRACTICE_AREAS.map((area) => {
                            const selected = selectedAreas.includes(area.id);
                            return (
                              <button
                                key={area.id}
                                type="button"
                                onClick={() => toggleArea(area.id)}
                                className={`flex flex-col items-center gap-2 p-3 border transition-all ${
                                  selected
                                    ? 'border-white/30 bg-white/[0.06] text-white'
                                    : 'border-[#1a1a1a] bg-[#080808] text-[#555] hover:border-[#333] hover:text-[#888]'
                                }`}
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
                                  className={selected ? 'text-white' : 'text-[#444]'}
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

                      {/* ── Endereço ── */}
                      <div>
                        <label className="block text-[#555] text-xs uppercase tracking-widest mb-2">
                          Endereço do escritório
                        </label>
                        <input
                          type="text"
                          className={inputClass}
                          placeholder="Av. Paulista, 1000 - Bela Vista, São Paulo"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                        <p className="text-[#333] text-[10px] mt-1.5">
                          Aparecerá no mapa do seu perfil
                        </p>
                      </div>

                      {/* Logo card — locked */}
                      <div className="border border-[#1a1a1a] bg-[#080808] p-5 opacity-60">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 border border-[#222] flex items-center justify-center text-[#444]">
                            <LockIcon />
                          </div>
                          <div className="flex-1">
                            <p className="text-[#888] text-sm font-medium">Logo no prédio</p>
                            <p className="text-[#333] text-xs mt-0.5">
                              Desbloqueie com Asaas Tier 2+
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Instagram card */}
                      <div className="border border-[#222] bg-[#0a0a0a] p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-9 h-9 border border-[#222] flex items-center justify-center text-[#888]">
                            <InstagramIcon />
                          </div>
                          <p className="text-white text-sm font-medium">Instagram</p>
                        </div>
                        <input
                          type="url"
                          className={inputClass}
                          placeholder="https://instagram.com/seu-escritorio"
                          value={instagram}
                          onChange={(e) => setInstagram(e.target.value)}
                        />
                      </div>

                      {/* LinkedIn card */}
                      <div className="border border-[#222] bg-[#0a0a0a] p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-9 h-9 border border-[#222] flex items-center justify-center text-[#888]">
                            <LinkedInIcon />
                          </div>
                          <p className="text-white text-sm font-medium">LinkedIn</p>
                        </div>
                        <input
                          type="url"
                          className={inputClass}
                          placeholder="https://linkedin.com/company/seu-escritorio"
                          value={linkedin}
                          onChange={(e) => setLinkedin(e.target.value)}
                        />
                      </div>

                      {/* Asaas upsell hint */}
                      <div className="border border-[#1a1a1a] bg-[#080808] p-5 mt-2">
                        <p className="text-[#555] text-xs leading-relaxed">
                          Conecte sua conta{' '}
                          <span className="text-[#888]">Asaas</span>{' '}
                          para verificar faturamento, subir no ranking e desbloquear
                          logo no prédio.
                        </p>
                      </div>

                      {error && (
                        <p className="text-red-400 text-sm mt-2">{error}</p>
                      )}

                      <div className="pt-2 space-y-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full px-6 py-3.5 bg-white text-black text-sm font-medium hover:bg-[#e0e0e0] transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Salvando...' : 'Salvar e ver meu prédio'}
                        </button>

                        <button
                          type="button"
                          onClick={handleSkip}
                          className="w-full px-6 py-2.5 text-[#555] text-xs hover:text-[#888] transition-colors"
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
