const { User, Shop } = require("../../models");

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

module.exports = { getShopByUserId, updateShopProfile };
