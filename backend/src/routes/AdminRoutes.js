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
router.get("/getPaymentMethod", AdminController.getPaymentMethod);
router.post("/addPaymentMethod", AdminController.addPaymentMethod);
router.put("/updatePaymentMethod/:id", AdminController.updatePaymentMethod);
router.delete("/deletePaymentMethod/:id", AdminController.deletePaymentMethod);
router.put(
  "/setDefaultPaymentMethod/:id",
  AdminController.setDefaultPaymentMethod
);
router.get("/getOrder", AdminController.getAllOrder);
router.get("/getProduct", AdminController.getAllProduct);
router.put("/acceptShop/:id", AdminController.acceptRegisterShopRequest);
module.exports = router;
