/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'code-teal': '#0093B4',
        'code-purple': '#7B2CBF',
        'code-pink': '#FF6B9D',
        'code-orange': '#FFC93C',
        'code-blue': '#4A90E2',
      },
    },
  },
  plugins: [],
}
