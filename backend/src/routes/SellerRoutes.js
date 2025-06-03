const express = require("express");
const router = express.Router();
const SellerController = require("../controllers/SellerController/SellerController");
router.get("/getShopInformation", SellerController.getShopByUserId);
router.put("/updateShopProfile", SellerController.updateShopProfile);
module.exports = router;
