// tests/unit/controllers/adminController.test.js

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterAll(() => {
  console.error.mockRestore();
});

const httpMocks = require("node-mocks-http");
const mongoose = require("mongoose");

// auto‑mock all model methods
jest.mock("../../../src/models", () => {
  // Make Payment a jest.fn() so you can do new Payment() and mockImplementation on it:
  const Payment = Object.assign(
    jest.fn(), // <-- the constructor
    {
      find: jest.fn(),
      updateMany: jest.fn(),
      findById: jest.fn(),
      findByIdAndDelete: jest.fn(),
    }
  );

  return {
    User: {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findOne: jest.fn(),
    },
    Shop: {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      aggregate: jest.fn(),
    },
    Payment, // <-- our mock constructor with static methods
    Orders: { countDocuments: jest.fn(), find: jest.fn() },
    Products: { countDocuments: jest.fn(), find: jest.fn() },
  };
});

const {
  User,
  Shop,
  Payment, // now a jest.fn()
  Orders,
  Products,
} = require("../../../src/models");

const ctrl = require("../../../src/controllers/AdminController/AdminController");

describe("AdminController", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();
    jest.clearAllMocks();
  });

  describe("getAllUser", () => {
    it("returns users with totalOrders", async () => {
      const users = [
        { _id: "u1", toObject: () => ({ name: "A" }) },
        { _id: "u2", toObject: () => ({ name: "B" }) },
      ];
      User.find.mockResolvedValue(users);
      // delivered counts
      Orders.countDocuments.mockResolvedValueOnce(5).mockResolvedValueOnce(2);

      await ctrl.getAllUser(req, res);

      expect(User.find).toHaveBeenCalledWith({
        UserRole: { $in: ["Seller", "Customer"] },
      });
      expect(Orders.countDocuments).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        { name: "A", totalOrders: 5 },
        { name: "B", totalOrders: 2 },
      ]);
    });

    it("handles errors", async () => {
      User.find.mockRejectedValue(new Error("dbfail"));

      await ctrl.getAllUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to fetch users",
        error: expect.any(Error),
      });
    });
  });

  describe("getAllShop", () => {
    let req;
    let res;

    beforeEach(() => {
      // Reset mocks before each test
      jest.clearAllMocks();

      req = {}; // no params/body needed here
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it("returns shops with stats", async () => {
      const shop = { _id: "s1", toObject: () => ({ title: "X" }) };
      const fakeQuery = { populate: jest.fn().mockResolvedValue([shop]) };
      Shop.find.mockReturnValueOnce(fakeQuery);
      Products.countDocuments.mockResolvedValue(3);
      Orders.countDocuments.mockResolvedValueOnce(4);
      Orders.find.mockResolvedValue([{ TotalAmount: 10 }, { TotalAmount: 5 }]);

      // 4) Invoke the controller
      await ctrl.getAllShop(req, res);

      // 5) Assert status + payload
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        { title: "X", totalProducts: 3, totalOrders: 4, revenue: 15 },
      ]);
    });

    it("handles errors gracefully", async () => {
      // Make find() throw
      Shop.find.mockImplementationOnce(() => {
        throw new Error("oops");
      });

      await ctrl.getAllShop(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to fetch shops",
        error: expect.any(Error),
      });
    });
  });

  describe("banUserById", () => {
    it("404 if not found", async () => {
      User.findById.mockResolvedValue(null);
      req.params = { id: "u1" };

      await ctrl.banUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("toggles status", async () => {
      const user = { _id: "u1", Status: "Active" };
      User.findById.mockResolvedValue(user);
      User.findByIdAndUpdate.mockResolvedValue({ _id: "u1", Status: "Banned" });
      req.params = { id: "u1" };

      await ctrl.banUserById(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        "u1",
        { Status: "Banned" },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ _id: "u1", Status: "Banned" });
    });
  });

  describe("getUserProfile", () => {
    it("404 if missing", async () => {
      User.findById.mockResolvedValue(null);
      req.body = { _id: "u1" };

      await ctrl.getUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("returns user", async () => {
      const u = { _id: "u1" };
      User.findById.mockResolvedValue(u);
      req.body = { _id: "u1" };

      await ctrl.getUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(u);
    });
  });

  describe("findUserByEmail", () => {
    it("404 if none", async () => {
      User.findOne.mockResolvedValue(null);
      req.body = { Email: "foo" };

      await ctrl.findUserByEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("returns match", async () => {
      const u = { _id: "u1" };
      User.findOne.mockResolvedValue(u);
      req.body = { Email: "foo" };
      await ctrl.findUserByEmail(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(u);
    });
  });

  describe("findShopByEmail", () => {
    it("404 when no shops", async () => {
      Shop.aggregate.mockResolvedValue([]);
      req.body = { Email: "x" };
      await ctrl.findShopByEmail(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Shop not found" });
    });
    it("returns shops", async () => {
      const arr = [{ _id: "s1" }];
      Shop.aggregate.mockResolvedValue(arr);
      req.body = { Email: "x" };
      await ctrl.findShopByEmail(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(arr);
    });
  });

  describe("banShopById & acceptRegisterShopRequest", () => {
    const chain = {
      populate: jest.fn().mockResolvedValue({ status: "Inactive" }),
    };
    beforeEach(() => Shop.findById.mockReturnValue(chain));
    it("404 if missing", async () => {
      chain.populate.mockResolvedValue(null);
      req.params = { id: "s1" };
      await ctrl.banShopById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    it("toggles status", async () => {
      chain.populate.mockResolvedValue({ status: "Active", _id: "s1" });
      Shop.findByIdAndUpdate.mockResolvedValue({ _id: "s1", status: "Banned" });
      req.params = { id: "s1" };
      await ctrl.banShopById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ _id: "s1", status: "Banned" });
    });
    it("acceptRegisterShopRequest", async () => {
      chain.populate.mockResolvedValue({ _id: "s2" });
      Shop.findByIdAndUpdate.mockResolvedValue({ _id: "s2", status: "Active" });
      req.params = { id: "s2" };
      await ctrl.acceptRegisterShopRequest(req, res);
      expect(res.json).toHaveBeenCalledWith({ _id: "s2", status: "Active" });
    });
  });

  describe("Payment methods", () => {
    it("getPaymentMethod", async () => {
      const arr = [{ id: 1 }];
      Payment.find.mockResolvedValue(arr);
      await ctrl.getPaymentMethod(req, res);
      expect(res.json).toHaveBeenCalledWith(arr);
    });

    it("addPaymentMethod", async () => {
      const fake = { save: jest.fn().mockResolvedValue({ id: "p1" }) };
      Payment.mockImplementation(() => fake);
      req.body = { name: "n", type: "t", provider: "prov" };
      await ctrl.addPaymentMethod(req, res);
      expect(fake.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Payment method added successfully",
        paymentMethod: { id: "p1" },
      });
    });

    it("updatePaymentMethod – missing id", async () => {
      req.params = {};
      await ctrl.updatePaymentMethod(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("deletePaymentMethod – not found", async () => {
      req.params = { id: "x" };
      Payment.findByIdAndDelete.mockResolvedValue(null);
      await ctrl.deletePaymentMethod(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("setDefaultPaymentMethod", async () => {
      const pay = { _id: "p1", Type: "C", save: jest.fn() };
      Payment.findById.mockResolvedValue(pay);
      Payment.updateMany.mockResolvedValue();
      await ctrl.setDefaultPaymentMethod(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(pay.save).toHaveBeenCalled();
    });
  });

  describe("getAllOrder", () => {
    it("computes stats and returns", async () => {
      const orders = [
        {
          Status: "Delivered",
          TotalAmount: 10,
          PaymentId: { _id: "pm1", Name: "N", Provider: "P" },
        },
        { Status: "Pending", TotalAmount: 5, PaymentId: null },
      ];
      const chain = {
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(orders),
        }),
      };
      Orders.find.mockReturnValue(chain);

      await ctrl.getAllOrder(req, res);

      expect(Orders.find).toHaveBeenCalled();
      expect(chain.populate).toHaveBeenCalledWith("Items");
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          totalTransactions: 2,
          totalAmount: 10,
          paymentStats: expect.any(Array),
        })
      );
    });
  });

  describe("getAllProduct", () => {
    it("returns products", async () => {
      const chain = { populate: jest.fn().mockResolvedValue([{ _id: "p1" }]) };
      Products.find.mockReturnValue(chain);
      await ctrl.getAllProduct(req, res);
      expect(chain.populate).toHaveBeenCalledWith("ShopId");
      expect(res.json).toHaveBeenCalledWith([{ _id: "p1" }]);
    });
  });
});
