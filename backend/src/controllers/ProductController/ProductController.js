
const Product = require("../../models/Products");
const Category = require("../../models/Categories");
const OrderItem = require("../../models/OrderItems");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;


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

exports.getAllProductsByShop = async (req, res) => {
  const { shopId } = req.params;
  if (!shopId) {
    return res.status(400).json({ message: "shopId param is required" });
  }
  try {
    const products = await Product.find({ ShopId: shopId })
      .populate("CategoryId")
      .populate("ShopId");
    res.json(products);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Server error fetching products", error: err.message });
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
      Status = "Active",
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
        Price: Number(v.Price) || 0,
        StockQuantity: Number(v.StockQuantity) || 0,
        Status: v.Status || "Active",
        Image: imageUrl,
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

    // Image URL from Cloudinary or fallback
    let imageUrl = req.body.Image || "";
    if (req.file) {
      imageUrl = req.file.path;
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

/*
* GET /products/trending
* Returns top 10 trending products based on sales or views.
*/ 
exports.getTrendingProducts = async (req, res) => {
  const limit = 10, trendingDays = 7, comparisonDays = 14
  try {
    //console.log("Fetching trending products...");
    const now = new Date();
    const currentPeriodStart = new Date(now.getTime() - (trendingDays * 24 * 60 * 60 * 1000));
    const previousPeriodStart = new Date(now.getTime() - (comparisonDays * 24 * 60 * 60 * 1000));
    //

     
    
    res.status(200).json({ message: "Fetching trending products..." });
    
  } catch (error) {
    console.error("Error getting trending products:", error);
    throw error;
  }
};

exports.getNewProducts = async (req, res) => {
  const {limit = 10} = req.query;
  const {page = 0} = req.query;
  //console.log("Fetching new products with limit:", limit, "and page:", page);
  try {
    const products = await Product.aggregate([
    {
      $match : {"Status": {$ne: "Inactive"}}
    },
    {
      $lookup: {
        from: "shops",
        localField: "ShopId",
        foreignField: "_id",
        as: "shop"
      }
    },
    { $unwind: "$shop" },
    { $match: { "shop.status": { $ne: "Banned" } } },
    {
      $project: {
        _id: 1,
        ProductName: 1,
        ProductImage: 1,
        ShopId: 1,
        StockQuantity: { $arrayElemAt: ["$ProductVariant.StockQuantity", 0] },
        Price: { $arrayElemAt: ["$ProductVariant.Price", 0] },
        
      }
    },
    { $sort: { createdAt: -1 } },
    { $skip: Number(page) * Number(limit) },
    { $limit: Number(limit) }
  ]);
    
    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching new products" });
  }
  }

exports.getBestSellerProducts = async (req, res) => {
  //console.log("Fetching best selling products...");
  const {limit = 10, page = 0} = req.query;
  try {
    const bestSellingProducts = await OrderItem.aggregate([
      {
        $match: { Status: "Delivered" }
      },
      {
        $unwind: "$Product"
      },
      {
        $unwind: "$Product.ProductVariant"
      },
      // join bảng product lây được shop id
      {
        $lookup: {
          from: "products",
          localField: "Product._id",
          foreignField: "_id",
          as: "Product_detail"
        }
      },
      {
        $match: {"Product_detail.Status": {$ne: "Inactive"} }
      },
      // join bang shop de lay duoc trang thai status
      {
        $lookup: {
          from: "shops",
          localField: "Product_detail.ShopId",
          foreignField: "_id",
          as: "Product_detail_with_shop"
        }
      },
      // match with not banned
      {
        $match: {
          "Product_detail_with_shop.status": { $ne: "Banned" }
        }
      },
      {
        $group: {
         _id: "$Product._id",
          ProductName: { $first: "$Product.ProductName" },
          ProductImage: { $first: "$Product.ProductImage" },
          Price: { $first: "$Product.ProductVariant.Price" },
          totalSold: { $sum: "$Product.ProductVariant.Quantity" },
        }
      },
      {
        $sort: { totalSold: -1 } // Sort by total sold, descending
      },
      {
        $skip: Number(page) * Number(limit)
      },
      {
        $limit: Number(limit)
      }
    ]);
    
    res.status(200).json(bestSellingProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching best selling products" });
  }
  };

exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
  const product = await Product.findOne({ _id: id.toString() })
    .select('_id ProductName ProductImage Description ProductVariant Status') // chỉ gọi 1 lần duy nhất
    .populate({
      path: 'ShopId',
      select: '_id name shopAvatar description address status',
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    // Shop: Banned - inactive, active: product =>  Shop is banned
    if (product.ShopId.status === "Banned" ) {
      return res.status(200).json({ product: null, message: "Shop is banned" });
    }
    // Shop: Active  - inactive, active: product =>  Product is stop selling
    if (product.ShopId.status === "Active" && product.Status === "Inactive") {
      return res.status(200).json({ product: null, message: "Product is stop selling" });
    }
    res.json({ product: product, message: "Fetch product successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching product" });
  }
}
const buildSearchPatterns = (input) => {
  const words = input.trim().toLowerCase().split(/\s+/); // Tách theo khoảng trắng
  const patterns = new Set();

  patterns.add(input.toLowerCase());
  for (let i = 0; i < words.length - 1; i++) {
    const phrase2 = `${words[i]} ${words[i + 1]}`;
    patterns.add(phrase2);
  }
  for (const word of words) {
    patterns.add(word);
  }
  return Array.from(patterns);
}


exports.fetchProductsRelated = async (req, res) => {
  try {
    const { name_product } = req.body;
    if (!name_product) {
      return res.status(400).json({ message: "Product name is required" });
    }
    const product_name = name_product;
    //console.log("Fetching related products for:", product_name);

    const searchWords = buildSearchPatterns(product_name);
    //console.log("Search words:", searchWords);
    const orConditions = searchWords.map(keyword => ({
      ProductName: { $regex: `\\b${keyword}\\b`, $options: "i" }
    }));

    const products = await Product.aggregate([
  {
    $match: {
      $or: orConditions,
    },
  },
  {
    $addFields: {
      Price: {
        $arrayElemAt: ["$ProductVariant.Price", 0], // không được dùng trực tiếp như vậy
      },
    },
  },
  {
    $limit: 10,
  },
]);

    return res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching related products:", err);
    return res.status(500).json({ error: "Lỗi khi tìm sản phẩm liên quan" });
  }
};


exports.filterProduct = async (req, res) => {
  try {
    let { name, category, fromPrice, toPrice, whereToBuyFilter } = req.body;
    let { limit = 20, page = 0 } = req.query;
    const nameRevert = name.trim();
    //category = "687904f506b1b9b68ea90144";
    //console.log("Filtering products with name:", name, "category:", category, "fromPrice:", fromPrice, "toPrice:", toPrice, "whereToBuyFilter:", whereToBuyFilter);
    const matchStage = {
      Status: "Active",
    };

    if (nameRevert) {
      //matchStage.ProductName = { $regex: nameRevert, $options: "i" };
      const patterns = buildSearchPatterns(nameRevert);
      matchStage.$or = patterns.map((pattern) => ({
        ProductName: { $regex: pattern, $options: "i" },
      }));
    }

    if (category) {
      //console.log("category", category);
      matchStage.CategoryId = new ObjectId(category);
    }

    if (fromPrice !== undefined || toPrice !== undefined) {
      matchStage.ProductVariant = { 
        $elemMatch: {
          Price: {}
        }
      };
      if (fromPrice !== undefined && fromPrice !== null && fromPrice !== "") {
        matchStage.ProductVariant.$elemMatch.Price.$gte = Number(fromPrice);
      }
      if (toPrice !== undefined && toPrice !== null && toPrice !== "") {
        matchStage.ProductVariant.$elemMatch.Price.$lte = Number(toPrice);
      }
    }

    if (whereToBuyFilter && whereToBuyFilter.length > 0) {
      // tỉnh thành sẽ được lọc ở bước sau lookup
    }

    const pipeline = [
      { $match: matchStage },
      {
        $addFields: {
          Price: { $ifNull: [{ $first: "$ProductVariant.Price" }, 0] },
          StockQuantity: { $ifNull: [{ $first: "$ProductVariant.StockQuantity" }, 0] }
        }
      },
      {
        $lookup: {
          from: "shops", // 👈 tên collection Shop
          localField: "ShopId",
          foreignField: "_id",
          as: "shopData"
        }
      },
      { $unwind: "$shopData" },
      { $match : {
        "shopData.status": "Active"
      }}
    ];

    if (whereToBuyFilter && whereToBuyFilter.length > 0) {
      pipeline.push({
        $match: {
          "shopData.address.province": { $in: whereToBuyFilter }
        }
      });
    }
     // Chỉ lấy các trường cần thiết
    pipeline.push({
      $project: {
        _id: 1,
        ProductName: 1,
        Description: 1,
        CategoryId: 1,
        Price: 1,
        StockQuantity: 1,
        ProductImage: 1
      }
    });

    const products = await Product.aggregate(pipeline).limit(10).skip(Number(page) * Number(limit));
    //console.log("Filtered products:", products);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error filtering products" });
  }
};
exports.getTrendingProducts2 = async (req, res) => {
  const limit = 10, trendingDays = 7, comparisonDays = 14;
  try {
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
      { $unwind: "$Product" },
      { $unwind: "$Product.ProductVariant" },
      {
        $group: {
          _id: "$Product._id",
          ProductName: { $first: "$Product.ProductName" },
          ProductImage: { $first: "$Product.ProductImage" },
          Price: { $first: "$Product.ProductVariant.Price" },
          currentSold: { $sum: "$Product.ProductVariant.Quantity" },
          currentRevenue: {
            $sum: {
              $multiply: [
                "$Product.ProductVariant.Quantity",
                "$Product.ProductVariant.Price"
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      {
        $match: {"productDetails.Status": {$ne: "Inactive"} }
      },
      { $unwind: "$productDetails" },
      {
        $addFields: {
          StockQuantity: { $first: "$productDetails.ProductVariant.StockQuantity" }
        }
      },
      {
        $project: {
          _id: 1,
          ProductName: 1,
          ProductImage: 1,
          Price: 1,
          currentSold: 1,
          currentRevenue: 1,
          StockQuantity: 1
        }
      }
    ]);

    // Lấy dữ liệu giai đoạn trước đó (7 ngày trước đó)
    const previousPeriodData = await OrderItem.aggregate([
      {
        $match: {
          Status: "Delivered",
          createdAt: {
            $gte: previousPeriodStart,
            $lt: currentPeriodStart
          }
        }
      },
      { $unwind: "$Product" },
      { $unwind: "$Product.ProductVariant" },
      {
        $group: {
          _id: "$Product._id",
          previousSold: { $sum: "$Product.ProductVariant.Quantity" }
        }
      }
    ]);

    // Tính toán trending
    const trendingProducts = currentPeriodData
      .map(current => {
        const previous = previousPeriodData.find(
          p => p._id.toString() === current._id.toString()
        );
        const previousSold = previous ? previous.previousSold : 0;

        // Tính tỷ lệ tăng trưởng
        const growthRate =
          previousSold > 0
            ? ((current.currentSold - previousSold) / previousSold) * 100
            : current.currentSold > 0
            ? 100
            : 0;

        return {
          _id: current._id,
          ProductName: current.ProductName,
          ProductImage: current.ProductImage,
          Price: current.Price,
          StockQuantity: current.StockQuantity,
          currentSold: current.currentSold,
          previousSold: previousSold,
          growthRate: Math.round(growthRate * 100) / 100,
          trendingScore: current.currentSold * (1 + growthRate / 100) // Scoring formula
        };
      })
      .filter(product => product.growthRate > 20)
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limit);

    res.status(200).json(trendingProducts);
  } catch (error) {
    console.error("Error getting trending products:", error);
    res.status(500).json({ message: "Server error getting trending products" });
  }
};
