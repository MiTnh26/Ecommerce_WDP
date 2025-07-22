const mongoose = require("mongoose");

const Cart = require("../../models/Cart");
const User = require("../../models/Users");
const { Shop } = require("../../models");

// helper to calculate total quantity in cart
const calculateTotalQuantity = (items) => {
  let total = 0;
  items.forEach((item) => {
    item.ProductVariant.forEach((variant) => {
      total += variant.Quantity;
    });
  });
  return total;
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
    console.log("UserId:", UserId);
    console.log("Product_id:", Product_id);
    console.log("ProductName:", ProductName);
    console.log("ProductImage:", ProductImage);
    console.log("ShopID:", ShopID);
    // console.log("Quantity:", Quantity);
    console.log("ProductVariant:", ProductVariant);

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
    try{
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
    }catch(error){
        console.error("Delete product variant error:", error);
        return res.status(500).json({
          message: "Failed to delete product variant",
          error: error.message || error,
        });
    }
};
exports.getCartByUserId = async (req, res) => {
  try {
    const {UserId} = req.body;
    if(!UserId){
      return res.status(400).json({ message: "All fields are requiredc" });
    }
    console.log("userId",UserId);
    const cart = await Cart.findOne({ UserId: new mongoose.Types.ObjectId(UserId) })
                            .populate({
                                path: "Items.ShopID",
                                select: "_id name"
                            });

    console.log("cart",cart);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.status(200).json(cart);
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      message: "Failed to get cart",
      error: error.message || error,
    });
  }
}
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

    return res.status(200).json({totalProductVariantCount: total});
  } catch (error) {
    console.error("Get total product variant error:", error);
    return res.status(500).json({
      message: "Failed to get total product variant count",
      error: error.message || error,
    });
  }
};
