const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });
const SellerController = require("../controllers/SellerController/SellerController");
const ViewListOrderController = require("../controllers/SellerController/ViewListOrder");
const ViewOrderDetailController = require("../controllers/SellerController/ViewOrderDetail");
const CategoryController = require("../controllers/SellerController/CategoryController");

router.get("/getShopInformation", SellerController.getShopByUserId);
router.put(
  "/updateShopProfile",
  upload.single("shopAvatar"),
  SellerController.updateShopProfile
);
router.post(
  "/registerShop",
  upload.single("shopAvatar"),
  SellerController.registerShop
);

router.get("/getShopProvince", SellerController.getProvince);

// Route lấy danh sách đơn hàng của seller
router.get("/orders", ViewListOrderController.getOrdersByShop);

// Route lấy chi tiết đơn hàng
router.get("/orders/:orderId", ViewOrderDetailController.getOrderDetail);
// Route cập nhật trạng thái đơn hàng
router.put("/orders/:orderId", ViewOrderDetailController.updateOrderStatus);

// Category CRUD
router.get("/categories", CategoryController.getAllCategories);
router.get("/categories/:id", CategoryController.getCategoryById);
router.post("/categories", CategoryController.createCategory);
router.put("/categories/:id", CategoryController.updateCategory);
router.delete("/categories/:id", CategoryController.deleteCategory);


module.exports = router;
