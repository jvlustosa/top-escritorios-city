export interface PracticeArea {
  id: string;
  label: string;
  /** SVG path data for a 24x24 viewBox icon */
  icon: string;
}

export const PRACTICE_AREAS: PracticeArea[] = [
  {
    id: 'civil',
    label: 'Direito Civil',
    icon: 'M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16',
  },
  {
    id: 'trabalhista',
    label: 'Trabalhista',
    icon: 'M20 7h-4V4a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3H4a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a1 1 0 0 0-1-1zM10 5h4v2h-4z',
  },
  {
    id: 'penal',
    label: 'Direito Penal',
    icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  },
  {
    id: 'tributario',
    label: 'Tributário',
    icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  },
  {
    id: 'empresarial',
    label: 'Empresarial',
    icon: 'M2 20h20M6 20V8l6-4 6 4v12M10 20v-4h4v4M10 12h4M10 16h4',
  },
  {
    id: 'consumidor',
    label: 'Consumidor',
    icon: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0',
  },
  {
    id: 'imobiliario',
    label: 'Imobiliário',
    icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10',
  },
  {
    id: 'digital',
    label: 'Direito Digital',
    icon: 'M20 4H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM8 20h8M12 18v2',
  },
  {
    id: 'previdenciario',
    label: 'Previdenciário',
    icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  },
  {
    id: 'ambiental',
    label: 'Ambiental',
    icon: 'M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75',
  },
  {
    id: 'familia',
    label: 'Família',
    icon: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  },
  {
    id: 'administrativo',
    label: 'Administrativo',
    icon: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7',
  },
];

export function getPracticeAreaById(id: string): PracticeArea | undefined {
  return PRACTICE_AREAS.find((a) => a.id === id);
}
