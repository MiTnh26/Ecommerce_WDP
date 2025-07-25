// test/unit/controllers/viewOrderDetail.test.js

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "log").mockImplementation(() => {});
});
afterAll(() => {
  console.error.mockRestore();
  console.log.mockRestore();
});

const httpMocks = require("node-mocks-http");
const mongoose = require("mongoose");

// Mock Order model
jest.mock("../../../src/models/Orders", () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));
const Order = require("../../../src/models/Orders");

// Controller
const {
  getOrderDetail,
  updateOrderStatus,
} = require("../../../src/controllers/SellerController/ViewOrderDetail");

describe("SellerController › ViewOrderDetail", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();
    jest.clearAllMocks();
  });

  describe("getOrderDetail", () => {
    it("400 when orderId missing", async () => {
      await getOrderDetail(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid order ID" });
    });

    it("400 when orderId invalid", async () => {
      req.params.orderId = "bad";
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);

      await getOrderDetail(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid order ID" });

      mongoose.Types.ObjectId.isValid.mockRestore();
    });

    it("404 when no order found", async () => {
      const validId = new mongoose.Types.ObjectId().toHexString();
      req.params.orderId = validId;
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      const chain = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      };
      Order.findById.mockReturnValue(chain);

      await getOrderDetail(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Order not found" });

      mongoose.Types.ObjectId.isValid.mockRestore();
    });

    it("200 and formatted order on success", async () => {
      const validId = new mongoose.Types.ObjectId().toHexString();
      req.params.orderId = validId;
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      const order = {
        _id: validId,
        OrderDate: "2025-07-20",
        Status: "Delivered",
        TotalAmount: 500,
        BuyerId: {
          Username: "User1",
          PhoneNumber: "123",
          ShippingAddress: [
            { status: "Other", receiverName: "X", phoneNumber: "000" },
            { status: "Default", receiverName: "Y", phoneNumber: "999" },
          ],
        },
        PaymentId: { PaymentMethod: "PayPal" },
        Items: {
          _id: "itemgrp1",
          Product: [
            {
              _id: "p1",
              ProductName: "Prod1",
              ProductImage: "img.png",
              ProductVariant: [
                {
                  _id: "v1",
                  ProductVariantName: "Var1",
                  Price: 10,
                  Quantity: 2,
                  Image: "vimg.png",
                },
              ],
            },
          ],
        },
      };
      const chain = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(order),
      };
      Order.findById.mockReturnValue(chain);

      await getOrderDetail(req, res);

      expect(res.json).toHaveBeenCalledWith({
        _id: validId,
        OrderDate: "2025-07-20",
        Status: "Delivered",
        TotalAmount: 500,
        Items: [
          {
            _id: "p1",
            ProductName: "Prod1",
            ProductImage: "img.png",
            ProductVariant: [
              {
                _id: "v1",
                ProductVariantName: "Var1",
                Price: 10,
                Quantity: 2,
                Image: "vimg.png",
              },
            ],
          },
        ],
        PaymentId: "N/A",
        ReceiverName: "N/A",
        ReceiverPhone: "N/A",
        ShippingAddress: "N/A",
      });

      mongoose.Types.ObjectId.isValid.mockRestore();
    });

    it("500 on unexpected error", async () => {
      const validId = new mongoose.Types.ObjectId().toHexString();
      req.params.orderId = validId;
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      const err = new Error("boom");
      Order.findById.mockImplementation(() => {
        throw err;
      });

      await getOrderDetail(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error fetching order details",
        error: err.message,
      });

      mongoose.Types.ObjectId.isValid.mockRestore();
    });
  });

  describe("updateOrderStatus", () => {
    it("400 when orderId invalid", async () => {
      req.params.orderId = "bad";
      req.body.Status = "Pending";
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);

      await updateOrderStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid order ID" });

      mongoose.Types.ObjectId.isValid.mockRestore();
    });

    it("400 when status invalid", async () => {
      const validId = new mongoose.Types.ObjectId().toHexString();
      req.params.orderId = validId;
      req.body.Status = "Unknown";
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      await updateOrderStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid order status",
      });

      mongoose.Types.ObjectId.isValid.mockRestore();
    });

    it("404 when order not found", async () => {
      const validId = new mongoose.Types.ObjectId().toHexString();
      req.params.orderId = validId;
      req.body.Status = "Delivered";
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      Order.findByIdAndUpdate.mockResolvedValue(null);

      await updateOrderStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Order not found" });

      mongoose.Types.ObjectId.isValid.mockRestore();
    });

    it("200 on success", async () => {
      const validId = new mongoose.Types.ObjectId().toHexString();
      req.params.orderId = validId;
      req.body.Status = "Cancelled";
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      const updated = { _id: validId, Status: "Cancelled" };
      Order.findByIdAndUpdate.mockResolvedValue(updated);

      await updateOrderStatus(req, res);
      expect(res.json).toHaveBeenCalledWith({
        message: "Order status updated successfully",
        order: updated,
      });

      mongoose.Types.ObjectId.isValid.mockRestore();
    });

    it("500 on unexpected error", async () => {
      const validId = new mongoose.Types.ObjectId().toHexString();
      req.params.orderId = validId;
      req.body.Status = "Pending";
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      const err = new Error("fail");
      Order.findByIdAndUpdate.mockImplementation(() => {
        throw err;
      });

      await updateOrderStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error updating order status",
        error: err.message,
      });

      mongoose.Types.ObjectId.isValid.mockRestore();
    });
  });
});
