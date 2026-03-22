import Link from 'next/link';

export const metadata = {
  title: 'Termos de Uso — top.escritorio.ai',
};

export default function TermosPage() {
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
        <h1 className="text-white text-3xl font-semibold tracking-tight mb-2">Termos de Uso</h1>
        <p className="text-[#555] text-sm mb-10">Última atualização: 22 de março de 2026</p>

        <div className="space-y-8 text-[#aaa] text-sm leading-relaxed">
          <section>
            <h2 className="text-white text-lg font-medium mb-3">1. Aceitação</h2>
            <p>
              Ao acessar e utilizar a plataforma top.escritorio.ai, você concorda com estes termos.
              Se não concordar, não utilize o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">2. Descrição do serviço</h2>
            <p>
              A plataforma exibe um ranking interativo de escritórios de advocacia em formato de
              cidade 3D. O cadastro é gratuito e permite que escritórios sejam listados no mapa.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">3. Cadastro</h2>
            <p>
              Ao registrar seu escritório, você declara que as informações fornecidas são
              verdadeiras e que possui autorização para representar o escritório cadastrado.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">4. Uso adequado</h2>
            <p>
              Você se compromete a não utilizar a plataforma para fins ilícitos, não inserir
              informações falsas e não tentar acessar dados de outros usuários de forma não autorizada.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">5. Propriedade intelectual</h2>
            <p>
              Todo o conteúdo da plataforma, incluindo código, design e visualizações 3D, é de
              propriedade exclusiva da top.escritorio.ai e seus licenciadores.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">6. Limitação de responsabilidade</h2>
            <p>
              A plataforma é fornecida &quot;como está&quot;. Não garantimos disponibilidade
              ininterrupta, precisão dos dados de ranking ou adequação a qualquer finalidade específica.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">7. Alterações</h2>
            <p>
              Reservamo-nos o direito de alterar estes termos a qualquer momento. Alterações
              significativas serão comunicadas na plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">8. Contato</h2>
            <p>
              Dúvidas sobre estes termos podem ser enviadas para{' '}
              <span className="text-white">suporte@chatjuridico.com.br</span>.
            </p>
          </section>
        </div>

        <div className="mt-14 pt-8 border-t border-[#1a1a1a]">
          <Link href="/privacidade" className="text-[#555] text-sm hover:text-white transition-colors">
            Política de Privacidade →
          </Link>
        </div>
      </div>
    </main>
  );
}
