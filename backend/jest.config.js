module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/setup.js'],
  testTimeout: 30000,
  verbose: true,
  clearMocks: true,
  moduleNameMapper: {
    '^cookie$': '<rootDir>/tests/__mocks__/cookie.js'
  }
};
