/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        satoshi: ['Satoshi', 'sans-serif'],
      },
      animation: {
        'slide-horizontal': 'slide-horizontal 30s linear infinite',
        'marquee': 'marquee 20s linear infinite',
        'music-bar-1': 'music-bar-1 0.6s ease-in-out infinite',
        'music-bar-2': 'music-bar-2 0.7s ease-in-out infinite',
        'music-bar-3': 'music-bar-3 0.5s ease-in-out infinite',
      },
      keyframes: {
        'slide-horizontal': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'music-bar-1': {
          '0%, 100%': { height: '4px' },
          '50%': { height: '20px' },
        },
        'music-bar-2': {
          '0%, 100%': { height: '8px' },
          '50%': { height: '28px' },
        },
        'music-bar-3': {
          '0%, 100%': { height: '12px' },
          '50%': { height: '24px' },
        },
      },
    },
  },
  plugins: [],
};
