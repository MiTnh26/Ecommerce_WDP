// import model
const Category = require("../../models/Categories");
// import mongoose
const mongoose = require("mongoose");

// get all 
const getLimitedCategories = async (req, res) => {
    const { limit = 4, skip = 0 } = req.query; // default = 5, skip = 0
    try {
        const categories = await Category.find()
            .skip(Number(skip))
            .limit(Number(limit));;
        res.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
// get length of categories
const getCategoryCount = async (req, res) => {
    try {
        const count = await Category.countDocuments();
        res.status(200).json({ count });
    } catch (error) {
        console.error("Error fetching category count:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    getLimitedCategories,
    getCategoryCount
};