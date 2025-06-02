/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
    './styles/**/*.css', // ✅ corrected glob pattern
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
