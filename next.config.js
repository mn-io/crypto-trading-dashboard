// next.config.js
module.exports = {
  webpackDevMiddleware: config => {
    // Allow all hosts for Cypress component testing
    config.allowedHosts = 'all';
    return config;
  },
};
