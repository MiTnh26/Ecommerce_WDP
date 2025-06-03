const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController/UserController");
router.get("/user", UserController.getUsers);
router.post("/login", UserController.login);
router.post("/register", UserController.register);
router.post("/google-login", UserController.googleLogin);
module.exports = router;
