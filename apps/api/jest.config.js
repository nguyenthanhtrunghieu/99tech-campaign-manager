/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@99tech/shared$': '<rootDir>/../../packages/shared/src',
  },
  testMatch: ['**/tests/**/*.test.ts'],
};
