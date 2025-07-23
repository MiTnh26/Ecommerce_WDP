// test/unit/controllers/userController.test.js

const httpMocks = require("node-mocks-http");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//— mock google-auth-library so we can stub verifyIdToken on the instance
jest.mock("google-auth-library", () => {
  const mockVerify = jest.fn();
  const OAuth2Client = jest.fn(() => ({
    verifyIdToken: mockVerify,
  }));
  return { OAuth2Client };
});

//— silence logs/errors and stub ObjectId
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(mongoose.Types, "ObjectId").mockImplementation((id) => id);
});
afterAll(() => {
  console.error.mockRestore();
  console.log.mockRestore();
  mongoose.Types.ObjectId.mockRestore();
});

//— mock crypto & tokens
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

//— mock all models
jest.mock("../../../src/models/Users", () => {
  const M = jest.fn();
  M.find = jest.fn();
  M.findOne = jest.fn();
  M.findById = jest.fn();
  M.findByIdAndUpdate = jest.fn();
  return M;
});
jest.mock("../../../src/models/Payment", () => ({ find: jest.fn() }));
jest.mock("../../../src/models/Products", () => ({ findById: jest.fn() }));
jest.mock("../../../src/models/Orders", () => {
  const M = jest.fn();
  M.find = jest.fn();
  M.findById = jest.fn();
  return M;
});
jest.mock("../../../src/models/OrderItems", () => {
  const M = Object.assign(
    jest.fn(), // allow new OrderItem()
    { find: jest.fn() }
  );
  return M;
});
jest.mock("../../../src/models/Shops", () => ({ findById: jest.fn() }));

const { OAuth2Client } = require("google-auth-library");
const User = require("../../../src/models/Users");
const Payment = require("../../../src/models/Payment");
const Products = require("../../../src/models/Products");
const Order = require("../../../src/models/Orders");
const OrderItem = require("../../../src/models/OrderItems");
const Shops = require("../../../src/models/Shops");

const ctrl = require("../../../src/controllers/UserController/UserController");

function makeReqRes(body = {}, params = {}, query = {}, session = {}) {
  const req = httpMocks.createRequest({ body, params, query });
  req.session = session;
  const res = httpMocks.createResponse();
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn();
  return { req, res };
}

