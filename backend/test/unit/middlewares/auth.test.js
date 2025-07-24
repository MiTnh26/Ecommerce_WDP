// tests/unit/middlewares/auth.test.js

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterAll(() => {
  console.error.mockRestore();
});

const jwt = require("jsonwebtoken");
const httpMocks = require("node-mocks-http");
const verifyToken = require("../../../src/middleware/auth");

jest.mock("jsonwebtoken");

describe("verifyToken middleware", () => {
  let req, res, next;
  beforeEach(() => {
    req  = httpMocks.createRequest();
    res  = httpMocks.createResponse();
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn();
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("401s when no Authorization header", () => {
    req.headers = {};
    verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "No token provided" });
    expect(next).not.toHaveBeenCalled();
  });

  it("403s when jwt.verify reports an error", () => {
    req.headers = { authorization: "Bearer badtoken" };
    jwt.verify.mockImplementation((token, secret, cb) => cb(new Error("fail"), null));

    verifyToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("badtoken", expect.any(String), expect.any(Function));
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches req.user and calls next() on valid token", () => {
    const payload = { userId: "u1" };
    req.headers = { authorization: "Bearer goodtoken" };
    jwt.verify.mockImplementation((token, secret, cb) => cb(null, payload));

    verifyToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("goodtoken", expect.any(String), expect.any(Function));
    expect(req.user).toBe(payload);
    expect(next).toHaveBeenCalled();
  });
});
