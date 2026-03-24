/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'gold-accent': 'var(--gold-accent)',
        'gold': {
          DEFAULT: '#F59E0B',
          dark: '#D97706',
          muted: 'var(--gold-muted)',
        },
        canvas: 'var(--bg-canvas)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Barlow Condensed', 'sans-serif'],
      },
      letterSpacing: {
        'ultra': '0.5em',
        'extreme': '0.35em',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #f59e0b, #d97706)',
      },
      boxShadow: {
        'gold': '0 0 24px rgba(245,158,11,0.25)',
        'gold-strong': '0 0 40px rgba(245,158,11,0.40)',
        'surface': '0 4px 32px rgba(0,0,0,0.5)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '250ms',
        slow: '400ms',
        slower: '700ms',
      },
      transitionTimingFunction: {
        'ease-spring': 'cubic-bezier(0.34,1.56,0.64,1)',
        'ease-motion': 'cubic-bezier(0.4,0,0.2,1)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      animation: {
        'ticker': 'scrollTicker 60s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        scrollTicker: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [],
}
