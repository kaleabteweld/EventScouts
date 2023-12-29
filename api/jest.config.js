/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  verbose: false,
  // collectCoverage: true,
  forceExit: true,
  // clearMocks: true,
  detectOpenHandles: true,
  testTimeout: 20000,

};