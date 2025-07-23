const Category = require('../../models/Categories');

// Lấy tất cả category của shop
exports.getAllCategories = async (req, res) => {
  try {
    const shopId = req.query.shopId;
    if (!shopId) return res.status(400).json({ message: 'Missing shopId' });
    const categories = await Category.find({ ShopId: shopId });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error });
  }
};

// Lấy category theo id (chỉ lấy category của shop)
exports.getCategoryById = async (req, res) => {
  try {
    const shopId = req.query.shopId;
    if (!shopId) return res.status(400).json({ message: 'Missing shopId' });
    const category = await Category.findOne({ _id: req.params.id, ShopId: shopId });
    if (!category) return res.status(404).json({ message: 'Category not found or not belong to your shop' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error });
  }
};

// get categories by shopId
exports.getCategoriesByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    if (!shopId) {
      return res
        .status(400)
        .json({ message: "shopId parameter is required" });
    }
    const categories = await Category.find({ ShopId: shopId });
    res.json(categories);
  } catch (err) {
    console.error("Server error fetching categories by shop:", err);
    res
      .status(500)
      .json({ message: "Server error fetching categories", error: err.message });
  }
};

// Tạo mới category cho shop
exports.createCategory = async (req, res) => {
  try {
    const { CategoryName, Status, shopId } = req.body;
    if (!shopId) return res.status(400).json({ message: 'Missing shopId' });
    const newCategory = new Category({ CategoryName, Status, ShopId: shopId });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error });
  }
};

// Cập nhật category (chỉ cho phép update category của shop mình)
exports.updateCategory = async (req, res) => {
  try {
    const { CategoryName, Status, shopId } = req.body;
    if (!shopId) return res.status(400).json({ message: 'Missing shopId' });
    const updated = await Category.findOneAndUpdate(
      { _id: req.params.id, ShopId: shopId },
      { CategoryName, Status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Category not found or not belong to your shop' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error });
  }
};

// Xóa category (chỉ cho phép xóa category của shop mình)
exports.deleteCategory = async (req, res) => {
  try {
    const { shopId } = req.query;
    if (!shopId) return res.status(400).json({ message: 'Missing shopId' });
    const deleted = await Category.findOneAndDelete({ _id: req.params.id, ShopId: shopId });
    if (!deleted) return res.status(404).json({ message: 'Category not found or not belong to your shop' });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error });
  }
};
