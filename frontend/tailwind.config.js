/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#020617', 900: '#0f172a', 850: '#111827',
          800: '#1e293b', 750: '#243247', 700: '#334155',
          600: '#475569', 500: '#64748b', 400: '#94a3b8',
          300: '#cbd5e1', 200: '#e2e8f0',
        },
        lime: { 400: '#a3e635', 300: '#bef264', neon: '#deff9a', bright: '#ccff66' },
        success: '#22c55e', danger: '#ef4444', warning: '#f59e0b', info: '#38bdf8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon-sm': '0 0 8px rgba(222,255,154,0.35)',
        'neon-md': '0 0 20px rgba(222,255,154,0.45)',
        'card': '0 4px 24px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(135deg, #deff9a 0%, #a3e635 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'flash': 'flash 0.5s ease-in-out 3',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0', transform: 'translate3d(0, 8px, 0)' }, '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' } },
        slideUp: { '0%': { opacity: '0', transform: 'translate3d(0, 20px, 0)' }, '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' } },
        pulseNeon: { '0%,100%': { boxShadow: '0 0 8px rgba(222,255,154,0.3)' }, '50%': { boxShadow: '0 0 24px rgba(222,255,154,0.7)' } },
        flash: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.3' } },
      },
    },
  },
  plugins: [],
}
