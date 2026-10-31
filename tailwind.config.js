/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: '#F5F4F8',
        brand: {
          50: '#FAF7FB',
          100: '#F3EDF5',
          200: '#E6DAEA',
          300: '#D1BED7',
          400: '#AA82B2',
          500: '#824987',
          600: '#68356D',
          700: '#542858',
          800: '#442646', // Dribbble SilentPing executive plum
          900: '#341B36',
          950: '#231125',
        },
        pill: {
          progressBg: '#EDE5F0',
          progressText: '#552B58',
          pendingBg: '#FDF0E6',
          pendingText: '#C06A28',
          resolvedBg: '#E8F6ED',
          resolvedText: '#247A48',
          rejectedBg: '#FCECEE',
          rejectedText: '#B92F45',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(44, 25, 48, 0.04), 0 2px 6px -1px rgba(44, 25, 48, 0.02)',
        'card-hover': '0 12px 28px -4px rgba(44, 25, 48, 0.08), 0 4px 10px -2px rgba(44, 25, 48, 0.04)',
        'float': '0 16px 36px -4px rgba(44, 25, 48, 0.12)',
      }
    },
  },
  plugins: [],
}
