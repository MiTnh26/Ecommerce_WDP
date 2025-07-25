// test/mocks/handlers.js
const { rest } = require('msw');
const API = 'http://localhost:5000';

let products = [];
let nextId = 1;

const handlers = [
  // LIST PRODUCTS
  rest.get(`${API}/product/shop/:shopId`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(products));
  }),

  // CREATE PRODUCT
  rest.post(`${API}/product`, async (req, res, ctx) => {
    const body = req.body;
    const newProd = {
      _id: `p${nextId++}`,
      ProductName: body.get('ProductName'),
      CategoryId: { _id: body.get('CategoryId'), CategoryName: 'Cat' },
      Description: body.get('Description'),
      ProductImage: 'http://img.test/main.jpg',
      ProductVariant: [],
    };
    products.push(newProd);
    return res(ctx.status(200), ctx.json(newProd));
  }),

  // FETCH CATEGORIES
  rest.get(`${API}/product/category/shop/:shopId`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([{ _id: 'c1', CategoryName: 'Cat1' }]));
  }),

  // UPDATE PRODUCT
  rest.put(`${API}/product`, async (req, res, ctx) => {
    const body = req.body;
    const id = body.get('id');
    const idx = products.findIndex((p) => p._id === id);
    if (idx === -1) return res(ctx.status(404));
    products[idx].ProductName = body.get('ProductName');
    products[idx].Description = body.get('Description');
    return res(ctx.status(200), ctx.json(products[idx]));
  }),

  // DELETE PRODUCT
  rest.delete(`${API}/product/:id`, (req, res, ctx) => {
    products = products.filter((p) => p._id !== req.params.id);
    return res(ctx.status(204));
  }),
];

module.exports = { handlers };
