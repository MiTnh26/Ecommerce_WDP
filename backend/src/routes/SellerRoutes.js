const express = require("express");
const router = express.Router();
const multer = require("multer");
const store = multer.memoryStorage();
const upload = multer({ storage: store });
const SellerController = require("../controllers/SellerController/SellerController");

router.get("/getShopInformation", SellerController.getShopByUserId);
router.put("/updateShopProfile", SellerController.updateShopProfile);
router.post(
  "/registerShop",
  upload.single("shopAvatar"),
  SellerController.registerShop
);
router.get("/getShopProvince", SellerController.getProvince);

module.exports = router;
