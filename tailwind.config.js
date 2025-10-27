/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gofast: {
          orange: '#ff6b35',
          red: '#f7931e',
          pink: '#ff4757'
        }
      }
    },
  },
  plugins: [],
}
