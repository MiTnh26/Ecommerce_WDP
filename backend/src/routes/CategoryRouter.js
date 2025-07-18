const express = require("express");
const router = express.Router();
// import controller
const CategoryConttroller = require("../controllers/CategoryController/CategoryController");

// get limited 5 categories first
router.get("/get-all", CategoryConttroller.getLimitedCategories);
router.get("/get-count", CategoryConttroller.getCategoryCount);
module.exports = router;