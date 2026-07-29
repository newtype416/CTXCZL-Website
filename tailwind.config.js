/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#FFF8F0',
          100: '#FFEDD5',
          200: '#FFD6A8',
          300: '#FFB974',
          400: '#FF9C4A',
          500: '#FF7E2E',
          600: '#E6601A',
          700: '#CC4A12',
          800: '#A63816',
          900: '#852E15'
        },
        cream: '#f7dfa5',
        sand: '#F5E6D3',
        coral: '#FF7E5F'
      },
      fontFamily: {
        display: ['"Noto Serif SC"', 'Georgia', 'serif'],
        body: ['"Noto Sans SC"', '"PingFang SC"', 'system-ui', 'sans-serif']
      },
      animation: {
        'fade-up': 'fadeUp 0.8s ease-out forwards',
        'fade-in': 'fadeIn 1s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'word-cloud': 'wordFloat 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 4s ease-in-out infinite'
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        wordFloat: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-5px) scale(1.05)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        }
      }
    }
  },
  plugins: []
};
