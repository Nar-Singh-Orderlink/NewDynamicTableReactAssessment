/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-blue': '#1995AD',
        'custom-blue-hover': '#A1D6E2',
      },
    },
  },
  plugins: [],
}

