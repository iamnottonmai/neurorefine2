import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#030712',
          900: '#060d1f',
          800: '#0a1628',
          700: '#0f2040',
        },
        cyan: {
          400: '#22d3ee',
          300: '#67e8f9',
          500: '#06b6d4',
        },
        violet: {
          600: '#7c3aed',
          500: '#8b5cf6',
        }
      },
      fontFamily: {
        display: ['var(--font-bebas)', 'cursive'],
        body: ['var(--font-barlow)', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 3s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        glow: {
          '0%': { textShadow: '0 0 10px #22d3ee, 0 0 20px #22d3ee' },
          '100%': { textShadow: '0 0 20px #22d3ee, 0 0 40px #22d3ee, 0 0 60px #22d3ee' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
