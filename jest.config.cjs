module.exports = {
    verbose: true,
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
      // Handle CSS imports
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      // Handle path aliases
      '^@/(.*)$': '<rootDir>/src/$1'
    },
    transform: {
      '^.+\\.(ts|tsx)$': ['ts-jest', {
        tsconfig: 'tsconfig.jest.json'
      }]
    },
    // Handle Vite's import.meta
    globals: {
      'import.meta': {
        env: {
          VITE_API_URL: 'http://localhost:5000',
          MODE: 'test',
          DEV: true,
          PROD: false
        }
      }
    }
  };