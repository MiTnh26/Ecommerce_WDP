const express = require("express");
const router = express.Router();
const multer = require("multer");
const store = multer.memoryStorage();
const upload = multer({ storage: store });
const SellerController = require("../controllers/SellerController/SellerController");
const StatisticController = require("../controllers/SellerController/StatisticController");

router.get("/getShopInformation", SellerController.getShopByUserId);
router.put("/updateShopProfile", SellerController.updateShopProfile);
router.get("/statistic", StatisticController.getSellerStatistics);
router.post(
  "/registerShop",
  upload.single("shopAvatar"),
  SellerController.registerShop
);

module.exports = router;
