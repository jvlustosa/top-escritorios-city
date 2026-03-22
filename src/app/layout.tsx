import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'escritorio.ai — A cidade dos escritórios',
  description:
    'Uma cidade 3D interativa onde cada escritório de advocacia brasileiro é um prédio.',
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
