'use client';

import { useState } from 'react';
import { mockOffices, Office } from '@/data/mock-offices';

export default function AdminPage() {
  const [offices, setOffices] = useState<Office[]>(mockOffices);
  const [authed, setAuthed] = useState(false);
  const [secret, setSecret] = useState('');

  if (!authed) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          <h1 className="text-white text-2xl font-semibold text-center">
            Admin
          </h1>
          <div className="mt-6">
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full px-4 py-3 bg-black border border-[#222] text-white text-sm focus:outline-none focus:border-[#555] placeholder-[#444]"
              placeholder="Admin secret"
              onKeyDown={(e) => {
                if (e.key === 'Enter') setAuthed(true);
              }}
            />
            <button
              onClick={() => setAuthed(true)}
              className="w-full mt-3 px-4 py-3 bg-white text-black text-sm font-medium hover:bg-[#e0e0e0] transition-colors"
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
      prev.map((o) => (o.id === id ? { ...o, chat_juridico_client: !o.chat_juridico_client } : o))
    );
  }

  function toggleVerified(id: string) {
    setOffices((prev) =>
      prev.map((o) => (o.id === id ? { ...o, verified: !o.verified } : o))
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <nav className="border-b border-[#222] px-6 py-4">
        <a href="/" className="text-white text-lg font-semibold tracking-tight">
          top<span className="text-[#555]">.escritorio</span><span className="text-[#888]">.ai</span>
          <span className="text-[#555] text-xs ml-2">admin</span>
        </a>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-white text-2xl font-semibold">
          Gerenciar escritórios
        </h1>
        <p className="text-[#555] text-sm mt-1">
          {offices.length} escritórios registrados
        </p>

        <div className="mt-6 divide-y divide-[#222]">
          {offices.map((office) => (
            <div
              key={office.id}
              className="flex items-center justify-between py-4"
            >
              <div className="min-w-0">
                <h3 className="text-white text-sm font-medium truncate">
                  {office.name}
                </h3>
                <p className="text-[#555] text-xs mt-0.5">
                  {office.city}, {office.state} · Tier {office.tier}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button
                  onClick={() => toggleVerified(office.id)}
                  className={`px-3 py-1.5 text-xs transition-colors border ${
                    office.verified
                      ? 'border-[#333] text-white'
                      : 'border-[#222] text-[#555]'
                  }`}
                >
                  {office.verified ? '✓ Verificado' : 'Não verificado'}
                </button>

                <button
                  onClick={() => toggleChatJuridico(office.id)}
                  className={`px-3 py-1.5 text-xs transition-colors border ${
                    office.chat_juridico_client
                      ? 'border-[#333] text-white'
                      : 'border-[#222] text-[#555]'
                  }`}
                >
                  {office.chat_juridico_client ? 'Chat Jurídico' : 'Sem Chat'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
