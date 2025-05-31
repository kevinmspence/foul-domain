require('dotenv').config();
const functions = require('firebase-functions');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({
  dev,
  conf: {
    // Point to the build inside functions
    distDir: path.join(__dirname, '.next'),
  },
});
const handle = app.getRequestHandler();

exports.nextApp = functions.https.onRequest((req, res) => {
  return app.prepare().then(() => handle(req, res));
});
