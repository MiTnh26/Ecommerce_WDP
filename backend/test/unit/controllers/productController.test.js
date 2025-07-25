// tests/unit/controllers/productController.test.

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterAll(() => {
  console.error.mockRestore();
});

const httpMocks = require("node-mocks-http");
const mongoose = require("mongoose");

jest.mock("../../../src/models/Products");
jest.mock("../../../src/models/Categories");
jest.mock("../../../src/models/OrderItems");

const Product = require("../../../src/models/Products");
const Category = require("../../../src/models/Categories");
const OrderItem = require("../../../src/models/OrderItems");

const ctrl = require("../../../src/controllers/ProductController/ProductController");

describe("ProductController", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();
    res.sendStatus = jest.fn();
    jest.clearAllMocks();
  });

  describe("getAllProducts", () => {
    it("returns products on success", async () => {
      const fake = [{ _id: "1" }];
      // first populate() spy
      const populateShop = jest.fn().mockResolvedValue(fake);
      // second populate() spy returns final array
      const populateCategory = jest
        .fn()
        .mockReturnValue({ populate: populateShop });
      // Product.find() returns object whose populate = our first spy
      Product.find.mockReturnValue({ populate: populateCategory });

      await ctrl.getAllProducts(req, res);

      expect(Product.find).toHaveBeenCalled();
      expect(populateCategory).toHaveBeenCalledWith("CategoryId");
      expect(populateShop).toHaveBeenCalledWith("ShopId");
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it("handles errors", async () => {
      Product.find.mockReturnValue({
        populate: () => ({
          populate: () => Promise.reject(new Error("boom")),
        }),
      });

      await ctrl.getAllProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error fetching products",
      });
    });
  });

  describe("getAllProductsByShop", () => {
    it("400s without shopId", async () => {
      req.params = {};
      await ctrl.getAllProductsByShop(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "shopId param is required",
      });
    });

    it("returns products for shopId", async () => {
      const fake = [{ _id: "x" }];
      Product.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(fake),
        }),
      });
      req.params = { shopId: "s1" };

      await ctrl.getAllProductsByShop(req, res);

      expect(Product.find).toHaveBeenCalledWith({ ShopId: "s1" });
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it("handles find error", async () => {
      Product.find.mockImplementation(() => {
        throw new Error("fail");
      });
      req.params = { shopId: "s1" };

      await ctrl.getAllProductsByShop(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error fetching products",
        error: "fail",
      });
    });
  });

  describe("saveProduct", () => {
    const baseBody = {
      CategoryId: "c1",
      ShopId: "s1",
      ProductName: "P",
      Price: "9",
    };

    it("400s if ShopId missing", async () => {
      req.body = {};
      await ctrl.saveProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "ShopId is required" });
    });

    it("400s if creating with no variants", async () => {
      req.body = { ShopId: "s1", CategoryId: "c1", ProductVariant: [] };
      req.files = {};
      await ctrl.saveProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "You must supply at least one variant.",
      });
    });

    it("creates a new product", async () => {
      const fakeProd = {
        save: jest.fn().mockResolvedValue(),
        toJSON: () => ({ id: "new" }),
      };
      // intercept the new Product(...) call
      Product.mockImplementation(() => fakeProd);

      req.body = {
        ...baseBody,
        ProductVariant: [
          { ProductVariantName: "v1", Price: "5", StockQuantity: "2" },
        ],
      };
      req.files = {};

      await ctrl.saveProduct(req, res);

      expect(Product).toHaveBeenCalledWith(
        expect.objectContaining({
          ShopId: "s1",
          ProductVariant: expect.any(Array),
        })
      );
      expect(fakeProd.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(fakeProd);
    });

    it("updates existing product", async () => {
      const updated = { _id: "u1" };
      Product.findByIdAndUpdate.mockResolvedValue(updated);
      req.body = {
        id: "u1",
        ShopId: "s1",
        CategoryId: "c1",
        ProductName: "X",
        ProductVariant: [
          { ProductVariantName: "v", Price: "1", StockQuantity: "1" },
        ],
      };
      req.files = {};

      await ctrl.saveProduct(req, res);

      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        "u1",
        expect.objectContaining({
          ShopId: "s1",
          ProductVariant: expect.any(Array),
        }),
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it("handles exception", async () => {
      Product.findByIdAndUpdate.mockRejectedValue(new Error("boom"));
      req.body = {
        id: "u1",
        ShopId: "s1",
        CategoryId: "c1",
        ProductVariant: [
          { ProductVariantName: "v", Price: "1", StockQuantity: "1" },
        ],
      };
      req.files = {};

      await ctrl.saveProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error saving product",
        error: "boom",
      });
    });
  });

  describe("addVariant", () => {
    it("adds a variant and returns product", async () => {
      const prod = {
        ProductVariant: [],
        save: jest.fn().mockResolvedValue(),
        toJSON: () => ({ ok: true }),
      };
      Product.findById.mockResolvedValue(prod);
      req.params = { id: "p1" };
      req.body = { ProductVariantName: "v2", Price: "3", StockQuantity: "4" };
      req.file = { path: "img.png" };

      await ctrl.addVariant(req, res);

      expect(Product.findById).toHaveBeenCalledWith("p1");
      expect(prod.ProductVariant).toHaveLength(1);
      expect(prod.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(prod);
    });

    it("handles errors", async () => {
      Product.findById.mockRejectedValue(new Error());
      await ctrl.addVariant(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error adding variant",
      });
    });
  });

  describe("toggleStatus", () => {
    it("flips status and returns product", async () => {
      const prod = { Status: "Active", save: jest.fn(), toJSON: () => ({}) };
      Product.findById.mockResolvedValue(prod);
      req.params = { id: "p1" };

      await ctrl.toggleStatus(req, res);

      expect(prod.Status).toBe("Inactive");
      expect(prod.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(prod);
    });

    it("handles error", async () => {
      Product.findById.mockRejectedValue(new Error());
      await ctrl.toggleStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error toggling status",
      });
    });
  });

  describe("deleteProduct", () => {
    it("deletes and sends 204", async () => {
      Product.findByIdAndDelete.mockResolvedValue();
      req.params = { id: "p1" };

      await ctrl.deleteProduct(req, res);

      expect(Product.findByIdAndDelete).toHaveBeenCalledWith("p1");
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });
  });

  describe("removeVariant", () => {
    it("removes and returns product", async () => {
      const variant = { remove: jest.fn() };
      const prod = {
        ProductVariant: { id: () => variant },
        save: jest.fn(),
        toJSON: () => ({}),
      };
      Product.findById.mockResolvedValue(prod);
      req.params = { id: "p1", variantId: "v1" };

      await ctrl.removeVariant(req, res);

      expect(variant.remove).toHaveBeenCalled();
      expect(prod.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(prod);
    });
  });

  describe("getCategories", () => {
    it("returns categories", async () => {
      const cats = [{}, {}];
      Category.find.mockResolvedValue(cats);

      await ctrl.getCategories(req, res);
      expect(Category.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(cats);
    });

    it("handles error", async () => {
      Category.find.mockRejectedValue(new Error());
      await ctrl.getCategories(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error fetching categories",
      });
    });
  });

  describe("getNewProducts", () => {
    it("finds, sorts, limits & returns new products", async () => {
      const fake = [{ _id: "n1" }];
      Product.aggregate.mockResolvedValue(fake);

      req.query = { limit: 5, page: 2 };
      await ctrl.getNewProducts(req, res);

      expect(Product.aggregate).toHaveBeenCalledWith([
        { $lookup: expect.any(Object) },
        { $unwind: "$shop" },
        { $match: { "shop.status": { $ne: "Banned" } } },
        { $project: expect.any(Object) },
        { $sort: { createdAt: -1 } },
        { $skip: 2 * 5 },
        { $limit: 5 },
      ]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it("handles error", async () => {
      Product.aggregate.mockRejectedValue(new Error("fail-aggs"));
      await ctrl.getNewProducts(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error fetching new products",
      });
    });
  });

  describe("getBestSellerProducts", () => {
    it("aggregates and returns best sellers", async () => {
      const fake = [{ _id: "b1" }];
      OrderItem.aggregate.mockResolvedValue(fake);

      await ctrl.getBestSellerProducts(req, res);

      expect(OrderItem.aggregate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(fake);
    });
  });

  describe("getProductById", () => {
    it("returns product when found", async () => {
      // include a ShopId.status so the 'banned' and 'inactive' checks pass through
      const prod = { _id: "p1", ShopId: { status: "Active" } };
      // 1) simulate .populate() resolving to our product
      const popShop = jest.fn().mockResolvedValue(prod);
      // 2) simulate .select() returning an object with .populate = popShop
      const selectSpy = jest.fn().mockReturnValue({ populate: popShop });
      // 3) make findOne(...) return that object
      Product.findOne.mockReturnValue({ select: selectSpy });

      req.params = { id: "p1" };
      await ctrl.getProductById(req, res);

      expect(Product.findOne).toHaveBeenCalledWith({ _id: "p1" });
      expect(selectSpy).toHaveBeenCalledWith(
        "_id ProductName ProductImage Description ProductVariant Status"
      );
      expect(popShop).toHaveBeenCalledWith({
        path: "ShopId",
        select: "_id name shopAvatar description address status",
      });
      expect(res.json).toHaveBeenCalledWith({
        product: prod,
        message: "Fetch product successfully",
      });
    });

    it("404s when not found", async () => {
      // 1) simulate .populate() resolving to null
      const popShop = jest.fn().mockResolvedValue(null);
      const selectSpy = jest.fn().mockReturnValue({ populate: popShop });
      Product.findOne.mockReturnValue({ select: selectSpy });

      req.params = { id: "p1" };
      await ctrl.getProductById(req, res);

      expect(Product.findOne).toHaveBeenCalledWith({ _id: "p1" });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Product not found",
      });
    });
  });

  describe("fetchProductsRelated", () => {
    it("400s without name_product", async () => {
      req.body = {};
      await ctrl.fetchProductsRelated(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Product name is required",
      });
    });

    it("runs aggregate and returns products", async () => {
      const fake = [{ _id: "r1" }];
      Product.aggregate.mockResolvedValue(fake);
      req.body = { name_product: "foo" };

      await ctrl.fetchProductsRelated(req, res);

      expect(Product.aggregate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fake);
    });
  });

  describe("filterProduct", () => {
    it("builds pipeline and returns filtered products", async () => {
      const fake = [{ _id: "f1" }];
      Product.aggregate.mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue(fake),
      });

      req.body = {
        name: "foo",
        fromPrice: "5",
        toPrice: "10",
        whereToBuyFilter: ["HCM"],
      };
      req.query = { limit: 2, page: 1 };

      await ctrl.filterProduct(req, res);

      expect(Product.aggregate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it("handles error", async () => {
      Product.aggregate.mockImplementation(() => {
        throw new Error("agg-fail");
      });
      await ctrl.filterProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error filtering products",
      });
    });
  });
});
