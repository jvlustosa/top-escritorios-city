'use client';

import { useState, FormEvent } from 'react';

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get('name') as string,
      city: form.get('city') as string,
      state: form.get('state') as string,
      oab_number: form.get('oab_number') as string,
      email: form.get('email') as string,
    };

    try {
      const res = await fetch('/api/offices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      // silently handle for MVP
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-city-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-4xl mb-4">🏗️</div>
          <h1 className="font-heading text-2xl font-bold text-white">
            Escritório registrado!
          </h1>
          <p className="text-gray-400 font-mono text-sm mt-3">
            Seu escritório foi adicionado à cidade em modo pendente. Para ativar
            o prédio premium, conecte sua conta Asaas.
          </p>
          <a
            href="/"
            className="mt-6 inline-block px-6 py-3 bg-city-navy hover:bg-city-navy-light border border-city-navy-light rounded-lg text-white font-mono text-sm transition-colors"
          >
            Voltar à cidade →
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-city-bg">
      {/* Nav */}
      <nav className="border-b border-city-navy-light px-6 py-4">
        <a href="/" className="font-heading text-lg font-bold text-white">
          escritorio<span className="text-city-gold">.ai</span>
        </a>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-12">
        <h1 className="font-heading text-3xl font-bold text-white">
          Registre seu escritório
        </h1>
        <p className="text-gray-400 font-mono text-sm mt-2">
          Adicione seu escritório à cidade 3D. Após o registro, conecte sua
          conta Asaas para verificação.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* Office name */}
          <div>
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-1.5">
              Nome do escritório
            </label>
            <input
              name="name"
              required
              className="w-full px-4 py-3 bg-city-navy/50 border border-city-navy-light rounded-lg text-white font-mono text-sm focus:outline-none focus:border-city-gold/50 transition-colors"
              placeholder="Ex: Silva & Associados"
            />
          </div>

          {/* City / State */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-1.5">
                Cidade
              </label>
              <input
                name="city"
                required
                className="w-full px-4 py-3 bg-city-navy/50 border border-city-navy-light rounded-lg text-white font-mono text-sm focus:outline-none focus:border-city-gold/50 transition-colors"
                placeholder="São Paulo"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-1.5">
                Estado
              </label>
              <select
                name="state"
                required
                className="w-full px-4 py-3 bg-city-navy/50 border border-city-navy-light rounded-lg text-white font-mono text-sm focus:outline-none focus:border-city-gold/50 transition-colors"
              >
                <option value="">UF</option>
                {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
          </div>

          {/* OAB number */}
          <div>
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-1.5">
              Número OAB
            </label>
            <input
              name="oab_number"
              required
              className="w-full px-4 py-3 bg-city-navy/50 border border-city-navy-light rounded-lg text-white font-mono text-sm focus:outline-none focus:border-city-gold/50 transition-colors"
              placeholder="123456/SP"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-1.5">
              Email de contato
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 bg-city-navy/50 border border-city-navy-light rounded-lg text-white font-mono text-sm focus:outline-none focus:border-city-gold/50 transition-colors"
              placeholder="contato@escritorio.com.br"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-city-gold text-city-bg font-mono text-sm font-semibold rounded-lg hover:bg-city-gold/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'Registrar escritório'}
          </button>
        </form>
      </div>
    </main>
  );
}
