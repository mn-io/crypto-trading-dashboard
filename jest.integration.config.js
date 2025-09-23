export const preset = 'ts-jest';
export const testEnvironment = 'node';
export const testMatch = ['**/*.integrationspec.ts', '**/*.integrationspec.tsx'];
export const setupFilesAfterEnv = [
  "./jest.setup.ts"
];