// backend/src/routes/ProductRoutes.js

const express = require("express");
const multer  = require("multer");
const ctrl    = require("../controllers/ProductController/ProductController");

const router = express.Router();

// 1) Configure Multer to keep files in memory
const storage = multer.memoryStorage();
const upload  = multer({ storage });

// 2) GET /products — no file upload
router.get("/", ctrl.getAllProducts);

// 3 & 4) POST /products & PUT /products — accept one ProductImage and up to 9 VariantImage files
const cpUpload = upload.fields([
  { name: "ProductImage", maxCount: 1 },
  { name: "VariantImage",   maxCount: 9 }
]);

router.post("/", cpUpload, ctrl.saveProduct);
router.put( "/", cpUpload, ctrl.saveProduct);

// 5) POST /products/:id/variants — single file under “Image” for the new variant
router.post("/:id/variants", upload.single("Image"), ctrl.addVariant);

// 6) PATCH /products/:id/status — no file upload
router.patch("/:id/status", ctrl.toggleStatus);

// 7) DELETE /products/:id — delete a product
router.delete("/:id", ctrl.deleteProduct);

// 8) DELETE /products/:id/variants/:variantId — remove a variant
router.delete(
  "/:id/variants/:variantId",
  ctrl.removeVariant
);

module.exports = router;
