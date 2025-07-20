const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/AdminController/AdminController");
const CategoryController = require('../controllers/AdminController/CategoryController');

router.get("/getUser", AdminController.getAllUser);
router.get("/getShop", AdminController.getAllShop);
router.put("/banUserById/:id", AdminController.banUserById);
router.get("/getUserProfile", AdminController.getUserProfile);
router.get("/findUserByEmail", AdminController.findUserByEmail);
router.get("/findShopByEmail", AdminController.findShopByEmail);
router.put("/banShop/:id", AdminController.banShopById);

// Category CRUD
router.get('/categories', CategoryController.getAllCategories);
router.get('/categories/:id', CategoryController.getCategoryById);
router.post('/categories', CategoryController.createCategory);
router.put('/categories/:id', CategoryController.updateCategory);
router.delete('/categories/:id', CategoryController.deleteCategory);

module.exports = router;
