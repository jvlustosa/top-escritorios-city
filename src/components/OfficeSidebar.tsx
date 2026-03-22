'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { RankedOffice, formatRevenueRange } from '@/data/mock-offices';
import { PRACTICE_AREAS } from '@/data/practice-areas';
import Tooltip from './Tooltip';

const LocationMap = dynamic(() => import('./LocationMap'), { ssr: false });

interface OfficeSidebarProps {
  office: RankedOffice | null;
  onClose: () => void;
  allOffices?: RankedOffice[];
}

const tierLabels: Record<number, string> = {
  1: 'Iniciante',
  2: 'Starter',
  3: 'Pro',
  4: 'Business',
  5: 'Enterprise',
};

export default function OfficeSidebar({ office, onClose, allOffices = [] }: OfficeSidebarProps) {
  if (!office) return null;

  return (
    <>{/* Backdrop — closes sidebar on tap outside (mobile) */}
    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
    <div className="fixed inset-0 z-50 bg-black/60 md:bg-black/30" onClick={onClose}>
    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
    <div
      className="absolute right-0 top-0 h-full w-full max-w-[520px] bg-[#0c0c0c] border-l border-[#1e1e1e] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-6 sm:p-8 pb-10">
        {/* Close — larger touch target, visible border */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 sm:top-7 sm:right-7 w-10 h-10 flex items-center justify-center rounded-full bg-[#1a1a1a] border border-[#333] text-[#888] hover:text-white hover:bg-[#2a2a2a] transition-colors"
          aria-label="Fechar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* ── Header ── */}
        <div className="pr-10">
          {/* Logo */}
          {office.logo_url && (
            <div className="mb-5 w-full flex items-center justify-center">
              <div className="w-full h-20 relative bg-[#111] rounded-lg border border-[#1e1e1e] flex items-center justify-center overflow-hidden">
                <Image
                  src={office.logo_url}
                  alt={`Logo ${office.name}`}
                  width={180}
                  height={60}
                  className="object-contain max-h-14"
                />
              </div>
            </div>
          )}

          {/* Rank inline with name */}
          <div className="flex items-start gap-3">
            {office.rank != null && (
              <span className="text-[#3a3a3a] text-[44px] font-bold leading-none tabular-nums select-none -mt-1">
                {office.rank}
              </span>
            )}
            <div className="min-w-0 pt-0.5">
              <h2 className="text-white text-lg font-semibold leading-snug">
                {office.name}
              </h2>
              <div className="flex items-center gap-1 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-[#666] flex-shrink-0">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
                </svg>
                <span className="text-[#888] text-xs">
                  {office.city}, {office.state}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Badges ── */}
        <div className="flex gap-1.5 mt-6 flex-wrap">
          {office.verified && (
            <Tooltip
              content={<>Faturamento confirmado via integração com <span className="text-white font-semibold">Asaas</span>. Dados financeiros verificados automaticamente.</>}
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/50 border border-emerald-800/30 text-emerald-400 text-[11px] font-semibold rounded-full cursor-help">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Verificado pelo Asaas
              </span>
            </Tooltip>
          )}
          <span className="px-2.5 py-1 bg-[#1a1a1a] text-[#999] text-[10px] rounded-full">
            {tierLabels[office.tier]}
          </span>
          {office.chat_juridico_client && (
            <span className="px-2.5 py-1 bg-[#1a1a1a] text-[#999] text-[10px] rounded-full">
              Chat Juridico
            </span>
          )}
          {office.is_plus && (
            <span className="px-2 py-0.5 bg-amber-950/30 text-amber-500 text-[10px] font-medium rounded-full">
              Plus
            </span>
          )}
        </div>

        {/* ── Competitor Proximity ── */}
        {(() => {
          const sameCityVerified = allOffices.filter(
            (o) => o.id !== office.id && o.city === office.city && o.verified
          ).length;
          if (sameCityVerified === 0) return null;
          return (
            <div className="mt-5 flex items-center gap-2.5 px-3.5 py-2.5 bg-[#131313] border border-[#1e1e1e] rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#666] flex-shrink-0">
                <path d="M3 21h18" />
                <path d="M5 21V7l8-4v18" />
                <path d="M19 21V11l-6-4" />
                <path d="M9 9h1" />
                <path d="M9 13h1" />
                <path d="M9 17h1" />
              </svg>
              <p className="text-[#888] text-[11px] leading-snug">
                <span className="text-[#bbb] font-medium">{sameCityVerified}</span>{' '}
                {sameCityVerified === 1 ? 'escritório' : 'escritórios'} da sua cidade{' '}
                {sameCityVerified === 1 ? 'já é verificado' : 'já são verificados'}
              </p>
            </div>
          );
        })()}

        {/* ── Revenue card ── */}
        {office.verified && office.revenue_range != null && (
          <div className="mt-7 p-5 bg-gradient-to-br from-[#0a1a0f] to-[#131313] rounded-lg border border-emerald-900/30">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[#777] text-[10px] uppercase tracking-[0.12em] font-medium">
                Faturamento mensal
              </p>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-950/40 rounded border border-emerald-800/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span className="text-emerald-400/80 text-[9px] font-medium">verificado</span>
              </div>
            </div>
            <p className="text-white text-2xl font-bold tabular-nums tracking-tight">
              {formatRevenueRange(office.revenue_range)}
            </p>
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-emerald-900/20">
              <span className="text-[#555] text-[9px]">dados financeiros via</span>
              <Image src="/brands/asaas-logo.svg" alt="Asaas" width={40} height={12} className="opacity-50" />
            </div>
          </div>
        )}

        {/* ── Tier bar ── */}
        <div className="mt-6 flex items-center gap-3">
          <p className="text-[#777] text-[10px] uppercase tracking-[0.12em] font-medium flex-shrink-0">
            Porte
          </p>
          <div className="flex gap-[3px] flex-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`h-[4px] flex-1 rounded-full ${
                  i < office.tier ? 'bg-white/70' : 'bg-[#222]'
                }`}
              />
            ))}
          </div>
          <p className="text-[#777] text-[10px] tabular-nums flex-shrink-0">
            {office.tier}/5
          </p>
        </div>

        {/* ── Áreas de atuação ── */}
        {office.practice_areas && office.practice_areas.length > 0 && (
          <div className="mt-7">
            <p className="text-[#777] text-[10px] uppercase tracking-[0.12em] font-medium mb-3">
              Áreas de atuação
            </p>
            <div className="flex flex-wrap gap-2">
              {office.practice_areas.map((areaId) => {
                const area = PRACTICE_AREAS.find((a) => a.id === areaId);
                if (!area) return null;
                return (
                  <span
                    key={areaId}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#151515] border border-[#222] rounded-md text-[11px] text-[#999]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[#777] flex-shrink-0"
                    >
                      <path d={area.icon} />
                    </svg>
                    {area.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Description (Plus) ── */}
        {office.is_plus && office.description && (
          <p className="mt-7 text-[#999] text-[13px] leading-relaxed">
            {office.description}
          </p>
        )}

        {/* ── ChatJurídico (Plus) ── */}
        {office.is_plus && office.chat_juridico_client && (
          <div className="mt-6 pt-6 border-t border-[#1e1e1e] flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-950/40 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-500">
                <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <p className="text-[#888] text-xs">
              Potencializado por{' '}
              <a href="https://chatjuridico.com.br" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400 transition-colors">
                ChatJuridico.com.br
              </a>
            </p>
          </div>
        )}

        {/* ── Unverified CTA ── */}
        {!office.verified && (
          <div className="mt-7 p-5 bg-[#131313] rounded-lg border border-[#1e1e1e]">
            <p className="text-white text-sm font-medium">
              Escritório não verificado
            </p>
            <p className="text-[#888] text-xs mt-2 leading-relaxed">
              Conecte sua conta Asaas para verificar e subir no ranking.
            </p>
            <a
              href={`/office/${office.slug}`}
              className="mt-4 block w-full text-center px-4 py-2.5 bg-[#1a1a1a] border border-[#333] text-white text-xs font-medium rounded hover:bg-[#222] hover:border-[#444] transition-colors"
            >
              Verificar escritório
            </a>
            <div className="flex items-center gap-1.5 mt-3">
              <span className="text-[#555] text-[9px]">via</span>
              <Image src="/brands/asaas-logo.svg" alt="Asaas" width={36} height={11} className="opacity-25" />
            </div>
          </div>
        )}

        {/* ── Ranking Teaser (unverified) ── */}
        {!office.verified && allOffices.length > 0 && (() => {
          const estimatedPosition = allOffices.filter(
            (o) => o.verified && o.tier > office.tier
          ).length + 1;
          return (
            <div className="mt-4 px-4 py-3 bg-[#111] border border-[#1a1a1a] rounded-lg">
              <p className="text-[#ccc] text-xs font-medium">
                Se verificado, estaria na posição <span className="text-white font-semibold">#{estimatedPosition}</span>
              </p>
              <p className="text-[#666] text-[10px] mt-1.5 leading-relaxed">
                Verifique seu faturamento via Asaas para aparecer no ranking
              </p>
            </div>
          );
        })()}

        {/* ── Social / Website links ── */}
        {(office.instagram_url || office.linkedin_url || office.website_url) && (
          <div className="mt-8 flex items-center gap-3">
            {office.website_url && office.website_url.includes('wa.me') && (
              <a
                href={office.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#1a3a1a] border border-[#2a4a2a] text-[#25D366] hover:text-[#4AE880] hover:border-[#3a5a3a] transition-colors"
                title="WhatsApp"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            )}
            {office.website_url && !office.website_url.includes('wa.me') && (
              <a
                href={office.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#1a1a1a] border border-[#222] text-[#888] hover:text-white hover:border-[#444] transition-colors"
                title="Website"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </a>
            )}
            {office.instagram_url && (
              <a
                href={office.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#1a1a1a] border border-[#222] text-[#888] hover:text-white hover:border-[#444] transition-colors"
                title="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="18" cy="6" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
            )}
            {office.linkedin_url && (
              <a
                href={office.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#1a1a1a] border border-[#222] text-[#888] hover:text-white hover:border-[#444] transition-colors"
                title="LinkedIn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="2" />
                  <line x1="8" y1="11" x2="8" y2="16" />
                  <line x1="8" y1="8" x2="8" y2="8.01" strokeWidth="2" />
                  <path d="M12 16v-5c0-1 1-2 2-2s2 1 2 2v5" />
                </svg>
              </a>
            )}
          </div>
        )}

        {/* ── Mapa de localização (último) ── */}
        {office.latitude != null && office.longitude != null && (
          <div className="mt-7">
            <p className="text-[#777] text-[10px] uppercase tracking-[0.12em] font-medium mb-3">
              Localização
            </p>
            <LocationMap
              latitude={office.latitude}
              longitude={office.longitude}
              name={office.name}
            />
          </div>
        )}
      </div>
    </div>
    </div>
    </>
  );
}
