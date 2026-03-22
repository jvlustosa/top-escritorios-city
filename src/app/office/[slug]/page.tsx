import { getServiceSupabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { PRACTICE_AREAS } from '@/data/practice-areas';
import LocationMapWrapper from './LocationMapWrapper';

const tierLabels: Record<number, string> = {
  1: 'Iniciante',
  2: 'Starter',
  3: 'Pro',
  4: 'Business',
  5: 'Enterprise',
};

/** Simple CSS building block used in the tier comparison */
function TierBuilding({ tier, verified, label }: { tier: number; verified: boolean; label: string }) {
  const height = tier * 28 + 20;
  const color = verified ? '#ffffff' : '#555';
  const borderColor = verified ? '#666' : '#333';
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-16 border"
        style={{
          height: `${height}px`,
          backgroundColor: color,
          borderColor,
          opacity: verified ? 1 : 0.5,
        }}
      >
        {/* Windows */}
        <div className="h-full flex flex-col justify-evenly items-center py-2">
          {Array.from({ length: Math.min(tier, 4) }).map((_, i) => (
            <div
              key={i}
              className="w-6 h-2"
              style={{ backgroundColor: verified ? '#000' : '#333' }}
            />
          ))}
        </div>
      </div>
      <p className="text-[10px] text-center leading-tight max-w-[100px]" style={{ color: verified ? '#ccc' : '#777' }}>
        {label}
      </p>
    </div>
  );
}

export default async function OfficePage({ params }: { params: { slug: string } }) {
  const supabase = getServiceSupabase();
  const { data: office, error } = await supabase
    .from('offices')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (error || !office) {
    notFound();
  }

  const nextTier = Math.min((office.tier ?? 1) + 1, 5);

  return (
    <main className="min-h-screen bg-black">
      <nav className="border-b border-[#222] px-6 py-4">
        <a href="/" className="text-white text-lg font-semibold tracking-tight">
          top<span className="text-[#555]">.escritorio</span><span className="text-[#888]">.ai</span>
        </a>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 border border-[#333] flex items-center justify-center text-xl font-semibold text-white shrink-0">
            {office.name[0]}
          </div>
          <div>
            <h1 className="text-white text-3xl font-semibold tracking-tight">
              {office.name}
            </h1>
            <p className="text-[#999] text-sm mt-1">
              {office.city}, {office.state}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-2 mt-6 flex-wrap">
          <span className="px-3 py-1.5 border border-[#333] text-[#999] text-xs">
            Tier {office.tier} — {tierLabels[office.tier]}
          </span>

          {office.verified && (
            <span className="px-3 py-1.5 border border-[#333] text-white text-xs">
              Verificado
            </span>
          )}

          {office.chat_juridico_client && (
            <span className="px-3 py-1.5 border border-[#333] text-white text-xs">
              Chat Juridico
            </span>
          )}
        </div>

        {/* Practice Areas */}
        {office.practice_areas && office.practice_areas.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#222]">
            <p className="text-[#777] text-xs uppercase tracking-widest mb-3">
              Areas de atuacao
            </p>
            <div className="flex flex-wrap gap-2">
              {office.practice_areas.map((areaId: string) => {
                const area = PRACTICE_AREAS.find((a) => a.id === areaId);
                if (!area) return null;
                return (
                  <span
                    key={areaId}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#111] border border-[#222] text-[11px] text-[#999]"
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

        {/* Social Links */}
        {(office.instagram_url || office.linkedin_url) && (
          <div className="mt-6 flex gap-4">
            {office.instagram_url && (
              <a
                href={office.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#777] hover:text-white text-sm transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                Instagram
              </a>
            )}
            {office.linkedin_url && (
              <a
                href={office.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#777] hover:text-white text-sm transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                LinkedIn
              </a>
            )}
          </div>
        )}

        {/* Building visualization */}
        <div className="mt-10 pt-8 border-t border-[#222]">
          <p className="text-[#777] text-xs uppercase tracking-widest mb-4">
            Representacao na Cidade
          </p>
          <div className="flex items-end gap-2 h-32">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-10 transition-all"
                style={{
                  height: `${(i + 1) * 24}px`,
                  backgroundColor: i < office.tier
                    ? office.verified ? '#ffffff' : '#444444'
                    : '#111111',
                }}
              />
            ))}
          </div>
          <p className="text-[#777] text-xs mt-3">
            {office.tier === 5
              ? 'Presenca maxima — arranha-ceu na cidade'
              : office.tier >= 3
              ? 'Predio de destaque na cidade'
              : 'Escritorio em crescimento'}
          </p>
        </div>

        {/* Upgrade CTA — side-by-side tier comparison for unverified offices */}
        {!office.verified && (
          <div className="mt-8 p-6 border border-[#222] bg-[#0a0a0a]">
            <h3 className="text-white text-lg font-semibold">
              Verifique seu escritorio
            </h3>
            <p className="text-[#777] text-sm mt-2 leading-relaxed">
              Conecte sua conta Asaas para verificar seu escritorio e desbloquear
              o predio premium na cidade 3D.
            </p>

            {/* Side-by-side tier comparison */}
            <div className="mt-6 flex items-end justify-center gap-12">
              <TierBuilding
                tier={office.tier}
                verified={false}
                label="Seu predio atual"
              />
              <div className="flex flex-col items-center mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
              <TierBuilding
                tier={nextTier}
                verified={true}
                label="Com verificacao Asaas"
              />
            </div>

            <a
              href="/register"
              className="mt-6 inline-block px-6 py-3 bg-white text-black text-sm font-medium hover:bg-[#e0e0e0] transition-colors"
            >
              Verificar agora
            </a>
          </div>
        )}

        {/* Location Map */}
        {office.latitude != null && office.longitude != null && (
          <div className="mt-10 pt-8 border-t border-[#222]">
            <p className="text-[#777] text-xs uppercase tracking-widest mb-4">
              Localizacao
            </p>
            <LocationMapWrapper
              latitude={office.latitude}
              longitude={office.longitude}
              name={office.name}
            />
          </div>
        )}

        <a
          href="/"
          className="mt-8 inline-block text-[#777] hover:text-white text-sm transition-colors"
        >
          ← Voltar a cidade
        </a>
      </div>
    </main>
  );
}
