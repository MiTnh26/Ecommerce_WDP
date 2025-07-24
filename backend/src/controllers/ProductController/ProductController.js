const Product = require("../../models/Products");
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
    //console.log("Fetching trending products...");
    const now = new Date();
    const currentPeriodStart = new Date(now.getTime() - (trendingDays * 24 * 60 * 60 * 1000));
    const previousPeriodStart = new Date(now.getTime() - (comparisonDays * 24 * 60 * 60 * 1000));

     
    
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
  // if (!mongoose.Types.ObjectId.isValid(id)) {
  //   return res.status(400).json({ message: "Invalid product ID" });
  // }
  //console.log("Fetching product by ID:", id);
  try {
  const product = await Product.findOne({ _id: id.toString() })
    .select('_id ProductName ProductImage Description ProductVariant Status') // chỉ gọi 1 lần duy nhất
    // .populate({
    //   path: 'CategoryId',
    //   select: '_id CategoryName',
    // })
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

  // 1. Toàn bộ chuỗi
  patterns.add(input.toLowerCase());

  // 2. Tổ hợp 2 từ liên tiếp (có thể mở rộng thành 3 từ, v.v.)
  for (let i = 0; i < words.length - 1; i++) {
    const phrase2 = `${words[i]} ${words[i + 1]}`;
    patterns.add(phrase2);
  }

  // 3. Từng từ riêng lẻ
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
      matchStage.ProductName = { $regex: nameRevert, $options: "i" };
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

