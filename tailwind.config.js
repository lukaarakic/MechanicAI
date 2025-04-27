/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        white: '#f1f1f1',
        black: '#0e0e11',
        'light-gray': '#18181b',
        // red: '#cf3d33',
        'light-red': '#e2564c',
        green: '#5ef2b8',

        'blue-50': '#edfaff',
        'blue-100': '#d6f2ff',
        'blue-200': '#b5eaff',
        'blue-300': '#83dfff',
        'blue-400': '#48cbff',
        'blue-500': '#1eadff',
        'blue-600': '#068fff',
        'blue-700': '#007bff',
        'blue-800': '#085ec5',
        'blue-900': '#0d519b',
        'blue-950': '#0e315d',
      },
      borderRadius: {
        12: '12px',
        7: '7px',
      },
      spacing: {
        120: '7.5rem',
        100: '6.25rem',
        85: '5.313rem',
        80: '5rem;',
        70: '4.375rem',
        64: '4rem;',
        60: '3.75rem',
        55: '3.438rem',
        50: '3.125rem',
        45: '2.813rem',
        40: '2.5rem',
        35: '2.188rem',
        30: '1.875rem',
        25: '1.563rem',
        20: '1.25rem',
        15: '0.938rem',
        10: '0.625rem',
        5: '0.313rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'spin-slow': 'spin 10s linear infinite',
      },
      boxShadow: {
        small: '0px 4px 4px rgba(0, 0, 0, 0.25)',
      },
      fontSize: {
        64: '4rem',
        45: '2.813rem',
        40: '2.5rem',
        25: '1.563rem',
        18: '1.125rem',
        16: '1rem',
        14: '0.875rem',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
