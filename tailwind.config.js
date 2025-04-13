/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          500: '#FF7F5C',
          600: '#FF6B44',
        },
      },
    },
  },
  plugins: [],
} 