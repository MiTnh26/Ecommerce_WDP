// test/unit/controllers/categoryController.test.js

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterAll(() => {
  console.error.mockRestore();
});

const httpMocks = require("node-mocks-http");

// Mock the Category model
jest.mock("../../../src/models/Categories", () => {
  const Category = Object.assign(jest.fn(), {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
  });
  return Category;
});

const Category = require("../../../src/models/Categories");
const ctrl = require("../../../src/controllers/SellerController/CategoryController");

describe("SellerController › CategoryController", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();
    jest.clearAllMocks();
  });

  describe("getAllCategories", () => {
    it("400 when shopId missing", async () => {
      req.query = {};
      await ctrl.getAllCategories(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Missing shopId" });
    });

    it("returns all categories on success", async () => {
      const cats = [{ name: "A" }, { name: "B" }];
      req.query = { shopId: "s1" };
      Category.find.mockResolvedValue(cats);

      await ctrl.getAllCategories(req, res);

      expect(Category.find).toHaveBeenCalledWith({ ShopId: "s1" });
      expect(res.json).toHaveBeenCalledWith(cats);
    });

    it("handles DB errors", async () => {
      const err = new Error("fail");
      req.query = { shopId: "s1" };
      Category.find.mockRejectedValue(err);

      await ctrl.getAllCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error fetching categories",
        error: err,
      });
    });
  });

  describe("getCategoryById", () => {
    it("400 when shopId missing", async () => {
      req.query = {};
      req.params.id = "c1";
      await ctrl.getCategoryById(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Missing shopId" });
    });

    it("404 when not found", async () => {
      const shopId = "s1";
      req.query = { shopId };
      req.params.id = "c1";
      Category.findOne.mockResolvedValue(null);

      await ctrl.getCategoryById(req, res);

      expect(Category.findOne).toHaveBeenCalledWith({
        _id: "c1",
        ShopId: shopId,
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Category not found or not belong to your shop",
      });
    });

    it("returns category", async () => {
      const shopId = "s2";
      const cat = { _id: "c2", name: "X" };
      req.query = { shopId };
      req.params.id = "c2";
      Category.findOne.mockResolvedValue(cat);

      await ctrl.getCategoryById(req, res);

      expect(res.json).toHaveBeenCalledWith(cat);
    });

    it("handles errors", async () => {
      const err = new Error("boom");
      req.query = { shopId: "s3" };
      req.params.id = "c3";
      Category.findOne.mockRejectedValue(err);

      await ctrl.getCategoryById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error fetching category",
        error: err,
      });
    });
  });

  describe("getCategoriesByShop", () => {
    it("400 when shopId missing", async () => {
      req.params = {};
      await ctrl.getCategoriesByShop(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "shopId parameter is required",
      });
    });

    it("returns categories for a shop", async () => {
      const list = [{ ShopId: "s1" }];
      req.params.shopId = "s1";
      Category.find.mockResolvedValue(list);

      await ctrl.getCategoriesByShop(req, res);

      expect(Category.find).toHaveBeenCalledWith({ ShopId: "s1" });
      expect(res.json).toHaveBeenCalledWith(list);
    });

    it("handles DB errors", async () => {
      const err = new Error("oops");
      req.params.shopId = "s2";
      Category.find.mockRejectedValue(err);

      await ctrl.getCategoriesByShop(req, res);

      expect(console.error).toHaveBeenCalledWith(
        "Server error fetching categories by shop:",
        err
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error fetching categories",
        error: err.message,
      });
    });
  });

  describe("createCategory", () => {
    it("400 when shopId missing", async () => {
      req.body = { CategoryName: "C", Status: "A" };
      await ctrl.createCategory(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Missing shopId" });
    });

    it("creates and returns new category", async () => {
      const fakeDoc = {
        save: jest.fn().mockResolvedValue(),
        CategoryName: "C",
        Status: "A",
      };
      Category.mockImplementation(() => fakeDoc);
      req.body = { CategoryName: "C", Status: "A", shopId: "s1" };

      await ctrl.createCategory(req, res);

      expect(Category).toHaveBeenCalledWith({
        CategoryName: "C",
        Status: "A",
        ShopId: "s1",
      });
      expect(fakeDoc.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(fakeDoc);
    });

    it("handles errors", async () => {
      const err = new Error("nope");
      const fakeDoc = { save: jest.fn().mockRejectedValue(err) };
      Category.mockImplementation(() => fakeDoc);
      req.body = { CategoryName: "X", Status: "Y", shopId: "s2" };

      await ctrl.createCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error creating category",
        error: err,
      });
    });
  });

  describe("updateCategory", () => {
    it("400 when shopId missing", async () => {
      req.body = { CategoryName: "N", Status: "S" };
      req.params.id = "u1";
      await ctrl.updateCategory(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Missing shopId" });
    });

    it("404 when not found", async () => {
      req.body = { CategoryName: "N", Status: "S", shopId: "s1" };
      req.params.id = "u1";
      Category.findOneAndUpdate.mockResolvedValue(null);

      await ctrl.updateCategory(req, res);

      expect(Category.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "u1", ShopId: "s1" },
        { CategoryName: "N", Status: "S" },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Category not found or not belong to your shop",
      });
    });

    it("updates and returns", async () => {
      const updated = { _id: "u2", CategoryName: "New", Status: "Active" };
      req.body = { CategoryName: "New", Status: "Active", shopId: "s2" };
      req.params.id = "u2";
      Category.findOneAndUpdate.mockResolvedValue(updated);

      await ctrl.updateCategory(req, res);

      expect(Category.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "u2", ShopId: "s2" },
        { CategoryName: "New", Status: "Active" },
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it("handles errors", async () => {
      const err = new Error("bad");
      req.body = { CategoryName: "X", Status: "Y", shopId: "s3" };
      req.params.id = "x1";
      Category.findOneAndUpdate.mockRejectedValue(err);

      await ctrl.updateCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error updating category",
        error: err,
      });
    });
  });

  describe("deleteCategory", () => {
    it("400 when shopId missing", async () => {
      req.query = {};
      req.params.id = "d1";
      await ctrl.deleteCategory(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Missing shopId" });
    });

    it("404 when not found", async () => {
      req.query = { shopId: "s1" };
      req.params.id = "d1";
      Category.findOneAndDelete.mockResolvedValue(null);

      await ctrl.deleteCategory(req, res);

      expect(Category.findOneAndDelete).toHaveBeenCalledWith({
        _id: "d1",
        ShopId: "s1",
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Category not found or not belong to your shop",
      });
    });

    it("deletes and returns message", async () => {
      req.query = { shopId: "s2" };
      req.params.id = "d2";
      Category.findOneAndDelete.mockResolvedValue({ _id: "d2" });

      await ctrl.deleteCategory(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: "Category deleted" });
    });

    it("handles errors", async () => {
      const err = new Error("err!");
      req.query = { shopId: "s3" };
      req.params.id = "d3";
      Category.findOneAndDelete.mockRejectedValue(err);

      await ctrl.deleteCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error deleting category",
        error: err,
      });
    });
  });
});
