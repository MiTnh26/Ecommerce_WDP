const Product  = require("../../models/Products");
const Category = require("../../models/Categories");

/**
 * GET /products
 */
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("CategoryId")
      .populate("ShopId");
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching products" });
  }
};

/**
 * POST /products   (create)
 * PUT  /products   (update)
 * Expects multipart/form-data
 */
exports.saveProduct = async (req, res) => {
  try {
    // ─── 1) Core fields ───
    const {
      id,
      CategoryId,
      ShopId,
      ProductName,
      Description = "",
      Status      = "Active",
    } = req.body;

    if (!ShopId) {
      return res.status(400).json({ message: "ShopId is required" });
    }

    // ─── 2) Main image (Cloudinary) ───
    let productImageUrl = "";
    const mainFiles = req.files?.ProductImage || [];
    if (mainFiles.length > 0) {
      // multer-storage-cloudinary puts the uploaded URL in .path
      productImageUrl = mainFiles[0].path;
    }

    // ─── 3) Variants ───
    let rawVariants = req.body.ProductVariant || [];
    if (!Array.isArray(rawVariants)) {
      rawVariants = [rawVariants];
    }
    const variantFiles = req.files?.VariantImage || [];

    const variantDocs = rawVariants.map((v, idx) => {
      let imageUrl = v.Image || "";
      const file = variantFiles[idx];
      if (file) {
        imageUrl = file.path;
      }
      return {
        ProductVariantName: v.ProductVariantName,
        Price:              Number(v.Price)        || 0,
        StockQuantity:      Number(v.StockQuantity)|| 0,
        Status:             v.Status              || "Active",
        Image:              imageUrl,
      };
    });

    if (!id && variantDocs.length < 1) {
      return res
        .status(400)
        .json({ message: "You must supply at least one variant." });
    }

    let product;
    if (id) {
      // ─── UPDATE ───
      const updates = {
        CategoryId,
        ShopId,
        ProductName,
        Description,
        Status,
      };
      if (productImageUrl) updates.ProductImage = productImageUrl;
      if (variantDocs.length) updates.ProductVariant = variantDocs;

      product = await Product.findByIdAndUpdate(id, updates, { new: true });
    } else {
      // ─── CREATE ───
      product = new Product({
        CategoryId,
        ShopId,
        ProductName,
        Description,
        Status,
        ProductImage:   productImageUrl,
        ProductVariant: variantDocs,
      });
      await product.save();
    }

    return res.json(product);
  } catch (err) {
    console.error("Error in saveProduct:", err);
    return res
      .status(500)
      .json({ message: "Server error saving product", error: err.message });
  }
};

/**
 * POST /products/:id/variants
 */
exports.addVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      ProductVariantName,
      Price = 0,
      StockQuantity = 0,
      Status = "Active",
    } = req.body;

    // Image URL from Cloudinary or fallback
    let imageUrl = req.body.Image || "";
    if (req.file) {
      imageUrl = req.file.path;
    }

    const product = await Product.findById(id);
    product.ProductVariant.push({
      ProductVariantName,
      Image:          imageUrl,
      Price:          Number(Price),
      StockQuantity:  Number(StockQuantity),
      Status,
    });
    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error adding variant" });
  }
};

/**
 * PATCH /products/:id/status
 */
exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    product.Status = product.Status === "Active" ? "Inactive" : "Active";
    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error toggling status" });
  }
};

/**
 * DELETE /products/:id
 */
exports.deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
};

/**
 * DELETE /products/:id/variants/:variantId
 */
exports.removeVariant = async (req, res) => {
  const { id, variantId } = req.params;
  const product = await Product.findById(id);
  product.ProductVariant.id(variantId).remove();
  await product.save();
  res.json(product);
};

/**
 * GET /category
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    console.error("Server error fetching categories:", err);
    res.status(500).json({ message: "Server error fetching categories" });
  }
};
