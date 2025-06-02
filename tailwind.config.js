// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
    './styles/**/*.css', // ✅ corrected warning
  ],
  theme: {
    extend: {
      fontFamily: {},
    },
  },
  plugins: [],
};
