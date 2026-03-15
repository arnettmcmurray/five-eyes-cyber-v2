/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#F59E0B',
          dark: '#D97706',
        },
      },
    },
  },
  plugins: [],
}
