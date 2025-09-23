import { defineConfig } from 'cypress';

export default defineConfig({
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: '**/*.cy.{ts,tsx,js,jsx}',
  },

  // e2e not in use for now.
  // e2e: {
  //   supportFile: false, // create cypress/support/e2e.ts if used
  // },
});
