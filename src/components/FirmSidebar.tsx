'use client';

import { Firm } from '@/data/mock-firms';

interface FirmSidebarProps {
  firm: Firm | null;
  onClose: () => void;
}

const tierLabels: Record<number, string> = {
  1: 'Iniciante',
  2: 'Starter',
  3: 'Pro',
  4: 'Business',
  5: 'Enterprise',
};

export default function FirmSidebar({ firm, onClose }: FirmSidebarProps) {
  if (!firm) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-city-bg/95 border-l border-city-navy-light backdrop-blur-md z-50 overflow-y-auto">
      <div className="p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Firm name */}
        <h2 className="font-heading text-2xl font-bold text-white mt-2 pr-8">
          {firm.name}
        </h2>

        {/* Location */}
        <p className="text-gray-400 font-mono text-sm mt-1">
          {firm.city}, {firm.state}
        </p>

        {/* Badges */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {/* Tier badge */}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono bg-city-navy border border-city-navy-light text-gray-300">
            Tier {firm.tier} — {tierLabels[firm.tier]}
          </span>

          {/* Verified badge */}
          {firm.verified && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono bg-emerald-900/50 border border-emerald-700/50 text-emerald-400">
              ✓ Verificado
            </span>
          )}

          {/* Chat Jurídico badge */}
          {firm.chat_juridico_client && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono bg-city-gold/10 border border-city-gold/30 text-city-gold">
              ★ Chat Jurídico
            </span>
          )}
        </div>

        {/* Building visualization */}
        <div className="mt-8 p-4 bg-city-navy/30 rounded-lg border border-city-navy-light">
          <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-3">
            Porte do Escritório
          </p>
          <div className="flex items-end gap-1 h-20">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-6 rounded-t transition-all ${
                  i < firm.tier
                    ? firm.verified
                      ? 'bg-blue-500/80'
                      : 'bg-gray-500'
                    : 'bg-gray-800'
                }`}
                style={{ height: `${(i + 1) * 16}px` }}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        {!firm.verified && (
          <div className="mt-6 p-4 bg-city-gold/5 rounded-lg border border-city-gold/20">
            <p className="text-city-gold text-sm font-heading font-semibold">
              Escritório não verificado
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Verifique seu escritório conectando sua conta Asaas para desbloquear
              o prédio premium.
            </p>
          </div>
        )}

        {/* Link to full profile */}
        <a
          href={`/firm/${firm.slug}`}
          className="mt-6 block w-full text-center px-4 py-3 bg-city-navy hover:bg-city-navy-light border border-city-navy-light rounded-lg text-white font-mono text-sm transition-colors"
        >
          Ver perfil completo →
        </a>
      </div>
    </div>
  );
}
