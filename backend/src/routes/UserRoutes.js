const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController/UserController");
const {sendEmailOtp, verifyOtp} = require("../service/sendEmailOtp");
const verifyOtpMiddleware = require("../middleware/verifyOtpMiddleware")
const multer = require("multer");
const { storage } = require("../config/cloudinary"); 
const upload = multer({ storage });

const { sendEmailOtp, verifyOtp } = require("../service/sendEmailOtp");
const verifyOtpMiddleware = require("../middleware/verifyOtpMiddleware");
router.get("/user", UserController.getUsers);
router.post("/login", UserController.login);
router.post("/register", UserController.register);
router.post("/google-login", UserController.googleLogin);
router.get("/profile/:id", UserController.getUserById);
router.put("/profile/:id",upload.single("Image"), UserController.updateUser);
// ADDRESS 

router.post("/user/:id/address", UserController.addAddress);
router.put("/user/:userId/address/:addressId", UserController.updateAddress);
router.get("/user/:userId/address/:addressId", UserController.getAddressById);
router.delete("/user/:userId/address/:addressId", UserController.deleteAddress); // optional
//order
router.get("/orders/:userId", UserController.getOrderByUserId);
router.get("/orderdetail/:orderId", UserController.getOrderDetails);
router.put('/user/:userId/address/:addressId/set-default', UserController.setDefaultAddress);
router.put("/change-password/:id",UserController.changePasswordInUser);


// // POST tạo đơn hàng mới
// router.post("/", createOrder);

// // PUT cập nhật trạng thái đơn hàng
// router.put("/:orderId/status", updateOrderStatus);

// // DELETE đơn hàng
// router.delete("/:orderId", deleteOrder);

router.get("/getPaymentForChecout", UserController.getPaymentForCheckout);
router.post("/send-email", sendEmailOtp);
router.post("/verify-otp", verifyOtp);
router.put(
  "/change-password",
  verifyOtpMiddleware,
  UserController.changePassword
);
module.exports = router;
