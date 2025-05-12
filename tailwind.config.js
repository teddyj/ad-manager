/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'media',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spins: {
          blue: '#0B2265',
          orange: '#F7941D',
        },
        coral: {
          500: '#FF7F5C',
          600: '#FF6B44',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 