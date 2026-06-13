/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        sans: ['Noto Sans SC', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dae6ff',
          500: '#5b6ef0',
          600: '#4c57e6',
          700: '#3d46d1',
          900: '#1e2a6a',
        },
      },
      boxShadow: {
        soft: '0 2px 14px rgba(15, 23, 42, 0.06)',
        card: '0 4px 20px rgba(15, 23, 42, 0.05)',
        glow: '0 0 24px rgba(99, 102, 241, 0.25)',
      },
      borderRadius: {
        xl2: '14px',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
      },
    },
  },
  plugins: [],
};
