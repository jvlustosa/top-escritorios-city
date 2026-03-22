import { mockOffices } from '@/data/mock-offices';
import { notFound } from 'next/navigation';

const tierLabels: Record<number, string> = {
  1: 'Iniciante',
  2: 'Starter',
  3: 'Pro',
  4: 'Business',
  5: 'Enterprise',
};

export default function OfficePage({ params }: { params: { slug: string } }) {
  const office = mockOffices.find((o) => o.slug === params.slug);

  if (!office) {
    notFound();
  }

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
            <p className="text-[#666] text-sm mt-1">
              {office.city}, {office.state}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-2 mt-6 flex-wrap">
          <span className="px-3 py-1.5 border border-[#333] text-[#888] text-xs">
            Tier {office.tier} — {tierLabels[office.tier]}
          </span>

          {office.verified && (
            <span className="px-3 py-1.5 border border-[#333] text-white text-xs">
              Verificado
            </span>
          )}

          {office.chat_juridico_client && (
            <span className="px-3 py-1.5 border border-[#333] text-white text-xs">
              Chat Jurídico
            </span>
          )}
        </div>

        {/* Building visualization */}
        <div className="mt-10 pt-8 border-t border-[#222]">
          <p className="text-[#555] text-xs uppercase tracking-widest mb-4">
            Representação na Cidade
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
          <p className="text-[#444] text-xs mt-3">
            {office.tier === 5
              ? 'Presença máxima — arranha-céu na cidade'
              : office.tier >= 3
              ? 'Prédio de destaque na cidade'
              : 'Escritório em crescimento'}
          </p>
        </div>

        {/* CTA */}
        {!office.verified && (
          <div className="mt-8 p-6 border border-[#222]">
            <h3 className="text-white text-lg font-semibold">
              Verifique seu escritório
            </h3>
            <p className="text-[#555] text-sm mt-2 leading-relaxed">
              Conecte sua conta Asaas para verificar seu escritório e desbloquear
              o prédio premium na cidade 3D.
            </p>
            <a
              href="/register"
              className="mt-4 inline-block px-6 py-3 bg-white text-black text-sm font-medium hover:bg-[#e0e0e0] transition-colors"
            >
              Registrar agora
            </a>
          </div>
        )}

        <a
          href="/"
          className="mt-8 inline-block text-[#555] hover:text-white text-sm transition-colors"
        >
          ← Voltar à cidade
        </a>
      </div>
    </main>
  );
}
