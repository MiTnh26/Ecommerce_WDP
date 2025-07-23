// test/unit/controllers/categoryController.test.js

beforeAll(() => {
  // silence error logging in tests
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterAll(() => {
  console.error.mockRestore();
});

const httpMocks = require("node-mocks-http");

// 1️⃣ Mock the Category model as a constructor + static methods:
jest.mock("../../../src/models/Categories", () => {
  const Category = Object.assign(
    jest.fn(),                 // so new Category(...) works
    {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
    }
  );
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
    it("returns all categories on success", async () => {
      const cats = [{ name: "A" }, { name: "B" }];
      Category.find.mockResolvedValue(cats);

      await ctrl.getAllCategories(req, res);

      expect(Category.find).toHaveBeenCalledWith();
      expect(res.json).toHaveBeenCalledWith(cats);
    });

    it("handles DB errors", async () => {
      const err = new Error("fail");
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
    it("404 when not found", async () => {
      Category.findById.mockResolvedValue(null);
      req.params.id = "c1";

      await ctrl.getCategoryById(req, res);

      expect(Category.findById).toHaveBeenCalledWith("c1");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Category not found" });
    });

    it("returns category", async () => {
      const cat = { _id: "c2", name: "X" };
      Category.findById.mockResolvedValue(cat);
      req.params.id = "c2";

      await ctrl.getCategoryById(req, res);

      expect(res.json).toHaveBeenCalledWith(cat);
    });

    it("handles errors", async () => {
      const err = new Error("boom");
      Category.findById.mockRejectedValue(err);
      req.params.id = "c3";

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
      Category.find.mockResolvedValue(list);
      req.params.shopId = "s1";

      await ctrl.getCategoriesByShop(req, res);

      expect(Category.find).toHaveBeenCalledWith({ ShopId: "s1" });
      expect(res.json).toHaveBeenCalledWith(list);
    });

    it("handles DB errors", async () => {
      const err = new Error("oops");
      Category.find.mockRejectedValue(err);
      req.params.shopId = "s2";

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
    it("creates and returns new category", async () => {
      const fakeDoc = { save: jest.fn().mockResolvedValue(), CategoryName: "C", Status: "A" };
      // new Category(...) returns fakeDoc
      Category.mockImplementation(() => fakeDoc);
      req.body = { CategoryName: "C", Status: "A" };

      await ctrl.createCategory(req, res);

      expect(Category).toHaveBeenCalledWith({ CategoryName: "C", Status: "A" });
      expect(fakeDoc.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(fakeDoc);
    });

    it("handles errors", async () => {
      const err = new Error("nope");
      const fakeDoc = { save: jest.fn().mockRejectedValue(err) };
      Category.mockImplementation(() => fakeDoc);
      req.body = { CategoryName: "X", Status: "Y" };

      await ctrl.createCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error creating category",
        error: err,
      });
    });
  });

  describe("updateCategory", () => {
    it("404 when not found", async () => {
      Category.findByIdAndUpdate.mockResolvedValue(null);
      req.params.id = "u1";
      req.body = { CategoryName: "N", Status: "S" };

      await ctrl.updateCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Category not found" });
    });

    it("updates and returns", async () => {
      const updated = { _id: "u2", CategoryName: "New", Status: "Active" };
      Category.findByIdAndUpdate.mockResolvedValue(updated);
      req.params.id = "u2";
      req.body = { CategoryName: "New", Status: "Active" };

      await ctrl.updateCategory(req, res);

      expect(
        Category.findByIdAndUpdate
      ).toHaveBeenCalledWith(
        "u2",
        { CategoryName: "New", Status: "Active" },
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it("handles errors", async () => {
      const err = new Error("bad");
      Category.findByIdAndUpdate.mockRejectedValue(err);
      req.params.id = "x1";
      req.body = { CategoryName: "X", Status: "Y" };

      await ctrl.updateCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error updating category",
        error: err,
      });
    });
  });

  describe("deleteCategory", () => {
    it("404 when not found", async () => {
      Category.findByIdAndDelete.mockResolvedValue(null);
      req.params.id = "d1";

      await ctrl.deleteCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Category not found" });
    });

    it("deletes and returns message", async () => {
      Category.findByIdAndDelete.mockResolvedValue({ _id: "d2" });
      req.params.id = "d2";

      await ctrl.deleteCategory(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: "Category deleted" });
    });

    it("handles errors", async () => {
      const err = new Error("err!");
      Category.findByIdAndDelete.mockRejectedValue(err);
      req.params.id = "d3";

      await ctrl.deleteCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error deleting category",
        error: err,
      });
    });
  });
});
