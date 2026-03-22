import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        city: {
          bg: '#0a0a0f',
          gold: '#F5C518',
          navy: '#1a1a3e',
          'navy-light': '#2a2a5e',
        },
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
