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
        midnight: {
          50: '#f0f4fc',
          100: '#e1e8f8',
          200: '#c5d5f2',
          300: '#9cbbe8',
          400: '#6d9cdc',
          500: '#4c7ed0',
          600: '#3863b7',
          700: '#2f4f96',
          800: '#1C2541',
          900: '#0B132B',
          950: '#060B18',
        },
        electric: {
          50: '#eafff8',
          100: '#cbfbee',
          200: '#9bf7de',
          300: '#5eefc9',
          400: '#2be0b1',
          500: '#06D6A0',
          600: '#00af82',
          700: '#008b6a',
          800: '#036d54',
          900: '#055a47',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-teal': '0 0 25px -5px rgba(6, 214, 160, 0.35)',
        'glow-blue': '0 0 25px -5px rgba(59, 130, 246, 0.35)',
        'glass': '0 8px 32px 0 rgba(11, 19, 43, 0.08)',
      }
    },
  },
  plugins: [],
}
