// postcss.config.js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}, // ✅ not 'tailwindcss' anymore in v4
    autoprefixer: {},
  },
};
