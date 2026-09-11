/** @type {import('tailwindcss').Config} */
module.exports = {
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
            300: '#C4C9D2',
            100: '#EAEFF5',
            50: '#F4F6F9',
          },
          semantic: {
            success: '#008744',
            danger: '#D32F2F',
            warning: '#E67E22',
            info: '#0066CC',
          }
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Roboto Mono"', '"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'banorte-btn': '12px',
        'banorte-card': '16px',
        'banorte-modal': '24px',
      },
      boxShadow: {
        'banorte-card': '0 4px 20px -2px rgba(28, 30, 33, 0.06), 0 2px 6px -1px rgba(28, 30, 33, 0.04)',
        'banorte-btn': '0 8px 16px -4px rgba(235, 0, 41, 0.28)',
        'banorte-modal': '0 20px 40px -10px rgba(15, 23, 42, 0.18)',
      }
    },
  },
  plugins: [],
};
