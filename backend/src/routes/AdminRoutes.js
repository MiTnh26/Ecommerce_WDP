const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/AdminController/AdminController");
router.get("/getUser", AdminController.getAllUser);
router.get("/getShop", AdminController.getAllShop);
router.put("/banUserById/:id", AdminController.banUserById);
router.get("/getUserProfile", AdminController.getUserProfile);
router.get("/findUserByEmail", AdminController.findUserByEmail);
router.get("/findShopByEmail", AdminController.findShopByEmail);
router.put("/banShop/:id", AdminController.banShopById);

module.exports = router;
