import { mockFirms } from '@/data/mock-firms';
import { notFound } from 'next/navigation';

const tierLabels: Record<number, string> = {
  1: 'Iniciante',
  2: 'Starter',
  3: 'Pro',
  4: 'Business',
  5: 'Enterprise',
};

export default function FirmPage({ params }: { params: { slug: string } }) {
  const firm = mockFirms.find((f) => f.slug === params.slug);

  if (!firm) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-city-bg">
      {/* Nav */}
      <nav className="border-b border-city-navy-light px-6 py-4">
        <a href="/" className="font-heading text-lg font-bold text-white">
          escritorio<span className="text-city-gold">.ai</span>
        </a>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-lg bg-city-navy border border-city-navy-light flex items-center justify-center text-2xl font-heading text-white font-bold shrink-0">
            {firm.name[0]}
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-white">
              {firm.name}
            </h1>
            <p className="text-gray-400 font-mono text-sm mt-1">
              {firm.city}, {firm.state}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-2 mt-6 flex-wrap">
          <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-mono bg-city-navy border border-city-navy-light text-gray-300">
            Tier {firm.tier} — {tierLabels[firm.tier]}
          </span>

          {firm.verified && (
            <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-mono bg-emerald-900/50 border border-emerald-700/50 text-emerald-400">
              ✓ Verificado via Asaas
            </span>
          )}

          {firm.chat_juridico_client && (
            <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-mono bg-city-gold/10 border border-city-gold/30 text-city-gold">
              ★ Powered by Chat Jurídico
            </span>
          )}
        </div>

        {/* Building visualization */}
        <div className="mt-10 p-6 bg-city-navy/30 rounded-xl border border-city-navy-light">
          <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-4">
            Representação na Cidade
          </p>
          <div className="flex items-end gap-2 h-32">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-10 rounded-t transition-all ${
                  i < firm.tier
                    ? firm.verified
                      ? 'bg-blue-500/80 shadow-lg shadow-blue-500/20'
                      : 'bg-gray-500'
                    : 'bg-gray-800'
                }`}
                style={{ height: `${(i + 1) * 24}px` }}
              />
            ))}
          </div>
          <p className="text-gray-600 text-xs font-mono mt-3">
            {firm.tier === 5
              ? 'Arranha-céu — presença máxima na cidade'
              : firm.tier >= 3
              ? 'Prédio de destaque na cidade'
              : 'Escritório em crescimento'}
          </p>
        </div>

        {/* CTA */}
        {!firm.verified && (
          <div className="mt-8 p-6 bg-city-gold/5 rounded-xl border border-city-gold/20">
            <h3 className="text-city-gold text-lg font-heading font-semibold">
              Verifique seu escritório
            </h3>
            <p className="text-gray-400 text-sm mt-2">
              Conecte sua conta Asaas para verificar seu escritório e desbloquear
              o prédio premium na cidade 3D.
            </p>
            <a
              href="/register"
              className="mt-4 inline-block px-6 py-3 bg-city-gold text-city-bg font-mono text-sm font-semibold rounded-lg hover:bg-city-gold/90 transition-colors"
            >
              Registrar agora
            </a>
          </div>
        )}

        {/* Back link */}
        <a
          href="/"
          className="mt-8 inline-block text-gray-500 hover:text-white font-mono text-sm transition-colors"
        >
          ← Voltar à cidade
        </a>
      </div>
    </main>
  );
}
