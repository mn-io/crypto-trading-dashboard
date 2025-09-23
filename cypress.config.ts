import { defineConfig } from 'cypress';

export default defineConfig({
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: '**/*.cy.{ts,tsx,js,jsx}',
    fixturesFolder: 'test/cypress/fixtures',
    screenshotsFolder: 'test/cypress/screenshots',
    videosFolder: 'test/cypress/videos',
    downloadsFolder: 'test/cypress/downloads',
    supportFile: 'test/cypress/support/component.ts',
    indexHtmlFile: 'test/cypress/support/component-index.html',
  },

  // e2e not in use for now.
  // e2e: {
  //   supportFile: false, // create cypress/support/e2e.ts if used
  // },
});
