// tests/unit/middlewares/verifyOtpMiddleware.test.js

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterAll(() => {
  console.error.mockRestore();
});

const httpMocks = require("node-mocks-http");
const verifyOtpMiddleware = require("../../../src/middleware/verifyOtpMiddleware");

describe("verifyOtpMiddleware", () => {
  let req, res, next;
  beforeEach(() => {
    req  = httpMocks.createRequest();
    res  = httpMocks.createResponse();
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn();
    next = jest.fn();
  });

  it("403s when session.otpVerified is falsy", () => {
    req.session = {};
    verifyOtpMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "OTP verification required" });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() when session.otpVerified is true", () => {
    req.session = { otpVerified: true };
    verifyOtpMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
