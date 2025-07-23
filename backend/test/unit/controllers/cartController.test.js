// test/unit/controllers/cartController.test.js

beforeAll(() => {
  // Silence console.error
  jest.spyOn(console, "error").mockImplementation(() => {});
  // Fake ObjectId so it just returns the string you give it
  jest.spyOn(mongoose.Types, "ObjectId").mockImplementation((id) => id);
});
afterAll(() => {
  console.error.mockRestore();
  mongoose.Types.ObjectId.mockRestore();
});

const httpMocks = require("node-mocks-http");
const mongoose = require("mongoose");

// Mock models
jest.mock("../../../src/models/Users", () => ({ findById: jest.fn() }));
jest.mock("../../../src/models/Cart", () => {
  // Make Cart itself a jest.fn so you can do `new Cart()` and spy on it
  const C = Object.assign(
    jest.fn(), // the constructor
    {
      findOne: jest.fn(),
      aggregate: jest.fn(),
    }
  );
  return C;
});

const User = require("../../../src/models/Users");
const Cart = require("../../../src/models/Cart");
const {
  addToCart,
  changeQuantity,
  deleteProductVariantInCart,
  getCartByUserId,
  getToTalItemInCart,
} = require("../../../src/controllers/UserController/CartController");

describe("UserController › CartController", () => {
  let req, res;
  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();
    jest.clearAllMocks();
  });

  describe("addToCart", () => {
    const validBody = {
      UserId: "u1",
      Product_id: "p1",
      ProductName: "Prod",
      ProductImage: "img.png",
      ShopID: "s1",
      ProductVariant: [
        {
          _id: "v1",
          Image: "vi.png",
          Price: 10,
          ProductVariantName: "Var",
          Quantity: "2",
        },
      ],
    };
    it("400 when missing fields", async () => {
      req.body = {};
      await addToCart(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "All fields are required",
      });
    });

    it("404 when user not found", async () => {
      User.findById.mockResolvedValue(null);
      req.body = validBody;
      await addToCart(req, res);
      expect(User.findById).toHaveBeenCalledWith("u1");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("creates new cart when none exists", async () => {
      User.findById.mockResolvedValue({ _id: "u1" });
      Cart.findOne.mockResolvedValue(null);
      const fakeCart = { save: jest.fn().mockResolvedValue() };
      Cart.mockImplementation(() => fakeCart);
      req.body = validBody;

      await addToCart(req, res);

      expect(Cart).toHaveBeenCalled();
      expect(fakeCart.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Add to cart successfully",
      });
    });

    it("adds new product to existing cart", async () => {
      User.findById.mockResolvedValue({ _id: "u1" });
      const existingCart = { Items: [], save: jest.fn().mockResolvedValue() };
      Cart.findOne.mockResolvedValue(existingCart);
      req.body = validBody;

      await addToCart(req, res);

      expect(existingCart.Items.length).toBe(1);
      expect(existingCart.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Added to cart successfully",
      });
    });
  });

  describe("changeQuantity", () => {
    const body = {
      UserId: "u1",
      Product_id: "p1",
      ProductVariant: { _id: "v1", Quantity: "5" },
    };
    it("400 when missing fields", async () => {
      req.body = {};
      await changeQuantity(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "All fields are requiredc",
      });
    });
    it("404 when cart not found", async () => {
      Cart.findOne.mockResolvedValue(null);
      req.body = body;
      await changeQuantity(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Cart not found" });
    });
    it("404 when product not found", async () => {
      const cart = { Items: [], save: jest.fn() };
      Cart.findOne.mockResolvedValue(cart);
      req.body = body;
      await changeQuantity(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Product not found in cart",
      });
    });
    it("404 when variant not found", async () => {
      const cart = {
        Items: [{ _id: "p1", ProductVariant: [] }],
        save: jest.fn(),
      };
      Cart.findOne.mockResolvedValue(cart);
      req.body = body;
      await changeQuantity(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Product variant not found",
      });
    });
    it("200 on success", async () => {
      const cart = {
        Items: [{ _id: "p1", ProductVariant: [{ _id: "v1", Quantity: 1 }] }],
        save: jest.fn().mockResolvedValue(),
      };
      Cart.findOne.mockResolvedValue(cart);
      req.body = body;
      await changeQuantity(req, res);
      expect(cart.ProductVariant).toBeUndefined(); // irrelevant
      expect(cart.Items[0].ProductVariant[0].Quantity).toBe(5);
      expect(cart.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Change quantity successfully",
      });
    });
  });

  describe("deleteProductVariantInCart", () => {
    const body = {
      UserId: "u1",
      Product_id: "p1",
      ProductVariant: { _id: "v1" },
    };
    it("400 when missing fields", async () => {
      req.body = {};
      await deleteProductVariantInCart(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "All fields are requiredc",
      });
    });
    it("404 when cart not found", async () => {
      Cart.findOne.mockResolvedValue(null);
      req.body = body;
      await deleteProductVariantInCart(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Cart not found" });
    });
    it("404 when product not found", async () => {
      const cart = { Items: [], save: jest.fn() };
      Cart.findOne.mockResolvedValue(cart);
      req.body = body;
      await deleteProductVariantInCart(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Product not found in cart",
      });
    });
    it("404 when variant not found", async () => {
      const cart = {
        Items: [{ _id: "p1", ProductVariant: [] }],
        save: jest.fn(),
      };
      Cart.findOne.mockResolvedValue(cart);
      req.body = body;
      await deleteProductVariantInCart(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Product variant not found",
      });
    });
    it("200 on success", async () => {
      const cart = {
        Items: [{ _id: "p1", ProductVariant: [{ _id: "v1" }] }],
        save: jest.fn().mockResolvedValue(),
      };
      Cart.findOne.mockResolvedValue(cart);
      req.body = body;
      await deleteProductVariantInCart(req, res);
      expect(cart.Items.length).toBe(0);
      expect(cart.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Delete product variant successfully",
      });
    });
  });

  describe("getCartByUserId", () => {
    it("400 when missing UserId", async () => {
      req.body = {};
      await getCartByUserId(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "All fields are requiredc",
      });
    });
    it("404 when no cart", async () => {
      Cart.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });
      req.body = { UserId: "u1" };
      await getCartByUserId(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Cart not found" });
    });
    it("200 on success", async () => {
      const chain = { populate: jest.fn().mockResolvedValue({ _id: "c1" }) };
      Cart.findOne.mockReturnValue(chain);
      req.body = { UserId: "u1" };
      await getCartByUserId(req, res);
      expect(chain.populate).toHaveBeenCalledWith({
        path: "Items.ShopID",
        select: "_id name",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ _id: "c1" });
    });
  });

  describe("getToTalItemInCart", () => {
    it("400 when missing UserId", async () => {
      req.body = {};
      await getToTalItemInCart(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "UserId is required" });
    });
    it("200 with zero when no items", async () => {
      Cart.aggregate.mockResolvedValue([]);
      req.body = { UserId: "u1" };
      await getToTalItemInCart(req, res);
      expect(Cart.aggregate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ totalProductVariantCount: 0 });
    });
    it("200 with count from aggregate", async () => {
      Cart.aggregate.mockResolvedValue([{ totalProductVariantCount: 7 }]);
      req.body = { UserId: "u1" };
      await getToTalItemInCart(req, res);
      expect(res.json).toHaveBeenCalledWith({ totalProductVariantCount: 7 });
    });
  });
});
