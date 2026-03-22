'use client';

import { useState, FormEvent, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PRACTICE_AREAS } from '@/data/practice-areas';
import { createClient } from '@/utils/supabase/client';

const stateCapitals: Record<string, string> = {
  AC: 'Rio Branco', AL: 'Maceió', AP: 'Macapá', AM: 'Manaus',
  BA: 'Salvador', CE: 'Fortaleza', DF: 'Brasília', ES: 'Vitória',
  GO: 'Goiânia', MA: 'São Luís', MT: 'Cuiabá', MS: 'Campo Grande',
  MG: 'Belo Horizonte', PA: 'Belém', PB: 'João Pessoa', PR: 'Curitiba',
  PE: 'Recife', PI: 'Teresina', RJ: 'Rio de Janeiro', RN: 'Natal',
  RS: 'Porto Alegre', RO: 'Porto Velho', RR: 'Boa Vista', SC: 'Florianópolis',
  SP: 'São Paulo', SE: 'Aracaju', TO: 'Palmas',
};

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

  // Gradual growth: each field adds to the building dimensions smoothly
  const nameLength = Math.min(name.trim().length, 20);
  const nameProgress = hasName ? Math.min(nameLength / 8, 1) : 0; // grows as you type
  const oabProgress = hasOab ? 1 : 0;
  const emailProgress = hasEmail ? 1 : 0;
  const totalProgress = nameProgress * 0.4 + oabProgress * 0.3 + emailProgress * 0.3;

  const bodyWidth = 44 + totalProgress * 50;
  const towerWidth = 32 + totalProgress * 28;
  const bodyHeight = 24 + totalProgress * 111;
  const towerHeight = totalProgress * 64;

  const step2Enrichment = step === 2;
  const socialCount = [hasInstagram, hasLinkedin].filter(Boolean).length;
  const litChance = hasOab ? (step2Enrichment ? 0.55 + socialCount * 0.1 : 0.35) : 0;

  const windowLit = useCallback((i: number) => {
    const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return (x - Math.floor(x)) < litChance;
  }, [litChance]);

  const stars = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      x: (Math.sin(i * 73.1 + 17.3) * 43758.5453 % 1) * 100,
      y: (Math.sin(i * 127.7 + 89.1) * 43758.5453 % 1) * 60,
      size: 1 + (i % 3) * 0.5,
      opacity: 0.15 + (i % 4) * 0.08,
    })), []);

  return (
    <div className="flex flex-col items-center justify-end h-full relative overflow-hidden"
      style={{ minHeight: 480, background: 'linear-gradient(to bottom, #06061a 0%, #0a0a18 50%, #080812 100%)' }}
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
            opacity: allStep1 ? s.opacity * 1.5 : s.opacity * 0.6,
            transition: 'opacity 1s ease',
          }}
        />
      ))}

      {/* Background skyline */}
      <div className="absolute bottom-[56px] left-0 right-0 flex items-end justify-center gap-[3px]"
        style={{ opacity: hasName ? 0.12 : 0.06, transition: 'opacity 0.6s ease' }}
      >
        {[22, 48, 34, 62, 28, 0, 38, 56, 30, 44, 26, 52, 36, 20, 42].map((h, i) => (
          <div
            key={i}
            style={{
              width: i === 5 ? 0 : Math.max(6, 12 - Math.abs(i - 7)),
              height: i === 5 ? 0 : h,
              backgroundColor: '#3a3a50',
              transition: 'height 0.6s ease',
            }}
          />
        ))}
      </div>

      {/* Main building — modern office tower */}
      <div
        className="relative z-10 flex flex-col items-center"
        style={{
          transform: step2Enrichment ? 'scale(0.82) translateY(6px)' : 'scale(1)',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Rooftop equipment (appears when complete) */}
        <div className="flex items-end gap-1 mb-px" style={{ opacity: allStep1 ? 1 : 0, transition: 'opacity 0.5s ease' }}>
          {/* AC unit */}
          <div style={{ width: 8, height: 5, backgroundColor: '#2a2a3a', borderRadius: 1, transition: 'all 0.4s ease' }} />
          {/* Antenna mast */}
          <div className="flex flex-col items-center">
            <div style={{ width: 1.5, height: allStep1 ? 18 : 0, backgroundColor: '#555', transition: 'height 0.5s ease' }} />
            <div style={{
              width: allStep1 ? 4 : 0, height: allStep1 ? 4 : 0, borderRadius: '50%',
              backgroundColor: '#e55', boxShadow: '0 0 6px 2px rgba(238,85,85,0.4)',
              transition: 'all 0.4s ease 0.3s',
            }} />
          </div>
          {/* AC unit 2 */}
          <div style={{ width: 6, height: 4, backgroundColor: '#2a2a3a', borderRadius: 1, transition: 'all 0.4s ease' }} />
        </div>

        {/* Crown / mechanical floor — flat modern top */}
        <div style={{
          width: bodyWidth + 4,
          height: hasName ? 6 : 3,
          backgroundColor: '#2a2a3a',
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
          transition: 'all 0.5s ease',
        }} />

        {/* Upper setback section — narrower glass floors */}
        <div style={{
          width: towerWidth + 8,
          maxHeight: towerHeight,
          overflow: 'hidden',
          backgroundColor: '#10101a',
          borderLeft: '1px solid #2a2a3a',
          borderRight: '1px solid #2a2a3a',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          {/* Glass curtain wall — horizontal bands */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex" style={{ borderBottom: '1px solid #1a1a28' }}>
              {Array.from({ length: 3 }).map((_, j) => {
                const lit = windowLit(i * 3 + j);
                return (
                  <div
                    key={j}
                    style={{
                      flex: 1,
                      height: hasName ? 11 : 0,
                      backgroundColor: lit ? 'rgba(180,170,120,0.15)' : 'rgba(60,80,120,0.08)',
                      boxShadow: lit ? '0 0 8px rgba(255,232,160,0.2)' : 'none',
                      borderRight: j < 2 ? '1px solid #1c1c2a' : 'none',
                      transition: 'all 0.4s ease',
                      transitionDelay: `${i * 40 + j * 20}ms`,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Setback ledge */}
        <div style={{
          width: bodyWidth,
          height: 3,
          backgroundColor: '#2a2a3a',
          transition: 'all 0.5s ease',
        }} />

        {/* Main glass facade */}
        <div style={{
          width: bodyWidth,
          maxHeight: bodyHeight,
          overflow: 'hidden',
          backgroundColor: '#10101a',
          borderLeft: '1.5px solid #2a2a3a',
          borderRight: '1.5px solid #2a2a3a',
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          {/* Floor bands — realistic curtain wall pattern */}
          {Array.from({ length: hasName ? 7 : 1 }).map((_, floor) => (
            <div key={floor}>
              {/* Spandrel panel (floor slab line) */}
              <div style={{
                height: 2,
                backgroundColor: '#22222e',
                transition: 'all 0.4s ease',
              }} />
              {/* Window band */}
              <div className="flex">
                {Array.from({ length: 4 }).map((_, pane) => {
                  const lit = windowLit(floor * 4 + pane + 20);
                  return (
                    <div
                      key={pane}
                      style={{
                        flex: 1,
                        height: hasName ? 13 : 10,
                        backgroundColor: lit
                          ? 'rgba(200,185,120,0.18)'
                          : `rgba(40,60,100,${0.06 + (floor % 2) * 0.03})`,
                        boxShadow: lit
                          ? '0 0 10px rgba(255,232,160,0.25), inset 0 0 4px rgba(255,232,160,0.1)'
                          : 'none',
                        borderRight: pane < 3 ? '1px solid #1a1a28' : 'none',
                        transition: 'all 0.4s ease',
                        transitionDelay: `${(floor * 4 + pane + 12) * 25}ms`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Ground floor / lobby — taller, glass front */}
        <div style={{
          width: bodyWidth + 8,
          height: 28,
          backgroundColor: '#14141e',
          borderLeft: '1.5px solid #2a2a3a',
          borderRight: '1.5px solid #2a2a3a',
          borderBottom: '1.5px solid #2a2a3a',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.5s ease',
        }}>
          {/* Lobby interior glow */}
          <div style={{
            position: 'absolute', inset: 0,
            background: hasEmail
              ? 'linear-gradient(to top, rgba(220,190,70,0.08), transparent 80%)'
              : 'none',
            transition: 'all 0.6s ease',
          }} />
          {/* Revolving door */}
          <div style={{
            position: 'absolute', left: '50%', bottom: 0,
            transform: 'translateX(-50%)',
            width: 18, height: 22,
            backgroundColor: hasEmail ? 'rgba(180,160,80,0.06)' : '#0e0e18',
            border: `1px solid ${hasEmail ? '#3a3420' : '#22222e'}`,
            borderBottom: 'none',
            borderRadius: '2px 2px 0 0',
            transition: 'all 0.4s ease',
          }}>
            {/* Door divider */}
            <div style={{
              position: 'absolute', left: '50%', top: 2, bottom: 0,
              width: 1, backgroundColor: hasEmail ? '#4a4020' : '#22222e',
              transition: 'all 0.4s ease',
            }} />
          </div>
          {/* Side windows */}
          {[-1, 1].map((side) => (
            <div key={side} style={{
              position: 'absolute',
              [side === -1 ? 'left' : 'right']: 6,
              bottom: 3, width: 14, height: 16,
              backgroundColor: hasEmail ? 'rgba(180,160,80,0.04)' : '#0e0e18',
              border: `1px solid ${hasEmail ? '#2a2820' : '#1e1e28'}`,
              borderRadius: 1,
              transition: 'all 0.4s ease',
            }} />
          ))}
        </div>

        {/* Sidewalk / foundation */}
        <div style={{
          width: bodyWidth + 24,
          height: 5,
          backgroundColor: '#222230',
          borderRadius: '0 0 1px 1px',
          transition: 'all 0.5s ease',
        }} />
      </div>

      {/* Ground plane */}
      <div className="w-full relative z-10">
        <div className="w-full h-px bg-[#2a2a38]" />
        <div
          className="mx-auto"
          style={{
            width: bodyWidth + 10,
            height: allStep1 ? 30 : 16,
            background: 'linear-gradient(to bottom, rgba(24,24,34,0.6), transparent)',
            transition: 'all 0.5s ease',
          }}
        />
      </div>

      {/* Name label */}
      <div className="relative z-10 mt-2 px-4">
        <p
          className="text-center font-semibold tracking-wide truncate"
          style={{
            maxWidth: 240,
            fontSize: 12,
            color: hasName ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
            transition: 'color 0.3s ease',
          }}
        >
          {hasName ? name : 'Seu escritório'}
        </p>
      </div>

      {/* Ready pulse glow — triggers when all step 1 fields complete */}
      {allStep1 && step !== 2 && (
        <div
          className="absolute inset-0 z-[5] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 70%, rgba(255,232,160,0.06) 0%, transparent 60%)',
            animation: 'pulse 2.5s ease-in-out infinite',
          }}
        />
      )}

      {/* Status caption */}
      <p className="relative z-10 text-[11px] text-center mb-6 mt-1.5 tracking-wider font-medium"
        style={{ color: allStep1 ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)' }}
      >
        {step === 2
          ? `Tier 1 · ${practiceAreas > 0 ? `${practiceAreas} área${practiceAreas > 1 ? 's' : ''}` : 'Personalizar'}`
          : allStep1
            ? 'Pronto para criar'
            : `${completionLevel}/3 campos`}
      </p>

      {/* Step 2 decoration badges */}
      {step2Enrichment && (hasInstagram || hasLinkedin || hasAddress) && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 z-20">
          {hasInstagram && (
            <div className="w-6 h-6 rounded-full bg-white/[0.08] border border-white/15 flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" />
              </svg>
            </div>
          )}
          {hasLinkedin && (
            <div className="w-6 h-6 rounded-full bg-white/[0.08] border border-white/15 flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="2" />
              </svg>
            </div>
          )}
          {hasAddress && (
            <div className="w-6 h-6 rounded-full bg-white/[0.08] border border-white/15 flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
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
    <div className="mb-12 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-white text-xs font-bold bg-[#222] px-2.5 py-1 rounded-full">
          {step}/2
        </span>
        <span className="text-[#777] text-xs uppercase tracking-widest">
          {step === 1 ? 'Dados essenciais' : 'Personalização'}
        </span>
      </div>
      <div className="flex gap-1.5">
        <div className="h-1 flex-1 rounded-full bg-white/80 transition-colors duration-500" />
        <div
          className="h-1 flex-1 rounded-full transition-colors duration-500"
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
    <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
      <div
        className="w-16 h-16 flex items-center justify-center mb-8 rounded-full"
        style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          border: '1.5px solid rgba(255,255,255,0.15)',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 className="text-white text-2xl font-bold tracking-tight">
        Prédio criado
      </h2>
      <p className="text-[#999] text-sm mt-3 leading-relaxed">
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
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTransition, setShowTransition] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Step 1: Conta
  const [officeName, setOfficeName] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Escritório
  const [oabNumber, setOabNumber] = useState('');
  const [oabState, setOabState] = useState('');

  // Step 3: Personalização
  const [slug, setSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [address, setAddress] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  function toggleArea(id: string) {
    setSelectedAreas((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  }

  const oabComplete = oabNumber.trim().length >= 4 && oabState.length === 2;

  // Inline validation
  const emailTouched = emailValue.length > 0;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
  const oabTouched = oabNumber.length > 0;
  const oabNumberValid = oabNumber.trim().length >= 4;
  const nameValid = officeName.trim().length > 2;
  const passwordValid = password.length >= 6;
  const passwordTouched = password.length > 0;
  const confirmTouched = confirmPassword.length > 0;
  const passwordsMatch = password === confirmPassword;

  const slugPreview = useMemo(() => {
    if (!officeName.trim()) return '';
    return officeName
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 40);
  }, [officeName]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.push('/');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router]);

  /* Google OAuth */
  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/register&step=2`,
      },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  }

  /* Step 1 → Step 2 (just advance, no API call yet) */
  function handleStep1Submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStep(2);
  }

  /* Step 2 → create office via API */
  async function handleStep2Submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data: Record<string, string> = { name: officeName, email: emailValue, password };
    if (oabComplete) data.oab_number = `${oabNumber.trim()}/${oabState}`;

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
    setStep(3);
  }, []);

  /* Step 3 → save enrichment */
  async function handleStep3Submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data: Record<string, string | string[]> = { slug };
    if (instagram.trim()) data.instagram_url = instagram.trim();
    if (linkedin.trim()) data.linkedin_url = linkedin.trim();
    if (logoUrl.trim()) data.website_url = logoUrl.trim();
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
    'w-full px-4 py-3.5 bg-[#0c0c0f] border border-[#1e1e24] rounded-lg text-white text-sm focus:outline-none focus:border-[#3a3a44] focus:bg-[#0e0e12] transition-all duration-200 placeholder-[#555]';

  const stepLabels = ['Sua conta', 'Seu escritório', 'Personalização'];

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-black flex flex-col">
      {/* Nav */}
      <nav className="border-b border-[#111] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/" className="text-white text-base sm:text-lg font-semibold tracking-tight">
          top<span className="text-[#555]">.escritorio</span>
          <span className="text-[#888]">.ai</span>
        </Link>
        <Link href="/" className="text-[#888] text-xs sm:text-sm hover:text-white transition-colors">
          Voltar ao mapa
        </Link>
      </nav>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-start md:justify-center px-4 sm:px-6 py-6 sm:py-10 md:py-16 pb-24 md:pb-16">
        <div className="w-full max-w-5xl">
          <div className="flex flex-col md:flex-row md:gap-12 lg:gap-20 md:items-start">
            {/* Desktop: full preview */}
            <div
              className="hidden md:block md:order-2 md:w-[340px] lg:w-[380px] md:flex-shrink-0 rounded-xl overflow-hidden border border-[#111] bg-[#050505] md:sticky md:top-8 md:self-start animate-fade-in"
              style={{ animationDelay: '150ms' }}
            >
              <BuildingPreview
                name={officeName}
                hasOab={oabComplete}
                hasEmail={emailValid}
                step={step >= 3 ? 2 : 1}
                practiceAreas={selectedAreas.length}
                hasInstagram={instagram.trim().length > 0}
                hasLinkedin={linkedin.trim().length > 0}
                hasAddress={address.trim().length > 0}
              />
            </div>
            {/* Mobile: compact building status bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[#1a1a28] bg-[#0a0a14]/95 backdrop-blur-sm px-4 py-3 flex items-center gap-4">
              {/* Mini building icon */}
              <div className="flex items-end gap-[2px] h-8 flex-shrink-0">
                <div style={{ width: 4, height: nameValid ? 14 : 6, backgroundColor: nameValid ? '#3a3a50' : '#1a1a28', transition: 'all 0.4s ease' }} />
                <div style={{ width: 6, height: nameValid ? 24 : 10, backgroundColor: nameValid ? '#2a2a3a' : '#1a1a28', transition: 'all 0.4s ease' }}>
                  {oabComplete && <div style={{ width: 2, height: 2, backgroundColor: '#5c5530', margin: '2px auto' }} />}
                </div>
                <div style={{ width: 4, height: nameValid ? 18 : 8, backgroundColor: nameValid ? '#3a3a50' : '#1a1a28', transition: 'all 0.4s ease' }} />
              </div>
              {/* Name + status */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">
                  {nameValid ? officeName : 'Seu escritório'}
                </p>
                <p className="text-[#555] text-[10px] mt-0.5">
                  {step >= 3
                    ? `Tier 1 · ${selectedAreas.length > 0 ? `${selectedAreas.length} área${selectedAreas.length > 1 ? 's' : ''}` : 'Personalizar'}`
                    : `${[nameValid, oabComplete, emailValid].filter(Boolean).length}/3 campos`}
                </p>
              </div>
              {/* Step dots */}
              <div className="flex gap-1.5 flex-shrink-0">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="w-1.5 h-1.5 rounded-full transition-colors" style={{ backgroundColor: s <= step ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.1)' }} />
                ))}
              </div>
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
                  {/* Step indicator — 3 steps */}
                  <div className="mb-12 animate-fade-in">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-white text-xs font-bold bg-[#222] px-2.5 py-1 rounded-full">
                        {step}/3
                      </span>
                      <span className="text-[#777] text-xs uppercase tracking-widest">
                        {stepLabels[step - 1]}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map((s) => (
                        <div
                          key={s}
                          className="h-1 flex-1 rounded-full transition-colors duration-500"
                          style={{ backgroundColor: s <= step ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.06)' }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* ─── STEP 1: Conta ─── */}
                  {step === 1 && (
                    <div className="animate-fade-in">
                      <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                        Coloque seu escritório no mapa
                      </h1>
                      <p className="text-[#bbb] text-sm sm:text-base md:text-lg mt-3 sm:mt-4 leading-relaxed max-w-md">
                        Seu prédio aparece na cidade 3D imediatamente. Ganhe visibilidade entre centenas de escritórios.
                      </p>

                      {/* Google sign-in */}
                      <div className="mt-8 animate-fade-in">
                        <button
                          type="button"
                          onClick={handleGoogleSignIn}
                          disabled={loading}
                          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-[#111] border border-[#2a2a2a] rounded-lg text-white text-sm font-medium hover:bg-[#1a1a1a] hover:border-[#3a3a3a] transition-all duration-200 disabled:opacity-40"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                          </svg>
                          Continuar com Google
                        </button>
                      </div>

                      {/* Divider */}
                      <div className="mt-6 flex items-center gap-4">
                        <div className="flex-1 h-px bg-[#1a1a1a]" />
                        <span className="text-[#555] text-xs">ou</span>
                        <div className="flex-1 h-px bg-[#1a1a1a]" />
                      </div>

                      <form onSubmit={handleStep1Submit} className="mt-6 space-y-5">
                        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                          <label className="block text-[#bbb] text-xs font-medium uppercase tracking-widest mb-2.5">
                            Email profissional
                          </label>
                          <div className="relative">
                            <input
                              name="email"
                              type="email"
                              required
                              autoFocus
                              className={inputClass}
                              placeholder="contato@seuescritorio.com.br"
                              value={emailValue}
                              onChange={(e) => setEmailValue(e.target.value)}
                            />
                            <FieldCheck done={emailTouched && emailValid} />
                          </div>
                          {emailTouched && !emailValid && emailValue.length > 3 && (
                            <p className="mt-1.5 text-xs text-[#886644] animate-fade-in">
                              Insira um email válido
                            </p>
                          )}
                        </div>

                        {/* Senha + Confirmar lado a lado */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
                          <div>
                            <label className="block text-[#bbb] text-xs font-medium uppercase tracking-widest mb-2.5">
                              Senha
                            </label>
                            <div className="relative">
                              <input
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                minLength={6}
                                className={inputClass}
                                placeholder="Mínimo 6 caracteres"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#999] transition-colors"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                  {showPassword ? (
                                    <>
                                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                      <line x1="1" y1="1" x2="23" y2="23" />
                                    </>
                                  ) : (
                                    <>
                                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                      <circle cx="12" cy="12" r="3" />
                                    </>
                                  )}
                                </svg>
                              </button>
                            </div>
                            {passwordTouched && !passwordValid && (
                              <p className="mt-1.5 text-xs text-[#886644] animate-fade-in">Min. 6 caracteres</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-[#bbb] text-xs font-medium uppercase tracking-widest mb-2.5">
                              Confirmar
                            </label>
                            <div className="relative">
                              <input
                                name="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                required
                                className={inputClass}
                                placeholder="Repita a senha"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                              />
                              <FieldCheck done={confirmTouched && passwordsMatch && passwordValid} />
                            </div>
                            {confirmTouched && !passwordsMatch && confirmPassword.length >= 3 && (
                              <p className="mt-1.5 text-xs text-[#886644] animate-fade-in">Senhas diferentes</p>
                            )}
                          </div>
                        </div>

                        {error && (
                          <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-red-500/[0.06] border border-red-500/20 animate-fade-in">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
                              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <p className="text-red-400 text-sm">{error}</p>
                          </div>
                        )}

                        <div className="pt-2 animate-fade-in" style={{ animationDelay: '300ms' }}>
                          <button
                            type="submit"
                            disabled={!emailValid || !passwordValid || !passwordsMatch}
                            className="w-full px-8 sm:px-10 py-3.5 sm:py-4 bg-white text-black text-sm font-bold rounded-lg hover:bg-[#e0e0e0] active:bg-[#d0d0d0] transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            Próximo
                          </button>
                        </div>

                        <p className="text-[#666] text-[11px] text-center">
                          Ao continuar, você concorda com os{' '}
                          <Link href="/termos" className="underline hover:text-[#bbb] transition-colors">
                            termos de uso
                          </Link>
                        </p>
                      </form>
                    </div>
                  )}

                  {/* ─── STEP 2: Escritório ─── */}
                  {step === 2 && (
                    <div className="animate-fade-in">
                      <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                        Dados do escritório
                      </h1>
                      <p className="text-[#bbb] text-sm sm:text-base md:text-lg mt-3 sm:mt-4 leading-relaxed max-w-md">
                        O registro OAB é opcional mas escritórios verificados ganham destaque no mapa.
                      </p>

                      {/* Slug URL preview */}
                      {slugPreview && (
                        <div className="mt-5 animate-fade-in">
                          <p className="text-[11px] text-[#555]">
                            <span className="text-[#444]">top.escritorio.ai/</span>
                            <span className="text-[#888]">{slugPreview}</span>
                          </p>
                        </div>
                      )}

                      <form onSubmit={handleStep2Submit} className="mt-8 space-y-7">
                        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                          <label className="block text-[#bbb] text-xs font-medium uppercase tracking-widest mb-3">
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
                            <FieldCheck done={nameValid} />
                          </div>
                        </div>

                        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                          <label className="block text-[#bbb] text-xs font-medium uppercase tracking-widest mb-3">
                            Registro OAB <span className="text-[#555] normal-case tracking-normal">(opcional)</span>
                          </label>
                          <div className="flex gap-3">
                            <div className="relative flex-1">
                              <input
                                name="oab_number"
                                inputMode="numeric"
                                className={inputClass}
                                placeholder="123456"
                                value={oabNumber}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  const match = raw.match(/^(\d+)[\/\-\s]?([A-Za-z]{2})$/);
                                  if (match) {
                                    const uf = match[2].toUpperCase();
                                    if (uf in stateCapitals) {
                                      setOabNumber(match[1]);
                                      setOabState(uf);
                                      return;
                                    }
                                  }
                                  setOabNumber(raw.replace(/\D/g, ''));
                                }}
                              />
                              <FieldCheck done={oabNumberValid} />
                            </div>
                            <div className="relative w-[100px]">
                              <select
                                value={oabState}
                                onChange={(e) => setOabState(e.target.value)}
                                className="w-full h-full px-3 py-3.5 bg-[#0c0c0f] border border-[#1e1e24] rounded-lg text-white text-sm focus:outline-none focus:border-[#3a3a44] focus:bg-[#0e0e12] transition-all duration-200 appearance-none cursor-pointer"
                              >
                                <option value="" disabled className="bg-[#0c0c0f] text-[#555]">UF</option>
                                {Object.keys(stateCapitals).sort().map((uf) => (
                                  <option key={uf} value={uf} className="bg-[#0c0c0f] text-white">
                                    {uf}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                  <path d="M2 4L5 7L8 4" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          {oabComplete && (
                            <p className="mt-2.5 text-xs flex items-center gap-1.5 animate-fade-in">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500/60" />
                              <span className="text-[#bbb]">
                                {oabState}
                                {stateCapitals[oabState] ? ` — ${stateCapitals[oabState]}` : ''}
                              </span>
                            </p>
                          )}
                          {oabTouched && !oabNumberValid && oabNumber.length > 0 && (
                            <p className="mt-2 text-xs text-[#886644] animate-fade-in">
                              Mínimo 4 dígitos
                            </p>
                          )}
                        </div>

                        {error && (
                          <div className="flex items-center gap-2.5 px-4 py-3.5 rounded-lg bg-red-500/[0.06] border border-red-500/20 animate-fade-in">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
                              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <p className="text-red-400 text-sm">{error}</p>
                          </div>
                        )}

                        <div className="pt-3 flex gap-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
                          <button
                            type="button"
                            onClick={() => { setError(null); setStep(1); }}
                            className="px-5 sm:px-6 py-3.5 sm:py-4 border border-[#333] text-white text-sm font-medium rounded-lg hover:bg-[#111] transition-colors"
                          >
                            Voltar
                          </button>
                          <button
                            type="submit"
                            disabled={loading || !nameValid}
                            className="flex-1 px-8 sm:px-10 py-3.5 sm:py-4 bg-white text-black text-sm font-bold rounded-lg hover:bg-[#e0e0e0] active:bg-[#d0d0d0] transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
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
                      </form>
                    </div>
                  )}

                  {/* ─── STEP 3: Personalização ─── */}
                  {step === 3 && (
                    <div className="animate-fade-in">
                      <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                        Destaque seu prédio
                      </h1>
                      <p className="text-[#bbb] text-sm sm:text-base md:text-lg mt-3 sm:mt-4 leading-relaxed max-w-md">
                        Adicione informações para que outros escritórios encontrem você.
                        Tudo aqui é opcional.
                      </p>

                      <form onSubmit={handleStep3Submit} className="mt-10 space-y-8">
                        {/* Practice areas */}
                        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-[#bbb] text-xs font-medium uppercase tracking-widest">
                              Áreas de atuação
                            </label>
                            <span className="text-[#555] text-[10px] tabular-nums">
                              {selectedAreas.length}/4
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {PRACTICE_AREAS.map((area) => {
                              const selected = selectedAreas.includes(area.id);
                              return (
                                <button
                                  key={area.id}
                                  type="button"
                                  onClick={() => toggleArea(area.id)}
                                  className="flex flex-col items-center gap-2 p-4 rounded-lg border transition-all duration-200"
                                  style={{
                                    borderColor: selected ? 'rgba(255,255,255,0.2)' : '#1a1a20',
                                    backgroundColor: selected ? 'rgba(255,255,255,0.04)' : '#0a0a0f',
                                    color: selected ? '#fff' : '#666',
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: selected ? '#fff' : '#444' }}>
                                    <path d={area.icon} />
                                  </svg>
                                  <span className="text-[10px] leading-tight text-center">{area.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Address */}
                        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                          <label className="block text-[#bbb] text-xs font-medium uppercase tracking-widest mb-3">
                            Endereço do escritório
                          </label>
                          <input type="text" className={inputClass} placeholder="Av. Paulista, 1000 - Bela Vista, São Paulo" value={address} onChange={(e) => setAddress(e.target.value)} />
                          <p className="text-[#555] text-[10px] mt-2.5">Aparecerá no mapa do seu perfil</p>
                        </div>

                        {/* Website for logo */}
                        <div className="animate-fade-in" style={{ animationDelay: '250ms' }}>
                          <label className="block text-[#bbb] text-xs font-medium uppercase tracking-widest mb-3">
                            Site do escritório
                          </label>
                          <div className="relative">
                            <input type="url" className={inputClass} placeholder="https://seuescritorio.com.br" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
                            {logoUrl.trim() && /^https?:\/\/.+\..+/.test(logoUrl.trim()) && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <img
                                  src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(logoUrl.trim())}&sz=32`}
                                  alt="" width={18} height={18} className="rounded-sm opacity-70"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              </div>
                            )}
                          </div>
                          <p className="text-[#555] text-[10px] mt-2">Buscaremos o logo automaticamente</p>
                        </div>

                        {/* Social */}
                        <div className="space-y-3 animate-fade-in" style={{ animationDelay: '300ms' }}>
                          <label className="block text-[#bbb] text-xs font-medium uppercase tracking-widest">Redes sociais</label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]"><InstagramIcon /></div>
                            <input type="url" className={`${inputClass} pl-11`} placeholder="https://instagram.com/seu-escritorio" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                          </div>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]"><LinkedInIcon /></div>
                            <input type="url" className={`${inputClass} pl-11`} placeholder="https://linkedin.com/company/seu-escritorio" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
                          </div>
                        </div>

                        {/* Asaas upsell */}
                        <div className="rounded-lg border border-[#1a1a20] bg-[#0a0a0f] p-5 animate-fade-in" style={{ animationDelay: '350ms' }}>
                          <p className="text-[#888] text-xs leading-relaxed">
                            Conecte sua conta <span className="text-[#bbb] font-medium">Asaas</span> para verificar faturamento, subir no ranking e desbloquear logo no prédio.
                          </p>
                        </div>

                        {error && (
                          <div className="flex items-center gap-2.5 px-4 py-3.5 rounded-lg bg-red-500/[0.06] border border-red-500/20 animate-fade-in">
                            <p className="text-red-400 text-sm">{error}</p>
                          </div>
                        )}

                        <div className="pt-3 space-y-3 animate-fade-in" style={{ animationDelay: '400ms' }}>
                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-8 sm:px-10 py-3.5 sm:py-4 bg-white text-black text-sm font-bold rounded-lg hover:bg-[#e0e0e0] active:bg-[#d0d0d0] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
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
                          <button type="button" onClick={handleSkip} className="w-full px-6 py-3.5 text-[#888] text-sm hover:text-white transition-colors">
                            Pular por agora
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#111]">
        <a href="https://chatjuridico.com.br" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/[0.04] border border-white/[0.06] rounded-full hover:bg-white/[0.08] transition-all group">
          <img src="/brands/chat-juridico-icon-white.svg" alt="" className="h-3.5 w-3.5 opacity-40 group-hover:opacity-70 transition-opacity" />
          <span className="text-[10px] text-[#555] group-hover:text-[#888] transition-colors tracking-wide uppercase">
            Potencializado por <span className="text-[#777] group-hover:text-white font-medium">ChatJuridico</span>
          </span>
        </a>
      </div>
    </main>
  );
}
