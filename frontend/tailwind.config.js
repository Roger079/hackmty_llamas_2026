/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        banorte: {
          red: {
            DEFAULT: '#EB0029',
            hover: '#C70023',
            dark: '#9E001B',
            light: '#FFF0F2',
            subtle: '#FDE2E4',
          },
          gold: {
            DEFAULT: '#C59B27',
            light: '#F6E8B7',
            dark: '#936F11',
          },
          graphite: {
            900: '#1C1E21',
            800: '#2C3036',
            700: '#4A515E',
            500: '#7A8290',
            200: '#E2E6EC',
            100: '#EAEFF5',
            50: '#F4F6F9',
          }
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        mono: ['"Roboto Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
