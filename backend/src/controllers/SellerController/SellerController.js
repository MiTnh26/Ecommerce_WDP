const { User, Shop } = require("../../models");
const cloudinary = require("../../config/cloudinary");
const { Readable } = require("stream");

const getShopByUserId = async (req, res) => {
  const { owner } = req.body;
  try {
    const shopInformation = await Shop.findOne({ owner }).populate("owner");
    if (!shopInformation) {
      return res.status(404).json({ message: "Shop not found for this user" });
    }
    res.status(200).json(shopInformation);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shop data", error });
  }
};
const updateShopProfile = async (req, res) => {
  const { owner, describe, logo, name } = req.body;
  try {
    const shop = await Shop.findOne({ owner });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found for this user" });
    }
    const updatedShop = await Shop.findByIdAndUpdate(
      shop._id,
      {
        name: name !== undefined ? name : shop.name,
        describe: describe !== undefined ? describe : shop.describe,
        logo: logo !== undefined ? logo : shop.logo,
      },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Shop profile updated", shop: updatedShop });
  } catch (error) {
    res.status(500).json({ message: "Fail to update shop data", error });
  }
};

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

    // 1) Validate required fields
    if (!shopName || !owner) {
      return res
        .status(400)
        .json({ message: "shopName and owner are required." });
    }

    // 2) Ensure owner (User) exists
    const user = await User.findById(owner);
    if (!user) {
      return res.status(404).json({ message: "Owner (user) not found." });
    }

    // 3) Handle file upload to Cloudinary (optional)
    let avatarUrl = "";
    if (req.file) {
      // Convert multer buffer to a readable stream
      const bufferStream = new Readable();
      bufferStream.push(req.file.buffer);
      bufferStream.push(null);

      // Upload to Cloudinary under folder "seller_avatars"
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "seller_avatars" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        bufferStream.pipe(stream);
      });

      avatarUrl = uploadResult.secure_url; // e.g. "https://res.cloudinary.com/...jpg"
    }

    // 4) Create new Shop document using the updated schema fields
    const newShop = new Shop({
      name:       shopName,
      description: shopDescription,
      shopAvatar:  avatarUrl,
      owner:       owner,
      address: {
        province,
        district,
        ward,
      },
      // status will default to "Pending"
    });

    const savedShop = await newShop.save();
    return res.status(201).json(savedShop);
  } catch (error) {
    console.error("Error in registerShop:", error);
    return res.status(500).json({ message: "Server error registering shop." });
  }
};

module.exports = { getShopByUserId, updateShopProfile, registerShop };
