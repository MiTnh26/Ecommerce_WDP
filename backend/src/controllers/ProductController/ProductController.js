const Product = require("../../models/Products");
const Category = require("../../models/Categories");
const { Readable } = require("stream");

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
 * POST /products      (create)
 * PUT  /products      (update)
 * Expects multipart/form-data for ProductImage file.
 */
exports.saveProduct = async (req, res) => {
  try {
    // ─── DEBUG ───
    // console.log(">>> req.body:", req.body);
    // console.log(">>> req.files:", req.files);

    // ─── 1) Pull out core fields ───
    const {
      id,
      CategoryId,
      ShopId,
      ProductName,
      Description = "",
      Status = "Active",
    } = req.body;

    // If you still depend on session for ShopId, you can fall back here:
    // const finalShopId = ShopId || req.session?.shopId;
    if (!ShopId) {
      return res.status(400).json({ message: "ShopId is required" });
    }

    // ─── 2) Handle the main product image ───
    let productImageUrl = "";
    const mainFiles = req.files?.ProductImage || [];
    if (mainFiles.length > 0) {
      const file = mainFiles[0];
      const b64 = file.buffer.toString("base64");
      productImageUrl = `data:${file.mimetype};base64,${b64}`;
    }

    // ─── 3) Parse your variants ───
    // multer with upload.fields gives you:
    //   req.files.VariantImage = [File, File, ...]
    // and text fields like ProductVariant[0][ProductVariantName] end up
    // in req.body.ProductVariant as an array of objects.
    let rawVariants = req.body.ProductVariant || [];
    if (!Array.isArray(rawVariants)) {
      rawVariants = [rawVariants];
    }
    const variantFiles = req.files?.VariantImage || [];

    const variantDocs = rawVariants.map((v, idx) => {
      // v = { ProductVariantName, Price, StockQuantity, Image (the URL) }
      let imageUrl = v.Image || "";
      const file = variantFiles[idx];
      if (file) {
        const b64 = file.buffer.toString("base64");
        imageUrl = `data:${file.mimetype};base64,${b64}`;
      }
      return {
        ProductVariantName: v.ProductVariantName,
        Price: Number(v.Price) || 0,
        StockQuantity: Number(v.StockQuantity) || 0,
        Status: v.Status || "Active",
        Image: imageUrl,
      };
    });

    // On create, require ≥1 variant
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
        ProductImage: productImageUrl,
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

    // Determine image URL: uploaded file → Base64, else use body.Image
    let imageUrl = req.body.Image || "";
    if (req.file) {
      const mime = req.file.mimetype;
      const b64 = req.file.buffer.toString("base64");
      imageUrl = `data:${mime};base64,${b64}`;
    }

    const product = await Product.findById(id);
    product.ProductVariant.push({
      ProductVariantName,
      Image: imageUrl,
      Price: Number(Price),
      StockQuantity: Number(StockQuantity),
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

// DELETE /product/:id
exports.deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
};

// DELETE /product/:prodId/variants/:variantId
exports.removeVariant = async (req, res) => {
  const { prodId, variantId } = req.params;
  const product = await Product.findById(prodId);
  product.ProductVariant.id(variantId).remove();
  await product.save();
  res.json(product);
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    console.error("Server error fetching categories:", err);
    res.status(500).json({ message: "Server error fetching categories" });
  }
};
