const Product = require("../../models/Products");
const OrderItem = require("../../models/OrderItems");
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
    // If multipart, express.json won't parse; use multer in route
    let {
      id,
      CategoryId,
      ShopId,
      ProductName,
      Description = "",
      Status = "Active",
    } = req.body;

    // Handle ProductImage file if present
    let imageUrl = "";
    if (req.file) {
      // convert to Base64 Data URL
      const mime = req.file.mimetype;
      const b64  = req.file.buffer.toString("base64");
      imageUrl    = `data:${mime};base64,${b64}`;
    }

    let product;
    if (id) {
      // update existing
      const updates = { CategoryId, ShopId, ProductName, Description, Status };
      if (imageUrl) updates.ProductImage = imageUrl;
      product = await Product.findByIdAndUpdate(id, updates, { new: true });
    } else {
      // create new
      product = new Product({
        CategoryId,
        ShopId,
        ProductName,
        Description,
        Status,
        ProductImage: imageUrl,
      });
      await product.save();
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error saving product" });
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
      const b64  = req.file.buffer.toString("base64");
      imageUrl    = `data:${mime};base64,${b64}`;
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
/*
* GET /products/trending
* Returns top 10 trending products based on sales or views.
*/ 
exports.getTrendingProducts = async (req, res) => {
  const limit = 10, trendingDays = 7, comparisonDays = 14
  try {
    console.log("Fetching trending products...");
    const now = new Date();
    const currentPeriodStart = new Date(now.getTime() - (trendingDays * 24 * 60 * 60 * 1000));
    const previousPeriodStart = new Date(now.getTime() - (comparisonDays * 24 * 60 * 60 * 1000));

    // Lấy dữ liệu giai đoạn hiện tại (7 ngày gần đây)
    const currentPeriodData = await OrderItem.aggregate([
      {
        $match: {
          Status: "Delivered",
          createdAt: { $gte: currentPeriodStart }
        }
      },
      {
        $unwind: "$Product"
      },
      {
        $unwind: "$Product.ProductVariant"
      },
      {
        $group: {
          _id: "$Product._id",
          ProductName: { $first: "$Product.ProductName" },
          ProductImage: { $first: "$Product.ProductImage" },
          currentSold: { $sum: "$Product.ProductVariant.Quantity" },
          currentRevenue: { 
            $sum: { 
              $multiply: ["$Product.ProductVariant.Quantity", "$Product.ProductVariant.Price"] 
            } 
          }
        }
      }
    ]);
    res.status(200).json({ message: "Trending products fetched successfully", currentPeriodData });
    

    
  } catch (error) {
    console.error("Error getting trending products:", error);
    throw error;
  }
};