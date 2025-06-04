const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController/UserController");
const {sendEmailOtp, verifyOtp} = require("../service/sendEmailOtp");
const verifyOtpMiddleware = require("../middleware/verifyOtpMiddleware")
router.get("/user", UserController.getUsers);
router.post("/login", UserController.login);
router.post("/register", UserController.register);
router.post("/google-login", UserController.googleLogin);
router.get("/profile/:id", UserController.getUserById);
router.put("/profile/:id", UserController.updateUser);


router.post("/send-email", sendEmailOtp);
router.post("/verify-otp", verifyOtp);
router.put("/change-password",verifyOtpMiddleware, UserController.changePassword);
module.exports = router;
