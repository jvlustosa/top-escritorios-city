import Link from 'next/link';

export const metadata = {
  title: 'Política de Privacidade — top.escritorio.ai',
};

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-black">
      <nav className="border-b border-[#141418] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-white text-lg font-semibold tracking-tight">
            top<span className="text-[#555]">.escritorio</span><span className="text-[#888]">.ai</span>
          </Link>
          <Link href="/" className="text-[#444] text-xs hover:text-[#888] transition-colors">
            Voltar
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-14">
        <h1 className="text-white text-3xl font-semibold tracking-tight mb-2">Política de Privacidade</h1>
        <p className="text-[#555] text-sm mb-10">Última atualização: 22 de março de 2026</p>

        <div className="space-y-8 text-[#aaa] text-sm leading-relaxed">
          <section>
            <h2 className="text-white text-lg font-medium mb-3">1. Dados coletados</h2>
            <p>
              Coletamos apenas os dados fornecidos voluntariamente no cadastro: nome do escritório,
              número OAB, email de contato, endereço, redes sociais e áreas de atuação.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">2. Finalidade</h2>
            <p>
              Os dados são utilizados exclusivamente para exibir o escritório no ranking e na
              visualização 3D da cidade, além de permitir contato entre escritórios.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">3. Compartilhamento</h2>
            <p>
              Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para
              fins de marketing. Dados públicos do perfil (nome, cidade, áreas de atuação) são
              visíveis a todos os visitantes da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">4. Armazenamento</h2>
            <p>
              Os dados são armazenados em servidores seguros fornecidos pela Supabase,
              com criptografia em trânsito e em repouso.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">5. Seus direitos</h2>
            <p>
              Conforme a LGPD (Lei 13.709/2018), você pode solicitar acesso, correção ou
              exclusão dos seus dados a qualquer momento entrando em contato conosco.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">6. Cookies</h2>
            <p>
              Utilizamos apenas cookies essenciais para funcionamento da plataforma (ex:
              localStorage para preferências de tour). Não utilizamos cookies de rastreamento
              ou publicidade.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">7. Contato</h2>
            <p>
              Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em
              contato pelo email{' '}
              <span className="text-white">suporte@chatjuridico.com.br</span>.
            </p>
          </section>
        </div>

        <div className="mt-14 pt-8 border-t border-[#1a1a1a]">
          <Link href="/termos" className="text-[#555] text-sm hover:text-white transition-colors">
            ← Termos de Uso
          </Link>
        </div>
      </div>
    </main>
  );
}
