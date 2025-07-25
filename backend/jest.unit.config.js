// jest.unit.config.js
module.exports = {
  // 1) Look only under test/unit
  roots: ['<rootDir>/test/unit'],

  // 2) Run in Node (no JSDOM)
  testEnvironment: 'node',

  // 3) Transform modern JS via babel-jest
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },

  // 4) Alias .scss/.css → identity-obj-proxy to satisfy your imports
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy'
  },

  // 5) Make imports like require("../../../src/...") simpler:
  //    so `import Category from 'models/Categories'` would work if you enable it
  moduleDirectories: ['node_modules', 'src'],
  
  // 6) Recognize .js/.jsx test file extensions
  testMatch: [
    '<rootDir>/test/unit/**/*.test.[jt]s?(x)'
  ]
};
