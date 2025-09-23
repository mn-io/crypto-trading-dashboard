module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.integrationspec.ts', '**/*.integrationspec.tsx'],
  setupFilesAfterEnv: [
      "./jest.setup.ts"
    ],
};