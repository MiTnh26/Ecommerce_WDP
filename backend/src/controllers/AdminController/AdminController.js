const { User, Shop } = require("../../models");

const getAllUser = async (req, res) => {
  try {
    const users = await User.find({
      UserRole: { $in: ["Seller", "Customer"] },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error });
  }
};
const getAllShop = async (req, res) => {
  try {
    const shops = await Shop.find().populate("owner");
    console.log(shops[0]);
    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shops", error });
  }
};
const banUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newStatus = user.Status === "Active" ? "Banned" : "Active";

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { Status: newStatus },
      { new: true } // trả về user đã được cập nhật
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle user status", error });
  }
};
const getUserProfile = async (req, res) => {
  const { _id } = req.body;
  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Fail to fetch user profile", error });
  }
};
const findUserByEmail = async (req, res) => {
  const { Email } = req.body;

  try {
    const user = await User.findOne({
      Email: { $regex: Email, $options: "i" }, // "i" là không phân biệt hoa thường
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Fail to fetch user", error });
  }
};
const findShopByEmail = async (req, res) => {
  const { Email } = req.body;
  try {
    const shops = await Shop.aggregate([
      {
        $lookup: {
          from: "users", // tên collection User trong MongoDB
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      { $unwind: "$owner" },
      {
        $match: {
          "owner.Email": { $regex: Email, $options: "i" }, // tìm theo 1 phần email
        },
      },
    ]);
    if (shops.length === 0) {
      return res.status(404).json({ message: "Shop not found" });
    }

    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ message: "Fail to fetch shops", error });
  }
};
const banShopById = async (req, res) => {
  const { id } = req.params;
  try {
    // Tìm shop theo _id
    const shop = await Shop.findById(id).populate("owner");
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    // Đảo trạng thái shop
    const newStatus = shop.status === "Active" ? "Banned" : "Active";

    // Cập nhật shop theo _id
    const updatedShop = await Shop.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true }
    );

    res.status(200).json(updatedShop);
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle shop status", error });
  }
};

module.exports = {
  getAllUser,
  getAllShop,
  banUserById,
  getUserProfile,
  findUserByEmail,
  findShopByEmail,
  banShopById,
};
