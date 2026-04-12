module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/Tests/**/*.[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
};
