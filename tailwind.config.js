/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        primary: {
          50: '#E8F5EE',
          100: '#C6E5D3',
          300: '#7BC49E',
          500: '#4A9F7E',
          700: '#2D7A5C',
          900: '#1A4D38',
          DEFAULT: '#4A9F7E',
        },
        neutral: {
          0: '#FFFFFF',
          50: '#F8F9FA',
          100: '#F1F3F5',
          200: '#E9ECEF',
          400: '#ADB5BD',
          600: '#6C757D',
          800: '#343A40',
          900: '#212529',
        },
        semantic: {
          success: '#28A745',
          warning: '#FFC107',
          error: '#DC3545',
          info: '#17A2B8',
        },
        nutrient: {
          carbs: '#FF9F43',
          protein: '#5F9DF7',
          fat: '#FFD93D',
          fiber: '#6BCB77',
        },
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        card: '0 2px 8px rgba(0,0,0,0.08)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.12)',
        modal: '0 8px 32px rgba(0,0,0,0.16)',
        fab: '0 4px 12px rgba(74,159,126,0.3)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Roboto', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'heading-xl': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-lg': ['24px', { lineHeight: '1.25', fontWeight: '600' }],
        'heading-md': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-sm': ['17px', { lineHeight: '1.35', fontWeight: '600' }],
        'body-lg': ['17px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-md': ['15px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['11px', { lineHeight: '1.4', fontWeight: '400' }],
        'number-xl': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
        'number-lg': ['32px', { lineHeight: '1.2', fontWeight: '600' }],
      },
      spacing: {
        '18': '72px',
        '22': '88px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
