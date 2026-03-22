'use client';

import { RankedOffice } from '@/data/mock-offices';

interface MobileCardGridProps {
  offices: RankedOffice[];
  onSelectOffice: (office: RankedOffice) => void;
}

const tierLabels: Record<number, string> = {
  1: 'Iniciante',
  2: 'Starter',
  3: 'Pro',
  4: 'Business',
  5: 'Enterprise',
};

export default function MobileCardGrid({ offices, onSelectOffice }: MobileCardGridProps) {
  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {offices.map((office) => (
        <button
          key={office.id}
          onClick={() => onSelectOffice(office)}
          className={`text-left p-4 bg-[#0a0a0a] border rounded-lg active:bg-[#111] transition-colors group ${
            office.is_plus ? 'border-amber-600/40' : 'border-[#1e1e1e]'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {office.rank != null ? (
                <span className="text-[#3a3a3a] text-2xl font-bold tabular-nums w-8 text-right select-none">
                  {office.rank}
                </span>
              ) : (
                <span className="text-[#222] text-2xl font-bold w-8 text-right select-none">—</span>
              )}
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">
                  {office.name}
                </h3>
                <p className="text-[#666] text-xs mt-0.5">
                  {office.city}, {office.state}
                </p>
              </div>
            </div>
            {/* Chevron — signals tappability */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#333] group-active:text-[#666] flex-shrink-0 mt-1 ml-2 transition-colors">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
          <div className="flex gap-1.5 mt-2.5 ml-11 flex-wrap">
            {office.verified ? (
              <span className="px-2 py-0.5 bg-emerald-950/40 text-emerald-400 text-[10px] rounded-full">
                Verificado
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-[#1a1a1a] text-[#555] text-[10px] rounded-full">
                Não verificado
              </span>
            )}
            <span className="px-2 py-0.5 bg-[#1a1a1a] text-[#888] text-[10px] rounded-full">
              {tierLabels[office.tier]}
            </span>
            {office.chat_juridico_client && (
              <span className="px-2 py-0.5 bg-[#1a1a1a] text-[#888] text-[10px] rounded-full">
                Chat Juridico
              </span>
            )}
            {office.is_plus && (
              <span className="px-2 py-0.5 bg-amber-950/30 text-amber-500 text-[10px] font-medium rounded-full">
                Plus
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
