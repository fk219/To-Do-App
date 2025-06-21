/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scan all relevant files in src
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        // If we want to ensure Inter is primary, though it will be in index.css
        // sans: ['Inter', ...require('tailwindcss/defaultTheme').fontFamily.sans],
      },
      // We can extend colors here later if needed for Notion-specific palette
    },
  },
  plugins: [],
}
