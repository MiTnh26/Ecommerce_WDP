const { User, Shop } = require("../../models");

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

module.exports = { getShopByUserId, updateShopProfile };
