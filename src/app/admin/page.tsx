'use client';

import { useState } from 'react';
import { mockOffices, Office } from '@/data/mock-offices';

export default function AdminPage() {
  const [offices, setOffices] = useState<Office[]>(mockOffices);
  const [authed, setAuthed] = useState(false);
  const [secret, setSecret] = useState('');

  if (!authed) {
    return (
      <main className="min-h-screen bg-city-bg flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          <h1 className="font-heading text-2xl font-bold text-white text-center">
            Admin
          </h1>
          <div className="mt-6">
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full px-4 py-3 bg-city-navy/50 border border-city-navy-light rounded-lg text-white font-mono text-sm focus:outline-none focus:border-city-gold/50"
              placeholder="Admin secret"
              onKeyDown={(e) => {
                if (e.key === 'Enter') setAuthed(true);
              }}
            />
            <button
              onClick={() => setAuthed(true)}
              className="w-full mt-3 px-4 py-3 bg-city-navy hover:bg-city-navy-light border border-city-navy-light rounded-lg text-white font-mono text-sm transition-colors"
            >
              Entrar
            </button>
          </div>
        </div>
      </main>
    );
  }

  function toggleChatJuridico(id: string) {
    setOffices((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, chat_juridico_client: !f.chat_juridico_client } : f
      )
    );
  }

  function toggleVerified(id: string) {
    setOffices((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, verified: !f.verified } : f
      )
    );
  }

  return (
    <main className="min-h-screen bg-city-bg">
      <nav className="border-b border-city-navy-light px-6 py-4 flex items-center justify-between">
        <a href="/" className="font-heading text-lg font-bold text-white">
          escritorio<span className="text-city-gold">.ai</span>
          <span className="text-gray-500 text-xs ml-2 font-mono">admin</span>
        </a>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="font-heading text-2xl font-bold text-white">
          Gerenciar escritórios
        </h1>
        <p className="text-gray-500 font-mono text-sm mt-1">
          {offices.length} escritórios registrados
        </p>

        <div className="mt-6 space-y-2">
          {offices.map((office) => (
            <div
              key={office.id}
              className="flex items-center justify-between p-4 bg-city-navy/30 border border-city-navy-light rounded-lg"
            >
              <div className="min-w-0">
                <h3 className="font-heading text-sm font-semibold text-white truncate">
                  {office.name}
                </h3>
                <p className="text-gray-500 text-xs font-mono">
                  {office.city}, {office.state} · Tier {office.tier}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-4">
                {/* Verified toggle */}
                <button
                  onClick={() => toggleVerified(office.id)}
                  className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                    office.verified
                      ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-700/50'
                      : 'bg-gray-800 text-gray-500 border border-gray-700'
                  }`}
                >
                  {office.verified ? '✓ Verificado' : 'Não verificado'}
                </button>

                {/* Chat Jurídico toggle */}
                <button
                  onClick={() => toggleChatJuridico(office.id)}
                  className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                    office.chat_juridico_client
                      ? 'bg-city-gold/10 text-city-gold border border-city-gold/30'
                      : 'bg-gray-800 text-gray-500 border border-gray-700'
                  }`}
                >
                  {office.chat_juridico_client
                    ? '★ Chat Jurídico'
                    : 'Sem Chat Jurídico'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