describe("UserController", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("getUsers", () => {
    it("200 + users", async () => {
      User.find.mockResolvedValue([{ u: 1 }]);
      const { req, res } = makeReqRes();
      await ctrl.getUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ u: 1 }]);
    });
  });

  describe("getPaymentForCheckout", () => {
    it("200 + payments", async () => {
      Payment.find.mockResolvedValue(["p1"]);
      const { req, res } = makeReqRes();
      await ctrl.getPaymentForCheckout(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(["p1"]);
    });
  });

  describe("login", () => {
    it("404 if no user", async () => {
      User.findOne.mockResolvedValue(null);
      const { req, res } = makeReqRes({ Email: "e", Password: "p" });
      await ctrl.login(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("401 if wrong password", async () => {
      User.findOne.mockResolvedValue({ _id: "u1", Password: "h" });
      bcrypt.compare.mockResolvedValue(false);
      const { req, res } = makeReqRes({ Email: "e", Password: "p" });
      await ctrl.login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Wrong password" });
    });

    it("200 returns token & user", async () => {
      const userObj = {
        _id: "u1",
        Email: "e",
        Password: "h",
        toObject: () => ({ foo: 1 }),
      };
      User.findOne.mockResolvedValue(userObj);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("tok");
      const { req, res } = makeReqRes({ Email: "e", Password: "p" });
      await ctrl.login(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({ id: "u1", email: "e" }),
        process.env.SECRET_KEY,
        { expiresIn: "1d" }
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "Login successful",
        token: "tok",
        user: { foo: 1 },
      });
    });
  });

  describe("register", () => {
    it("400 if email exists", async () => {
      User.findOne.mockResolvedValue({ any: true });
      const { req, res } = makeReqRes({ Email: "e", Password: "p" });
      await ctrl.register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Email already exixsts",
      });
    });

    it("200 on new user", async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hp");
      const fakeUser = { save: jest.fn() };
      User.mockImplementation(() => fakeUser);
      const body = {
        Username: "u",
        Email: "e",
        Gender: "M",
        Password: "p",
        PhoneNumber: "123",
      };
      const { req, res } = makeReqRes(body);
      await ctrl.register(req, res);
      expect(bcrypt.hash).toHaveBeenCalledWith("p", 10);
      expect(fakeUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Register successfully",
      });
    });
  });

  describe("googleLogin", () => {
    it("401 on invalid token", async () => {
      const clientInstance = new OAuth2Client();
      clientInstance.verifyIdToken.mockRejectedValue(new Error("bad"));
      const { req, res } = makeReqRes({ token: "x" });
      await ctrl.googleLogin(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Token không hợp lệ hoặc lỗi server",
      });
    });

    it("200 creates or finds user", async () => {
      const payload = {
        email: "e",
        given_name: "g",
        family_name: "f",
        picture: "pic",
      };
      const clientInstance = new OAuth2Client();
      clientInstance.verifyIdToken.mockResolvedValue({
        getPayload: () => payload,
      });
      User.findOne.mockResolvedValue(null);
      const fakeUsr = { save: jest.fn() };
      User.mockImplementation(() => fakeUsr);
      jwt.sign.mockReturnValue("gTok");
      const { req, res } = makeReqRes({ token: "x" });
      await ctrl.googleLogin(req, res);
      expect(fakeUsr.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Đăng nhập Google thành công",
          token: "gTok",
        })
      );
    });
  });

  describe("changePassword (OTP)", () => {
    it("400 if no otp", async () => {
      const { req, res } = makeReqRes({}, {}, {}, {});
      await ctrl.changePassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "OTP not found" });
    });

    it("404 if user missing", async () => {
      const session = { otp: { email: "e" } };
      User.findOne.mockResolvedValue(null);
      const { req, res } = makeReqRes({ newPassword: "n" }, {}, {}, session);
      await ctrl.changePassword(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("200 on success", async () => {
      const session = { otp: { email: "e" } };
      const fakeUsr = { Password: null, save: jest.fn() };
      User.findOne.mockResolvedValue(fakeUsr);
      bcrypt.hash.mockResolvedValue("h2");
      const { req, res } = makeReqRes({ newPassword: "n" }, {}, {}, session);
      await ctrl.changePassword(req, res);
      expect(fakeUsr.save).toHaveBeenCalled();
      expect(req.session.otp).toBeNull();
      expect(res.json).toHaveBeenCalledWith({
        message: "Change password successfully",
      });
    });
  });

  describe("getUserById & updateUser", () => {
    it("404 getUserById", async () => {
      User.findById.mockResolvedValue(null);
      const { req, res } = makeReqRes({}, { id: "x" });
      await ctrl.getUserById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("200 updateUser", async () => {
      const updated = { _id: "x" };
      User.findByIdAndUpdate.mockResolvedValue(updated);
      const { req, res } = makeReqRes({}, { id: "x" });
      req.file = { path: "img" };
      await ctrl.updateUser(req, res);
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        "x",
        expect.objectContaining({ Image: "img" }),
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith(updated);
    });
  });

  describe("address endpoints", () => {
    it("addAddress 404 user", async () => {
      User.findById.mockResolvedValue(null);
      const { req, res } = makeReqRes({}, { id: "u1" });
      await ctrl.addAddress(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("addAddress 200", async () => {
      const fakeUser = { ShippingAddress: [], save: jest.fn() };
      User.findById.mockResolvedValue(fakeUser);
      const body = {
        phoneNumber: "p",
        receiverName: "r",
        status: "Default",
        province: "a",
        district: "b",
        ward: "c",
        detail: "d",
      };
      const { req, res } = makeReqRes(body, { id: "u1" });
      await ctrl.addAddress(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Address added successfully" })
      );
    });
  });

  describe("order endpoints", () => {
    it("getOrderByUserId 400 invalid", async () => {
      mongoose.Types.ObjectId.isValid = () => false;
      const { req, res } = makeReqRes({}, { userId: "bad" });
      await ctrl.getOrderByUserId(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("getOrderByUserId 200", async () => {
      mongoose.Types.ObjectId.isValid = () => true;
      const chain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([{ BuyerId: "b", Items: "i" }]),
      };
      Order.find.mockReturnValue(chain);
      const { req, res } = makeReqRes({}, { userId: "u1" });
      await ctrl.getOrderByUserId(req, res);
      expect(chain.populate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("getOrderDetails 404", async () => {
      mongoose.Types.ObjectId.isValid = () => true;
      const chain = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      };
      Order.findById.mockReturnValue(chain);
      const { req, res } = makeReqRes({}, { orderId: "o1" });
      await ctrl.getOrderDetails(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("getOrderDetails 200", async () => {
      mongoose.Types.ObjectId.isValid = () => true;
      const order = { _id: "o1", Items: "x" };
      const chain = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(order),
      };
      Order.findById.mockReturnValue(chain);
      const { req, res } = makeReqRes({}, { orderId: "o1" });
      await ctrl.getOrderDetails(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("createOrderItems 400", async () => {
      const { req, res } = makeReqRes({ Product: [] });
      await ctrl.createOrderItems(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("createOrderItems 201", async () => {
      const fake = { save: jest.fn() };
      OrderItem.mockImplementation(() => fake);
      const { req, res } = makeReqRes({ Product: [1], Total: 10 });
      await ctrl.createOrderItems(req, res);
      expect(fake.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("checkout 400", async () => {
      const { req, res } = makeReqRes({});
      await ctrl.checkout(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("checkout 201", async () => {
      const fake = { save: jest.fn() };
      Order.mockImplementation(() => fake);
      const { req, res } = makeReqRes({
        PaymentId: "p",
        ShippingAddress: "s",
        TotalAmount: 1,
        BuyerId: "b",
        ShopId: "s",
        Items: [],
      });
      await ctrl.checkout(req, res);
      expect(fake.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });
});
