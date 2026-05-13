/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#050505',
        surface: '#111111',
        'surface-elevated': '#1A1A1A',
        primary: '#0033FF',
        'accent-success': '#00FF66',
        'accent-warning': '#E2F13C',
        'accent-danger': '#FF3B30',
        hover: '#222222',
      },
      fontFamily: {
        heading: ['Chivo', 'system-ui', 'sans-serif'],
        body: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
