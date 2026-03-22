'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { mockOffices, Office } from '@/data/mock-offices';
import OfficeSidebar from '@/components/OfficeSidebar';
import MobileCardGrid from '@/components/MobileCardGrid';

const CityScene = dynamic(() => import('@/components/CityScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-city-bg">
      <p className="text-gray-500 font-mono text-sm animate-pulse">
        Construindo a cidade...
      </p>
    </div>
  ),
});

export default function HomePage() {
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-city-bg">
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold text-white pointer-events-auto">
              escritorio<span className="text-city-gold">.ai</span>
            </h1>
            <p className="text-gray-500 text-xs font-mono mt-0.5">
              A cidade dos escritórios de advocacia
            </p>
          </div>
          <div className="flex gap-2 pointer-events-auto">
            <a
              href="/register"
              className="px-4 py-2 bg-city-gold text-city-bg font-mono text-xs font-semibold rounded-lg hover:bg-city-gold/90 transition-colors"
            >
              Registrar escritório
            </a>
          </div>
        </div>
      </div>

      {/* 3D City or Mobile fallback */}
      {isMobile ? (
        <div className="pt-20 h-full overflow-y-auto">
          <MobileCardGrid offices={mockOffices} onSelectOffice={setSelectedOffice} />
        </div>
      ) : (
        <CityScene offices={mockOffices} onSelectOffice={setSelectedOffice} />
      )}

      {/* Office sidebar */}
      <OfficeSidebar office={selectedOffice} onClose={() => setSelectedOffice(null)} />

      {/* Stats footer */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
        <p className="text-gray-600 text-xs font-mono">
          {mockOffices.length} escritórios · {mockOffices.filter((f) => f.verified).length} verificados
        </p>
      </div>
    </main>
  );
}
