// test/unit/controllers/sellerController.test.js

beforeAll(() => {
  // silence error logging in error-path tests
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterAll(() => {
  console.error.mockRestore();
});

const httpMocks = require("node-mocks-http");

// 1️⃣ Mock User and Shop models:
//    - Shop is both a jest.fn() constructor (for new Shop()) and has static methods
//    - User gets only the static findById
jest.mock("../../../src/models/Users", () => {
  return {
    findById: jest.fn(),
  };
});
jest.mock("../../../src/models/Shops", () => {
  const Shop = Object.assign(
    jest.fn(), // so `new Shop()` works in registerShop
    {
      findOne: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findById: jest.fn(),
      distinct: jest.fn(),
      find: jest.fn(),
    }
  );
  return Shop;
});

const User = require("../../../src/models/Users");
const Shop = require("../../../src/models/Shops");
const ctrl = require("../../../src/controllers/SellerController/SellerController");

describe("SellerController", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    // allow chaining .status().json()
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();
    jest.clearAllMocks();
  });

  describe("getShopByUserId", () => {
    it("returns 200 + shop when found", async () => {
      const fakeShop = { owner: "u1", name: "X" };
      const chain = { populate: jest.fn().mockResolvedValue(fakeShop) };
      Shop.findOne.mockReturnValue(chain);

      req.query.owner = "u1";
      await ctrl.getShopByUserId(req, res);

      expect(Shop.findOne).toHaveBeenCalledWith({ owner: "u1" });
      expect(chain.populate).toHaveBeenCalledWith("owner");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeShop);
    });

    it("404 when no shop", async () => {
      const chain = { populate: jest.fn().mockResolvedValue(null) };
      Shop.findOne.mockReturnValue(chain);
      req.query.owner = "u2";

      await ctrl.getShopByUserId(req, res);

      expect(chain.populate).toHaveBeenCalledWith("owner");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Shop not found for this user",
      });
    });

    it("500 on DB error", async () => {
      const err = new Error("boom");
      const chain = { populate: jest.fn().mockRejectedValue(err) };
      Shop.findOne.mockReturnValue(chain);
      req.query.owner = "u3";

      await ctrl.getShopByUserId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to fetch shop data",
        error: err,
      });
    });
  });

  describe("updateShopProfile", () => {
    const existingShop = {
      _id: "s1",
      shopAvatar: "old.png",
      name: "OldName",
      description: "OldDesc",
    };

    it("404 when shop not found", async () => {
      Shop.findOne.mockResolvedValue(null);
      req.body = { owner: "u1" };

      await ctrl.updateShopProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Shop not found for this user",
      });
    });

    it("updates name + description, no file", async () => {
      Shop.findOne.mockResolvedValue(existingShop);
      const updated = { ...existingShop, name: "New", description: "D2" };
      Shop.findByIdAndUpdate.mockResolvedValue(updated);

      req.body = { owner: "u1", name: "New", description: "D2" };
      await ctrl.updateShopProfile(req, res);

      expect(Shop.findByIdAndUpdate).toHaveBeenCalledWith(
        "s1",
        {
          name: "New",
          description: "D2",
          shopAvatar: "old.png",
        },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Shop profile updated",
        shop: updated,
      });
    });

    it("updates avatar when file provided", async () => {
      Shop.findOne.mockResolvedValue(existingShop);
      const updated = { ...existingShop, shopAvatar: "new.png" };
      Shop.findByIdAndUpdate.mockResolvedValue(updated);

      req.body = { owner: "u1" };
      req.file = { path: "new.png" };
      await ctrl.updateShopProfile(req, res);

      expect(Shop.findByIdAndUpdate).toHaveBeenCalledWith(
        "s1",
        {
          name: "OldName",
          description: "OldDesc",
          shopAvatar: "new.png",
        },
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "Shop profile updated",
        shop: updated,
      });
    });

    it("500 on DB error", async () => {
      const err = new Error("fail");
      Shop.findOne.mockResolvedValue(existingShop);
      Shop.findByIdAndUpdate.mockRejectedValue(err);
      req.body = { owner: "u1" };

      await ctrl.updateShopProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Fail to update shop data",
        error: err,
      });
    });
  });

  describe("registerShop", () => {
    it("400 when missing shopName or owner", async () => {
      req.body = { shopDescription: "D" }; // missing shopName & owner

      await ctrl.registerShop(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "shopName and owner are required.",
      });
    });

    it("404 when owner not found", async () => {
      User.findById.mockResolvedValue(null);
      req.body = { shopName: "S", owner: "u1" };

      await ctrl.registerShop(req, res);

      expect(User.findById).toHaveBeenCalledWith("u1");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Owner (user) not found.",
      });
    });

    it("201 on success without file", async () => {
      const fakeDoc = { save: jest.fn().mockResolvedValue({ _id: "s2" }) };
      Shop.mockImplementation(() => fakeDoc);
      User.findById.mockResolvedValue({ _id: "u1" });
      req.body = {
        shopName: "S",
        shopDescription: "D",
        owner: "u1",
        province: "P",
        district: "D2",
        ward: "W",
      };

      await ctrl.registerShop(req, res);

      expect(Shop).toHaveBeenCalledWith({
        name: "S",
        description: "D",
        shopAvatar: "",
        owner: "u1",
        address: { province: "P", district: "D2", ward: "W" },
      });
      expect(fakeDoc.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ _id: "s2" });
    });

    it("201 on success with file", async () => {
      const fakeDoc = { save: jest.fn().mockResolvedValue({ _id: "s3" }) };
      Shop.mockImplementation(() => fakeDoc);
      User.findById.mockResolvedValue({ _id: "u2" });
      req.body = { shopName: "S2", owner: "u2" };
      req.file = { path: "upload.png" };

      await ctrl.registerShop(req, res);

      expect(Shop).toHaveBeenCalledWith(
        expect.objectContaining({ shopAvatar: "upload.png" })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ _id: "s3" });
    });

    it("500 on DB error", async () => {
      const err = new Error("x");
      const fakeDoc = { save: jest.fn().mockRejectedValue(err) };
      Shop.mockImplementation(() => fakeDoc);
      User.findById.mockResolvedValue({ _id: "u1" });
      req.body = { shopName: "S", owner: "u1" };

      await ctrl.registerShop(req, res);

      expect(console.error).toHaveBeenCalledWith("Error in registerShop:", err);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error registering shop.",
        error: err,
      });
    });
  });

  describe("getProvince", () => {
    it("returns distinct provinces via chain", async () => {
      const chain = { distinct: jest.fn().mockResolvedValue(["A", "B"]) };
      Shop.find.mockReturnValue(chain);

      await ctrl.getProvince(req, res);

      expect(Shop.find).toHaveBeenCalled();
      expect(chain.distinct).toHaveBeenCalledWith("address.province");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(["A", "B"]);
    });

    it("500 on DB error in chain.distinct", async () => {
      const err = new Error("fail");
      const chain = { distinct: jest.fn().mockRejectedValue(err) };
      Shop.find.mockReturnValue(chain);

      await ctrl.getProvince(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to get province",
        error: err,
      });
    });
  });
});
