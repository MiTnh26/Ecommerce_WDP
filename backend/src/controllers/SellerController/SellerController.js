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
    const { shopName, shopDescription = "", taxnumber = 0, owner } = req.body;

    // Validate 
    if (!shopName || !owner) {
      return res
        .status(400)
        .json({ message: "shopName and owner are required." });
    }

    // Owner exists
    const user = await User.findById(owner);
    if (!user) {
      return res.status(404).json({ message: "Owner not found." });
    }

    // upload to Cloudinary
    let logoUrl = "";
    if (req.file) {
      // multer
      const bufferStream = new Readable();
      bufferStream.push(req.file.buffer);
      bufferStream.push(null);

      // upload to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "seller_logos" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        bufferStream.pipe(stream);
      });

      logoUrl = uploadResult.secure_url; // HTTPS URL from Cloudinary
    }

    // Create document
    const newShop = new Shop({
      name:      shopName,
      describe:  shopDescription,
      logo:      logoUrl,
      taxnumber: taxnumber,
      owner:     owner, // user._id
    });

    const savedShop = await newShop.save();
    return res.status(201).json(savedShop);
  } catch (error) {
    console.error("Error in registerShop:", error);
    return res.status(500).json({ message: "Server error registering shop." });
  }
};

module.exports = { getShopByUserId, updateShopProfile, registerShop };
