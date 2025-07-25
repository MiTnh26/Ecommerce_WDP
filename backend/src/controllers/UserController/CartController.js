const mongoose = require("mongoose");

const Cart = require("../../models/Cart");
const User = require("../../models/Users");
const { Shop } = require("../../models");
const Order = require("../../models/Orders");
const OrderItem = require("../../models/OrderItems");

// helper to calculate total quantity in cart
const calculateTotalQuantity = (items) => {
  let count = 0;
  items?.forEach((item) => {
    count += item.ProductVariant?.length || 0;
  });
  return count;
};

exports.addToCart = async (req, res) => {
  try {
    // get data
    const {
      UserId = "",
      Product_id = "",
      ProductName = "",
      ProductImage = "",
      ShopID = "",
      //   Quantity = 0,
      ProductVariant = "",
    } = req.body;
    // console.log("UserId:", UserId);
    // console.log("Product_id:", Product_id);
    // console.log("ProductName:", ProductName);
    // console.log("ProductImage:", ProductImage);
    // console.log("ShopID:", ShopID);
    // console.log("Quantity:", Quantity);
    //console.log("ProductVariant:", ProductVariant);

    // check if data is valid
    if (
      !UserId ||
      !Product_id ||
      !ProductName ||
      !ProductImage ||
      !ShopID ||
      //   !Quantity ||
      !ProductVariant
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // check if user exist
    const user = await User.findById(UserId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    //check if cart by user not exist
    const cart = await Cart.findOne({ UserId });
    if (!cart) {
      const newCart = new Cart({
        UserId: new mongoose.Types.ObjectId(UserId),
        Items: [
          {
            _id: new mongoose.Types.ObjectId(Product_id),
            ProductName: ProductName,
            ProductImage: ProductImage,
            ShopID: new mongoose.Types.ObjectId(ShopID),
            ProductVariant: [
              {
                _id: new mongoose.Types.ObjectId(ProductVariant[0]._id),
                Image: ProductVariant[0].Image,
                Price: ProductVariant[0].Price,
                ProductVariantName: ProductVariant[0].ProductVariantName,
                Quantity: parseInt(ProductVariant[0].Quantity),
              },
            ],
          },
        ],
        Quantity: parseInt(ProductVariant[0].Quantity),
      });
      await newCart.save();
      return res.status(200).json({ message: "Add to cart successfully" });
    }
    // if cart exsit, check if product exist in cart
    const productIndex = cart.Items.findIndex((item) => item._id == Product_id);
    if (productIndex == -1) {
      // if product not exist in cart, add new product
      cart.Items.push({
        _id: new mongoose.Types.ObjectId(Product_id),
        ProductName: ProductName,
        ProductImage: ProductImage,
        ShopID: new mongoose.Types.ObjectId(ShopID),
        ProductVariant: [
          {
            _id: new mongoose.Types.ObjectId(ProductVariant[0]._id),
            Image: ProductVariant[0].Image,
            Price: ProductVariant[0].Price,
            ProductVariantName: ProductVariant[0].ProductVariantName,
            Quantity: parseInt(ProductVariant[0].Quantity),
          },
        ],
      });
    } else {
      // if product exist in cart, check product variant
      const variantIndex = cart.Items[productIndex].ProductVariant.findIndex(
        (variant) => variant._id == ProductVariant[0]._id
      );
      if (variantIndex == -1) {
        // if product variant not exist in cart, add new product variant
        cart.Items[productIndex].ProductVariant.push({
          _id: new mongoose.Types.ObjectId(ProductVariant[0]._id),
          Image: ProductVariant[0].Image,
          Price: ProductVariant[0].Price,
          ProductVariantName: ProductVariant[0].ProductVariantName,
          Quantity: parseInt(ProductVariant[0].Quantity),
        });
      } else {
        // if product variant exist in cart, update quantity
        cart.Items[productIndex].ProductVariant[variantIndex].Quantity +=
          parseInt(ProductVariant[0].Quantity);
      }
    }
    // calculate total quantity
    const items = cart.Items;
    const totalQuantity = calculateTotalQuantity(items);
    cart.Quantity = totalQuantity;
    await cart.save();

    return res.status(200).json({ message: "Added to cart successfully" });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      message: "Failed to add to cart",
      error: error.message || error,
    });
  }
};

