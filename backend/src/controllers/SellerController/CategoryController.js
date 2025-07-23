const Category = require('../../models/Categories');

// Lấy tất cả category
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error });
  }
};

// Lấy category theo id
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
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

// Tạo mới category
exports.createCategory = async (req, res) => {
  try {
    const { CategoryName, Status } = req.body;
    const newCategory = new Category({ CategoryName, Status });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error });
  }
};

// Cập nhật category
exports.updateCategory = async (req, res) => {
  try {
    const { CategoryName, Status } = req.body;
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { CategoryName, Status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Category not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error });
  }
};

// Xóa category
exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error });
  }
};
