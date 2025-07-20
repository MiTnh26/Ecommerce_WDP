const express = require("express");
const router = express.Router();
const multer = require("multer");
const store = multer.memoryStorage();
const upload = multer({ storage: store });
const SellerController = require("../controllers/SellerController/SellerController");
const ViewListOrderController = require("../controllers/SellerController/ViewListOrder");
const ViewOrderDetailController = require("../controllers/SellerController/ViewOrderDetail");

router.get("/getShopInformation", SellerController.getShopByUserId);
router.put("/updateShopProfile", SellerController.updateShopProfile);
router.post(
  "/registerShop",
  upload.single("shopAvatar"),
  SellerController.registerShop
);

// Route lấy danh sách đơn hàng của seller
router.get("/orders", ViewListOrderController.getOrdersByShop);

// Route lấy chi tiết đơn hàng
router.get("/orders/:orderId", ViewOrderDetailController.getOrderDetail);
// Route cập nhật trạng thái đơn hàng
router.put("/orders/:orderId", ViewOrderDetailController.updateOrderStatus);

module.exports = router;
