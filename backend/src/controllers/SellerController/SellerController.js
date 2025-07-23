// const { User, Shop } = require("../../models");

const User = require("../../models/Users");
const Shop = require("../../models/Shops");
const cloudinary = require("../../config/cloudinary");
const { Readable } = require("stream");

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
  const { owner, description, shopAvatar, name } = req.body;
  try {
    const shop = await Shop.findOne({ owner: owner });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found for this user" });
    }
    const updatedShop = await Shop.findByIdAndUpdate(
      shop._id,
      {
        name: name !== undefined ? name : shop.name,
        description: description !== undefined ? description : shop.description,
        shopAvatar: shopAvatar !== undefined ? shopAvatar : shop.shopAvatar,
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

    // 3) Convert uploaded file to Base64 data URL (instead of Cloudinary)
    let avatarDataUrl = "";
    if (req.file) {
      const mimeType = req.file.mimetype;
      const base64 = req.file.buffer.toString("base64");
      avatarDataUrl = `data:${mimeType};base64,${base64}`;

      /*
      // If you want to re-enable Cloudinary in the future, uncomment this:
      let avatarUrl = "";
      {
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

        // Store the HTTPS URL returned by Cloudinary
        avatarUrl = uploadResult.secure_url;
      }
      avatarDataUrl = avatarUrl; // If using Cloudinary, set avatarDataUrl = avatarUrl
      */
    }

    // 4) Create new Shop document using the updated schema fields
    const newShop = new Shop({
      name:        shopName,
      description: shopDescription,
      shopAvatar:  avatarDataUrl, // storing Base64 data URL
      owner:       owner,         // user._id
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
    return res
      .status(500)
      .json({ message: "Server error registering shop.", error });
  }
};

// get address.province
const getProvince = async (req, res) => {
  try {
    const province = await Shop.find().distinct("address.province");
    res.status(200).json(province);
  } catch (error) {
    res.status(500).json({ message: "Failed to get province", error });
  }
};

module.exports = { getShopByUserId, updateShopProfile, registerShop, getProvince };
