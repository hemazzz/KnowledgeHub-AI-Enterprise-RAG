/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base': '#060b18',
        'bg-panel': '#0a1628',
        'bg-card': '#0f1e35',
        'bg-card2': '#111f38',
        border: '#1a2d4d',
        'border2': '#1f3660',
        purple: '#8b5cf6',
        'purple2': '#a78bfa',
        blue: '#3b82f6',
        'blue2': '#60a5fa',
        teal: '#14b8a6',
        'teal2': '#2dd4bf',
        pink: '#ec4899',
        txt: '#e2e8f0',
        'txt2': '#94a3b8',
        'txt3': '#64748b',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'orb-float': 'orbFloat 3s ease-in-out infinite',
        'pulse-purple': 'pulsePurple 2s infinite',
      },
      keyframes: {
        orbFloat: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulsePurple: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
    },
  },
  plugins: [],
}
