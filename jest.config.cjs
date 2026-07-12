/** @type {import('jest').Config} */
module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      lines: 20,
      statements: 20,
    },
  },
  preset: 'ts-jest',
  setupFiles: ['<rootDir>/tests/setup-env.ts'],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.spec.ts'],
}
