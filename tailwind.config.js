/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'poly-dark': '#0f0f23',
        'poly-darker': '#080816',
        'poly-card': '#1a1a2e',
        'poly-border': '#2d2d44',
        'poly-accent': '#00d4aa',
        'poly-accent-dark': '#00a888',
        'poly-purple': '#8b5cf6',
        'poly-pink': '#ec4899',
        'poly-blue': '#3b82f6',
        'poly-orange': '#f97316',
        'poly-red': '#ef4444',
        'poly-green': '#22c55e',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 170, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 212, 170, 0.6)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(rgba(45, 45, 68, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(45, 45, 68, 0.3) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
