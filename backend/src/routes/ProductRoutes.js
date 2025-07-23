// backend/src/routes/ProductRoutes.js

const express = require("express");
const multer  = require("multer");
const ctrl    = require("../controllers/ProductController/ProductController");

const router = express.Router();

// 1) Configure Multer to keep files in memory (so your controller can base64-encode them)
const storage = multer.memoryStorage();
const upload  = multer({ storage });

// 2) GET /products — no file upload
router.get("/", ctrl.getAllProducts);

// 3) POST /products — single file under “ProductImage”
router.post(
  "/",
  upload.single("ProductImage"),
  ctrl.saveProduct
);

// 4) PUT /products — same as POST, for updates
router.put(
  "/",
  upload.single("ProductImage"),
  ctrl.saveProduct
);

// 5) POST /products/:id/variants — single file under “Image” for the new variant
router.post(
  "/:id/variants",
  upload.single("Image"),
  ctrl.addVariant
);

// 6) PATCH /products/:id/status — no file upload
router.patch(
  "/:id/status",
  ctrl.toggleStatus
);

// 7) GET /products/trending
router.get("/trending", ctrl.getTrendingProducts);

// 8) GET /products/new
router.get("/get-new", ctrl.getNewProducts);

// 9) GET /products/best-seller
router.get("/best-seller", ctrl.getBestSellerProducts);

// 11) GET /products/
router.post("/related-products", ctrl.fetchProductsRelated);

//12) POST /products/filter-product
router.post("/filter-product", ctrl.filterProduct);

// 10) GET /products/:id
router.get("/:id", ctrl.getProductById);

module.exports = router;