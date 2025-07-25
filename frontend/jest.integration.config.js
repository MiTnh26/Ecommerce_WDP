// jest.integration.config.js
module.exports = {
  roots: [ "<rootDir>/test/integration" ],
  testEnvironment: "jsdom",

  testEnvironmentOptions: {},

  // <<< ADD THIS >>>
  setupFiles: [
    "<rootDir>/test/polyfills.js"
  ],

  setupFilesAfterEnv: [
    "<rootDir>/jest.integration.setup.js"
  ],

  transform: {
    "^.+\\.[jt]sx?$": "babel-jest"
  },
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy"
  },
};
