// jest.integration.setup.js
require("jest-fetch-mock").enableMocks();

// add this:
require("@testing-library/jest-dom");

// (you could also move the jest-dom import into a separate setup file,
//  but it just needs to run before your tests do.)
