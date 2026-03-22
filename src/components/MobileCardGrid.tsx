'use client';

import { Office } from '@/data/mock-offices';

interface MobileCardGridProps {
  offices: Office[];
  onSelectOffice: (office: Office) => void;
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
          className="text-left p-4 bg-city-navy/50 border border-city-navy-light rounded-lg hover:bg-city-navy transition-colors"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-heading text-sm font-semibold text-white">
                {office.name}
              </h3>
              <p className="text-gray-500 text-xs font-mono mt-0.5">
                {office.city}, {office.state}
              </p>
            </div>
            <span className="text-xs font-mono text-gray-500 shrink-0 ml-2">
              T{office.tier}
            </span>
          </div>
          <div className="flex gap-1.5 mt-2">
            {office.verified && (
              <span className="text-emerald-400 text-xs">✓</span>
            )}
            {office.chat_juridico_client && (
              <span className="text-city-gold text-xs">★ Chat Jurídico</span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
