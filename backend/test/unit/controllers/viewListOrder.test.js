// test/unit/controllers/viewListOrder.test.js

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

// Auto-mock the Order model
jest.mock("../../../src/models/Orders", () => ({ find: jest.fn() }));
const Order = require("../../../src/models/Orders");
const {
  getOrdersByShop,
} = require("../../../src/controllers/SellerController/ViewListOrder");

describe("SellerController › getOrdersByShop", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    // allow chaining .status().json()
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();
    jest.clearAllMocks();
  });

  it("400 when shopId missing", async () => {
    await getOrdersByShop(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Missing shopId" });
  });

  it("400 when shopId not a string", async () => {
    req.query.shopId = 12345;
    await getOrdersByShop(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid shopId format: not a string",
      receivedType: "number",
    });
  });

  it("400 when shopId is invalid ObjectId", async () => {
    req.query.shopId = "notAValidHex";
    await getOrdersByShop(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const callArg = res.json.mock.calls[0][0];
    expect(callArg.message).toBe("Invalid shopId format");
    expect(callArg.shopId).toBe("notAValidHex");
    expect(typeof callArg.details).toBe("string");
  });

  it("404 when no orders found", async () => {
    const hex24 = "aaaaaaaaaaaaaaaaaaaaaaaa";
    req.query.shopId = hex24;

    const chain = {
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([]),
    };
    Order.find.mockReturnValue(chain);

    await getOrdersByShop(req, res);

    expect(Order.find).toHaveBeenCalledWith({
      ShopId: new mongoose.Types.ObjectId(hex24),
    });
    expect(chain.populate).toHaveBeenCalledWith(
      "BuyerId",
      "Username ShippingAddress"
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "No orders found for this shop",
      shopId: hex24,
    });
  });

  it("returns mapped orders on success", async () => {
    const hex24 = "bbbbbbbbbbbbbbbbbbbbbbbb";
    req.query.shopId = hex24;

    const orders = [
      {
        _id: "o1",
        BuyerId: {
          Username: "Alice",
          ShippingAddress: [{ status: "Default", receiverName: "Alice" }],
        },
        OrderDate: "2025-07-01",
        Status: "Delivered",
        TotalAmount: 150,
      },
      {
        _id: "o2",
        BuyerId: {
          Username: "Bob",
          ShippingAddress: [],
        },
        OrderDate: "2025-07-02",
        Status: "Pending",
        TotalAmount: 75,
      },
    ];
    const chain = {
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(orders),
    };
    Order.find.mockReturnValue(chain);

    await getOrdersByShop(req, res);

    expect(res.json).toHaveBeenCalledWith([
      {
        _id: "o1",
        customerName: "N/A",
        dateAdd: "2025-07-01",
        status: "Delivered",
        totalAmount: 150,
      },
      {
        _id: "o2",
        customerName: "N/A",
        dateAdd: "2025-07-02",
        status: "Pending",
        totalAmount: 75,
      },
    ]);
  });

  it("500 on unexpected error", async () => {
    const hex24 = "cccccccccccccccccccccccc";
    req.query.shopId = hex24;

    const err = new Error("something bad");
    Order.find.mockImplementation(() => {
      throw err;
    });

    await getOrdersByShop(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    const payload = res.json.mock.calls[0][0];
    expect(payload.message).toBe("Error fetching orders");
    expect(payload.errorType).toBe(err.name);
    expect(payload.errorMessage).toBe(err.message);
    expect(payload.errorDetails).toHaveProperty("message", err.message);
  });
});
