/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Pretendard',
          'Pretendard Variable',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Apple SD Gothic Neo',
          'Malgun Gothic',
          'sans-serif',
        ],
      },
      colors: {
        ink: {
          950: '#08060f',
          900: '#0d0a18',
          850: '#12101f',
          800: '#171426',
          700: '#221d34',
          600: '#302a48',
        },
        neon: {
          300: '#c4b5ff',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        lime: {
          300: '#d9f99d',
          400: '#bef264',
          500: '#a3e635',
        },
        hot: {
          400: '#fb7185',
          500: '#f43f5e',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(167,139,250,0.25), 0 18px 50px -20px rgba(139,92,246,0.55)',
        card: '0 1px 0 rgba(255,255,255,0.06) inset, 0 18px 40px -28px rgba(0,0,0,0.9)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'sheet-up': { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        pop: {
          '0%': { transform: 'scale(0.92)' },
          '60%': { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.25)', opacity: '0' },
          '100%': { transform: 'scale(1.25)', opacity: '0' },
        },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-in': 'fade-in 180ms ease-out',
        'slide-up': 'slide-up 240ms cubic-bezier(0.22,1,0.36,1)',
        'sheet-up': 'sheet-up 280ms cubic-bezier(0.22,1,0.36,1)',
        pop: 'pop 300ms ease-out',
        'pulse-ring': 'pulse-ring 1.6s cubic-bezier(0.2,0.6,0.3,1) infinite',
      },
    },
  },
  plugins: [],
};
