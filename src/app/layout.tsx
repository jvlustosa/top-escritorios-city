import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'top.escritorio.ai — Ranking dos Escritórios Mais Digitais',
  description:
    'Ranking interativo 3D dos escritórios de advocacia mais digitais do Brasil, com faturamento verificado via Asaas.',
  metadataBase: new URL('https://top.escritorio.ai'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
