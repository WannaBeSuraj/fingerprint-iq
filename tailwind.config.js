/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['Space Mono', 'monospace'],
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        accent: '#00ffb4',
        accent2: '#00c8ff',
        accent3: '#7b4fff',
        danger: '#ff4444',
        warn: '#ff6b35',
        panel: '#111827',
        panel2: '#161f33',
      },
    },
  },
  plugins: [],
}