exports.changeQuantity = async (req, res) => {
  try {
    // get data
    const { UserId = "", Product_id = "", ProductVariant = "" } = req.body;
    // console.log("UserId:", UserId);
    // console.log("Product_id:", Product_id);
    // console.log("ProductVariantId:", ProductVariant._id);

    // check valid data
    if (!UserId || !Product_id || !ProductVariant) {
      return res.status(400).json({ message: "All fields are requiredc" });
    }

    // find cart bu UserId
    const cart = await Cart.findOne({
      UserId: new mongoose.Types.ObjectId(UserId),
    });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // find product in cart
    const product = cart.Items.find((item) => item._id == Product_id);
    if (!product) {
      return res.status(404).json({ message: "Product not found in cart" });
    }
    // find product variant in product
    const productVariant = product.ProductVariant.find(
      (variant) => variant._id == ProductVariant._id
    );
    if (!productVariant) {
      return res.status(404).json({ message: "Product variant not found" });
    }

    // update quantity
    productVariant.Quantity = parseInt(ProductVariant.Quantity);
    // calculate total quantity
    const items = cart.Items;
    const totalQuantity = calculateTotalQuantity(items);
    cart.Quantity = totalQuantity;
    await cart.save();

    res.status(200).json({ message: "Change quantity successfully" });
  } catch (error) {
    console.error("Change quantity error:", error);
    return res.status(500).json({
      message: "Failed to change quantity",
      error: error.message || error,
    });
  }
};

