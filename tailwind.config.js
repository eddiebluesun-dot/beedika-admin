/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        honey:   { DEFAULT: '#F5A623', light: '#FFD073', dark: '#C47D00' },
        dark:    { DEFAULT: '#0D0F14', 800: '#13161E', 700: '#1A1E28', 600: '#222737', 500: '#2D3347' },
        slate:   { custom: '#8892A4' },
      },
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        body:    ['var(--font-dm-sans)', 'sans-serif'],
        mono:    ['var(--font-dm-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
