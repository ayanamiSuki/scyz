/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cockpit: {
          bg: '#030d1e',
          panel: 'rgba(6, 26, 56, 0.78)',
          header: 'rgba(10, 42, 86, 0.85)',
          border: 'rgba(0, 180, 255, 0.28)',
          cyan: '#00e5ff',
          blue: '#1e90ff',
          text: '#e2f1ff',
          muted: '#7da2c8',
          success: '#22c55e',
          warning: '#f59e0b',
          danger: '#ef4444'
        }
      },
      fontFamily: {
        din: ['"DIN Alternate"', '"Oswald"', '"Roboto Condensed"', '"Microsoft YaHei"', 'sans-serif'],
        sans: ['"PingFang SC"', '"Microsoft YaHei"', 'sans-serif']
      }
    },
  },
  plugins: [],
}

