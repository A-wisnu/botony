/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'space-dark': '#0B0D17',
        'space-deep': '#151932',
        'space-card': 'rgba(255, 255, 255, 0.1)',
        'accent-purple': '#6C63FF',
        'accent-blue': '#4CC9F0',
        'accent-pink': '#F72585',
        'accent-orange': '#FF9E00',
      },
      fontFamily: {
        sans: ['Quicksand', 'Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
