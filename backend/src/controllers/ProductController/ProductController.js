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
          Price: { $first: "$Product.ProductVariant.Price" },
          currentSold: { $sum: "$Product.ProductVariant.Quantity" },
          currentRevenue: { 
            $sum: { 
              $multiply: ["$Product.ProductVariant.Quantity", "$Product.ProductVariant.Price"] 
            } 
          }
        }
      },
      {
        $lookup: {
          from: "products", // Tên collection trong MongoDB
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      {
        $unwind: "$productDetails"
      },
      {
        $addFields: {
          StockQuantity: {
            $first: "$productDetails.ProductVariant.StockQuantity"
          }
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
      {
        $unwind: "$Product"
      },
      {
        $unwind: "$Product.ProductVariant"
      },
      {
        $group: {
          _id: "$Product._id",
          previousSold: { $sum: "$Product.ProductVariant.Quantity" }
        }
      }
    ]);
    // Tính toán trending
    const trendingProducts = currentPeriodData.map(current => {
      const previous = previousPeriodData.find(p => p._id.toString() === current._id.toString());
      const previousSold = previous ? previous.previousSold : 0;
      
      // Tính tỷ lệ tăng trưởng
      const growthRate = previousSold > 0 
        ? ((current.currentSold - previousSold) / previousSold) * 100 
        : current.currentSold > 0 ? 100 : 0;

      return {
        _id: current._id,
        ProductName: current.ProductName,
        ProductImage: current.ProductImage,
        Price:  current.Price,
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
    throw error;
  }
};

exports.getNewProducts = async (req, res) => {
  const {limit = 10} = req.query;
  const {page = 0} = req.query;
  //console.log("Fetching new products with limit:", limit, "and page:", page);
  try {
    const products = await Product.find()
    .select({
        _id: 1,
        ProductName: 1,
        ProductImage: 1,
        StockQuantity: { $arrayElemAt: ["$ProductVariant.StockQuantity", 0] }, // Lấy StockQuantity của phần tử đầu tiên
        Price: { $arrayElemAt: ["$ProductVariant.Price", 0] } // Lấy Price của phần tử đầu tiên
    })
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .limit(Number(limit))
      .skip(Number(page) * Number(limit))
    
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
      {
        $group: {
         _id: "$Product._id",
          ProductName: { $first: "$Product.ProductName" },
          ProductImage: { $first: "$Product.ProductImage" },
          Price: { $first: "$Product.ProductVariant.Price" },
          //totalSold: { $sum: "$Product.ProductVariant.Quantity" },
          // totalRevenue: { 
          //   $sum: { 
          //     $multiply: ["$Product.ProductVariant.Quantity", "$Product.ProductVariant.Price"] 
          //   } 
          // }
        }
      },
      {
        $lookup: {
          from: "products", // Name of the collection in MongoDB
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      {
        $unwind: "$productDetails"
      },
      {
        $addFields: {
          StockQuantity: {
            $first: "$productDetails.ProductVariant.StockQuantity"
          }
        }
      },
      {
        $project: {
          _id: 1,
          ProductName: 1,
          ProductImage: 1,
          Price: 1,        
          StockQuantity: 1
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
  // if (!mongoose.Types.ObjectId.isValid(id)) {
  //   return res.status(400).json({ message: "Invalid product ID" });
  // }
  //console.log("Fetching product by ID:", id);
  try {
  const product = await Product.findOne({ _id: id.toString() })
    .select('_id ProductName ProductImage Description ProductVariant') // chỉ gọi 1 lần duy nhất
    .populate({
      path: 'CategoryId',
      select: '_id CategoryName',
    })
    .populate({
      path: 'ShopId',
      select: '_id name shopAvatar description address',
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching product" });
  }
}

exports.fetchProductsRelatedToCategory = async (req, res) => {
  try {
    const { category_id } = req.params;
    console.log("Fetching related products for category ID:", category_id);
    if (!category_id) {
      return res.status(400).json({ message: "Category ID is required" });
    }
    // const products = await Product.find({CategoryId: category_id})
    const products = await Product.aggregate([
  {
    $match: {
      CategoryId: new mongoose.Types.ObjectId(category_id)
    },
  },
  {
    $project: {
      _id: 1,
      ProductName: 1,
      ProductImage: 1,
      Description: 1,
      ProductVariant: 1,
      Price: {
        $max: "$ProductVariant.Price"
      }
    }
  },
  { $limit: 10 }
]);
   res.json(products);
  } catch (err) {
    console.error("Error fetching related products:", err);
    throw err;
  }
};
exports.filterProduct = async (req, res) => {
  try {
    let { name, category, fromPrice, toPrice, whereToBuyFilter } = req.body;
    let { limit = 20, page = 0 } = req.query;
    //category = "687904f506b1b9b68ea90144";
    //console.log("Filtering products with name:", name, "category:", category, "fromPrice:", fromPrice, "toPrice:", toPrice, "whereToBuyFilter:", whereToBuyFilter);
    const matchStage = {};

    if (name) {
      matchStage.ProductName = { $regex: name, $options: "i" };
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


