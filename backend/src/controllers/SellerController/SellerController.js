// const { User, Shop } = require("../../models");

const User = require("../../models/Users");
const Shop = require("../../models/Shops");

const { Readable } = require("stream");
const { cloudinary } = require("../../config/cloudinary");

const getShopByUserId = async (req, res) => {
  const { owner } = req.query;
  
  try {
    const shopInformation = await Shop.findOne({ owner: owner }).populate("owner");
    if (!shopInformation) {
      return res.status(404).json({ message: "Shop not found for this user" });
    }
    res.status(200).json(shopInformation);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shop data", error });
  }
};
const updateShopProfile = async (req, res) => {
  const { owner, description, name } = req.body;
  try {
    const shop = await Shop.findOne({ owner });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found for this user" });
    }

    // If a new avatar was uploaded, use its Cloudinary URL
    let newAvatar = shop.shopAvatar;
    if (req.file) {
      newAvatar = req.file.path;
    }

    const updatedShop = await Shop.findByIdAndUpdate(
      shop._id,
      {
        name:        name !== undefined ? name : shop.name,
        description: description !== undefined ? description : shop.description,
        shopAvatar:  newAvatar,
      },
      { new: true }
    );

    res.status(200).json({ message: "Shop profile updated", shop: updatedShop });
  } catch (error) {
    res.status(500).json({ message: "Fail to update shop data", error });
  }
};

/**
 * POST /registerShop
 */
const registerShop = async (req, res) => {
  try {
    const {
      shopName,
      shopDescription = "",
      owner,
      province = "",
      district = "",
      ward = "",
    } = req.body;

    if (!shopName || !owner) {
      return res
        .status(400)
        .json({ message: "shopName and owner are required." });
    }

    const user = await User.findById(owner);
    if (!user) {
      return res.status(404).json({ message: "Owner (user) not found." });
    }

    // Use the uploaded Cloudinary URL if present
    let avatarDataUrl = "";
    if (req.file) {
      avatarDataUrl = req.file.path;
    }

    const newShop = new Shop({
      name:        shopName,
      description: shopDescription,
      shopAvatar:  avatarDataUrl,
      owner,
      address: { province, district, ward },
    });

    const savedShop = await newShop.save();
    return res.status(201).json(savedShop);
  } catch (error) {
    console.error("Error in registerShop:", error);
    return res
      .status(500)
      .json({ message: "Server error registering shop.", error });
  }
};

module.exports = { getShopByUserId, updateShopProfile, registerShop };
