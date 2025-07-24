const express = require("express");
const multer  = require("multer");
const ctrl    = require("../controllers/ProductController/ProductController");
const ctrlCate    = require("../controllers/SellerController/CategoryController");
const { storage } = require("../config/cloudinary");  

const router = express.Router();

// 1) Configure Multer to upload straight into Cloudinary
const upload = multer({ storage });

// 2) GET /products — no file upload
router.get("/", ctrl.getAllProducts);

// 2a) GET /products/shop/:shopId — products for one shop
router.get("/shop/:shopId", ctrl.getAllProductsByShop);

// 3 & 4) POST /products & PUT /products
//    expect 1 × ProductImage + up to 9 × VariantImage
const cpUpload = upload.fields([
  { name: "ProductImage", maxCount: 1 },
  { name: "VariantImage",   maxCount: 9 }
]);

router.post("/", cpUpload, ctrl.saveProduct);
router.put( "/", cpUpload, ctrl.saveProduct);

// 5) POST /products/:id/variants — single file under “Image”
router.post("/:id/variants", upload.single("Image"), ctrl.addVariant);

// 6) PATCH /products/:id/status — toggle status
router.patch("/:id/status", ctrl.toggleStatus);

// 7) DELETE /products/:id — remove product
router.delete("/:id", ctrl.deleteProduct);

// 8) DELETE /products/:id/variants/:variantId — remove one variant
router.delete("/:id/variants/:variantId", ctrl.removeVariant);

// 9) GET /category — list categories
router.get("/category", ctrl.getCategories);

// 10) GET /category/shop/:shopId — list categories by shop
router.get("/category/shop/:shopId", ctrlCate.getCategoriesByShop);

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