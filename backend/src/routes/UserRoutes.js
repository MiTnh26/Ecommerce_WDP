const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
router.get("/user", UserController.getUsers);
router.post("/login", UserController.login);
router.post("/register", UserController.register);
router.post("/google-login", UserController.googleLogin);
router.get("/profile/:id", UserController.getUserById);
router.put("/profile/:id", UserController.updateUser);


module.exports = router;
