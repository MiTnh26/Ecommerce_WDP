// test/unit/controllers/statisticController.test.js

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  console.error.mockRestore();
});

const httpMocks = require('node-mocks-http');

// Mock models
jest.mock('../../../src/models/Shops', () => ({ findOne: jest.fn() }));
jest.mock('../../../src/models/Orders', () => ({ find: jest.fn() }));
jest.mock('../../../src/models/OrderItems', () => ({ find: jest.fn() }));

const Shop = require('../../../src/models/Shops');
const Order = require('../../../src/models/Orders');
const OrderItem = require('../../../src/models/OrderItems');
const { getSellerStatistics } = require('../../../src/controllers/SellerController/StatisticController');

describe('StatisticController › getSellerStatistics', () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();
    jest.clearAllMocks();
  });

  it('returns 400 if userId missing', async () => {
    // req.query.userId undefined
    await getSellerStatistics(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Missing userId' });
  });

  it('returns 404 if shop not found', async () => {
    req.query.userId = 'u1';
    Shop.findOne.mockResolvedValue(null);

    await getSellerStatistics(req, res);

    expect(Shop.findOne).toHaveBeenCalledWith({ owner: 'u1' });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Shop not found for this user' });
  });

  it('handles DB error at Shop.findOne', async () => {
    req.query.userId = 'u2';
    const err = new Error('fail1');
    Shop.findOne.mockRejectedValue(err);

    await getSellerStatistics(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error', error: err });
  });

  it('computes statistics correctly', async () => {
    // Setup
    req.query.userId = 'u3';
    req.query.year = '2021';
    const shop = { _id: 'shop1' };
    Shop.findOne.mockResolvedValue(shop);

    // orders: some statuses, dates
    const orders = [
      { Status: 'Delivered', TotalAmount: 100, OrderDate: '2021-01-15', Items: ['i1', 'i2'] },
      { Status: 'Pending', TotalAmount: 50, OrderDate: '2021-02-20', Items: ['i3'] },
      { Status: 'Delivered', TotalAmount: 200, OrderDate: '2021-01-10', Items: [] },
    ];
    Order.find.mockResolvedValue(orders);

    // order items
    const orderItems = [
      { Product: [ { ProductName: 'P1', ProductVariant: [ { ProductVariantName: 'V1', Quantity: 2, Image: 'img1' } ] } ] },
      { Product: [ { ProductName: 'P1', ProductVariant: [ { ProductVariantName: 'V1', Quantity: 3 } ] } ] },
      { Product: [ { ProductName: 'P2', ProductVariant: [ { ProductVariantName: 'V2', Quantity: 1, Image: 'img2' } ] } ] },
    ];
    OrderItem.find.mockResolvedValue(orderItems);

    await getSellerStatistics(req, res);

    // Assertions
    expect(Shop.findOne).toHaveBeenCalledWith({ owner: 'u3' });
    expect(Order.find).toHaveBeenCalledWith({
      ShopId: 'shop1',
      OrderDate: { $gte: new Date('2021-01-01'), $lte: new Date('2021-12-31') },
    });

    expect(res.status).toHaveBeenCalledWith(200);
    const resp = res.json.mock.calls[0][0];
    // totalOrders = 3
    expect(resp.totalOrders).toBe(3);
    // totalRevenue sums only Delivered: 100+200=300
    expect(resp.totalRevenue).toBe(300);
    // statusCount
    expect(resp.statusCount).toEqual({ Pending:1, Delivered:2, Cancelled:0, Processing:0, Shipping:0, Returned:0 });
    // monthlyRevenue: month 0: Delivered Jan(100+200)=300; month1:0 because pending not counted
    expect(resp.monthlyRevenue[0]).toBe(300);
    expect(resp.monthlyRevenue[1]).toBe(0);
    // topProducts: P1-V1 qty=5, img 'img1'; P2-V2 qty1
    expect(resp.topProducts).toEqual([
      { name: 'P1 - V1', quantity:5, image:'img1' },
      { name: 'P2 - V2', quantity:1, image:'img2' },
    ]);
  });

  it('handles error in Order.find', async () => {
    req.query.userId = 'u4';
    Shop.findOne.mockResolvedValue({ _id: 's4' });
    const err = new Error('fail2');
    Order.find.mockRejectedValue(err);

    await getSellerStatistics(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error', error: err });
  });

});