exports.deleteProductVariantInCart = async (req, res) => {
  try {
    // get data
    const { UserId = "", Product_id = "", ProductVariant = "" } = req.body;
    // console.log("UserId:", UserId);
    // console.log("Product_id:", Product_id);
    // console.log("ProductVariantId:", ProductVariant._id);

    // check valid data
    if (!UserId || !Product_id || !ProductVariant) {
      return res.status(400).json({ message: "All fields are requiredc" });
    }

    // find cart bu UserId
    const cart = await Cart.findOne({
      UserId: new mongoose.Types.ObjectId(UserId),
    });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // find product in cart
    const product = cart.Items.find((item) => item._id == Product_id);
    if (!product) {
      return res.status(404).json({ message: "Product not found in cart" });
    }
    // find product variant in product
    const productVariant = product.ProductVariant.find(
      (variant) => variant._id == ProductVariant._id
    );
    if (!productVariant) {
      return res.status(404).json({ message: "Product variant not found" });
    }

    // delete product variant in product
    product.ProductVariant = product.ProductVariant.filter(
      (variant) => variant._id != ProductVariant._id
    );
    // Nếu sau khi xóa variant mà mảng rỗng, xóa luôn item khỏi cart.Items
    if (product.ProductVariant.length === 0) {
      cart.Items = cart.Items.filter((item) => item._id != Product_id);
    }
    // calculate total quantity
    const items = cart.Items;
    const totalQuantity = calculateTotalQuantity(items);
    cart.Quantity = totalQuantity;
    await cart.save();

    res.status(200).json({ message: "Delete product variant successfully" });
  } catch (error) {
    console.error("Delete product variant error:", error);
    return res.status(500).json({
      message: "Failed to delete product variant",
      error: error.message || error,
    });
  }
};
exports.getCartByUserId = async (req, res) => {
  try {
    const { UserId } = req.body;
    if (!UserId) {
      return res.status(400).json({ message: "All fields are required" });
    }
    console.log("userId", UserId);

    const cart = await Cart.aggregate([
      { $match: { UserId: new mongoose.Types.ObjectId(UserId) } },

      // Tách từng item trong cart
      { $unwind: "$Items" },

      // Lấy thông tin shop cho từng item
      {
        $lookup: {
          from: "shops",
          localField: "Items.ShopID",
          foreignField: "_id",
          as: "ShopDetail",
        },
      },
      { $unwind: { path: "$ShopDetail", preserveNullAndEmptyArrays: true } },

      // Lấy thông tin product cho từng item
      {
        $lookup: {
          from: "products",
          localField: "Items._id",
          foreignField: "_id",
          as: "ProductDetail",
        },
      },
      { $unwind: { path: "$ProductDetail", preserveNullAndEmptyArrays: true } },

      // Tách từng variant trong item (nếu có nhiều variants)
      { $unwind: "$Items.ProductVariant" },

      // Tìm status của variant trong ProductDetail
      {
        $addFields: {
          "Items.ProductVariant.Status": {
            $let: {
              vars: {
                matchedVariant: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$ProductDetail.ProductVariant",
                        cond: {
                          $eq: ["$$this._id", "$Items.ProductVariant._id"],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
              in: "$$matchedVariant.Status",
            },
          },
          "Items.ProductVariant.StockQuantity": {
            $let: {
              vars: {
                matchedVariant: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$ProductDetail.ProductVariant",
                        cond: { $eq: ["$$this._id", "$Items.ProductVariant._id"] }
                      }
                    },
                    0
                  ]
                }
              },
              in: "$$matchedVariant.StockQuantity"
            }
          },
          "Items.ShopStatus": "$ShopDetail.status",
          "Items.ProductStatus": "$ProductDetail.Status",
        },
      },

      // Gom lại từng item với các variants của nó
      {
        $group: {
          _id: {
            cartId: "$_id",
            itemId: "$Items._id",
          },
          UserId: { $first: "$UserId" },
          Quantity: { $first: "$Quantity" },
          ProductName: { $first: "$Items.ProductName" },
          ProductImage: { $first: "$Items.ProductImage" },
          ShopID: { $first: "$Items.ShopID" },
          ShopName: { $first: "$ShopDetail.name" },
          ShopStatus: { $first: "$Items.ShopStatus" },
          ProductStatus: { $first: "$Items.ProductStatus" },
          ProductVariants: { $push: "$Items.ProductVariant" },
        },
      },

      // Gom lại thành cart hoàn chỉnh
      {
        $group: {
          _id: "$_id.cartId",
          UserId: { $first: "$UserId" },
          Quantity: { $first: "$Quantity" },
          Items: {
            $push: {
              _id: "$_id.itemId",
              ProductName: "$ProductName",
              ProductImage: "$ProductImage",
              ShopID: "$ShopID",
              ShopName: "$ShopName",
              ShopStatus: "$ShopStatus",
              ProductStatus: "$ProductStatus",
              ProductVariant: "$ProductVariants",
            },
          },
        },
      },
      {
        $sort: {
          "Items._id": 1,
          "Items.ProductVariant._id": 1,
        },
      },
    ]);
    if (!cart || cart.length === 0) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Chỉ gửi response 1 lần duy nhất
    return res.status(200).json(cart[0]); // Lấy cart đầu tiên vì aggregate trả về array
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      message: "Failed to get cart",
      error: error.message || error,
    });
  }
};
exports.getToTalItemInCart = async (req, res) => {
  try {
    const { UserId } = req.body;

    if (!UserId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    const objectUserId = new mongoose.Types.ObjectId(UserId);

    const result = await Cart.aggregate([
      { $match: { UserId: objectUserId } },
      { $unwind: "$Items" },
      { $unwind: "$Items.ProductVariant" },
      {
        $group: {
          _id: null,
          totalProductVariantCount: { $sum: 1 },
        },
      },
    ]);

    const total = result[0]?.totalProductVariantCount || 0;

    return res.status(200).json({ totalProductVariantCount: total });
  } catch (error) {
    console.error("Get total product variant error:", error);
    return res.status(500).json({
      message: "Failed to get total product variant count",
      error: error.message || error,
    });
  }
};
exports.buyAgain = async (req, res) => {
  try {
    const { orderId } = req.params;
    const cleanedOrderId = orderId.trim();
    const userId = req.body.UserId;

    if (!userId) return res.status(400).json({ message: "Thiếu UserId" });

    // Lấy đơn hàng và populate OrderItem
    const order = await Order.findById(cleanedOrderId).populate({
      path: "Items",
      model: "OrderItem",
    });

    if (!order || !order.Items) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy đơn hàng hoặc không có sản phẩm" });
    }

    const orderItem = order.Items; // Vì chỉ là 1 object chứ không phải mảng

    if (!orderItem.Product || orderItem.Product.length === 0) {
      return res
        .status(400)
        .json({ message: "Không có sản phẩm trong OrderItem" });
    }

    // Tìm giỏ hàng người dùng
    const cart = await Cart.findOne({ UserId: userId });
    if (!cart) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy giỏ hàng người dùng" });
    }

    let totalProductCount = 0;

    // Lặp qua từng product trong OrderItem
    for (const product of orderItem.Product) {
      const newCartItem = {
        ProductName: product.ProductName,
        ProductImage: product.ProductImage,
        ShopID: order.ShopId,
        ProductVariant: product.ProductVariant.map((variant) => ({
          _id: variant._id,
          Image: variant.Image,
          Price: variant.Price,
          ProductVariantName: variant.ProductVariantName,
          Quantity: variant.Quantity,
        })),
      };

      cart.Items.push(newCartItem);
      totalProductCount += 1;
    }

    if (totalProductCount === 0) {
      return res
        .status(400)
        .json({ message: "Không có sản phẩm hợp lệ để mua lại" });
    }

    cart.Quantity += totalProductCount;
    await cart.save();

    res.status(200).json({ message: "Mua lại thành công", cart });
  } catch (err) {
    console.error("Buy Again Error:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
