// test/setupTests.js
require('@testing-library/jest-dom');

const { server } = require('./mocks/server');

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
