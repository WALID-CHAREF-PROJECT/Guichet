/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7'
        },
        accent: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706'
        }
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(125,211,252,0.2), 0 18px 45px rgba(2, 6, 23, 0.55)',
        glass: '0 20px 40px rgba(2, 6, 23, 0.55)'
      }
    }
  },
  plugins: []
};
