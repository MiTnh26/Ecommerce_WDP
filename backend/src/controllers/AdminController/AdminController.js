const { User, Shop, Payment, Orders, Products } = require("../../models");

const getAllUser = async (req, res) => {
  try {
    const users = await User.find({
      UserRole: { $in: ["Seller", "Customer"] },
    });

    const usersWithOrderCount = await Promise.all(
      users.map(async (user) => {
        const deliveredOrders = await Orders.countDocuments({
          BuyerId: user._id, // hoặc userId tùy theo schema của bạn
          Status: "Delivered",
        });

        return {
          ...user.toObject(),
          totalOrders: deliveredOrders,
        };
      })
    );

    res.status(200).json(usersWithOrderCount);
  } catch (error) {
    console.error("Error in getAllUser:", error);
    res.status(500).json({ message: "Failed to fetch users", error });
  }
};
const getAllShop = async (req, res) => {
  try {
    const shops = await Shop.find().populate("owner");

    const shopsWithStats = await Promise.all(
      shops.map(async (shop) => {
        // Đếm sản phẩm
        const productCount = await Products.countDocuments({
          ShopId: shop._id,
        });

        // Đếm đơn hàng
        const orderCount = await Orders.countDocuments({ ShopId: shop._id });

        // Tính revenue từ các đơn hàng đã giao
        const deliveredOrders = await Orders.find({
          ShopId: shop._id,
          Status: "Delivered",
        });

        const revenue = deliveredOrders.reduce((total, order) => {
          return total + (order.TotalAmount || 0);
        }, 0);

        return {
          ...shop.toObject(),
          totalProducts: productCount,
          totalOrders: orderCount,
          revenue,
        };
      })
    );

    res.status(200).json(shopsWithStats);
  } catch (error) {
    console.error("ERROR in getAllShop:", error);
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
const acceptRegisterShopRequest = async (req, res) => {
  const { id } = req.params;

  try {
    // Tìm shop theo _id
    const shop = await Shop.findById(id).populate("owner");
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    // Cập nhật trạng thái shop thành "Active"
    const updatedShop = await Shop.findByIdAndUpdate(
      id,
      { status: "Active" },
      { new: true }
    );

    // Đổi UserRole của chủ shop thành 'Seller'
    if (shop.owner) {
      shop.owner.UserRole = 'Seller';
      await shop.owner.save();
    }

    res.status(200).json(updatedShop);
  } catch (error) {
    res.status(500).json({ message: "Failed to update shop status", error });
  }
};

const getPaymentMethod = async (req, res) => {
  try {
    const payments = await Payment.find();

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payment", error });
  }
};

const addPaymentMethod = async (req, res) => {
  try {
    const {
      status,
      name,
      type,

      provider,
      default: isDefault, // tránh dùng từ khoá "default"
    } = req.body;

    const paymentMethod = new Payment({
      Status: status || "Active",
      Name: name,
      Type: type,

      Provider: provider,
      Default: isDefault || false,
      CreateAt: new Date(),
    });

    const saved = await paymentMethod.save();

    res.status(201).json({
      message: "Payment method added successfully",
      paymentMethod: saved,
    });
  } catch (error) {
    console.error("Error adding payment method:", error);
    res.status(500).json({ message: "Fail to add payment", error });
  }
};
const updatePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Missing payment method ID" });
    }

    const currentData = await Payment.findById(id);
    if (!currentData) {
      return res.status(404).json({ message: "Payment method not found" });
    }

    // Lấy và chuẩn hóa dữ liệu từ body
    const {
      status,
      name,
      type,

      provider,
      default: isDefault, // alias để tránh từ khóa "default"
    } = req.body;

    // Chuẩn hóa và chỉ cập nhật nếu có sự thay đổi
    const fieldsToUpdate = {};

    if (status && status !== currentData.Status) {
      fieldsToUpdate.Status = status;
    }

    if (name && name.trim() !== currentData.Name) {
      fieldsToUpdate.Name = name.trim();
    }

    if (type && type.trim() !== currentData.Type) {
      fieldsToUpdate.Type = type.trim();
    }

    if (provider && provider.trim() !== currentData.Provider) {
      fieldsToUpdate.Provider = provider.trim();
    }

    // Xử lý logic set default
    if (typeof isDefault !== "undefined" && isDefault !== currentData.Default) {
      fieldsToUpdate.Default = isDefault;

      // Nếu đang set Default: true => reset các Default khác cùng Type
      const effectiveType = fieldsToUpdate.Type || currentData.Type;
      if (isDefault === true) {
        await Payment.updateMany(
          { Type: effectiveType, _id: { $ne: id } },
          { $set: { Default: false } }
        );
      }
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(200).json({ message: "No changes detected" });
    }

    // Cập nhật MongoDB
    const updated = await Payment.findByIdAndUpdate(id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "Payment method updated successfully",
      updatedFields: fieldsToUpdate,
      paymentMethod: updated,
    });
  } catch (error) {
    console.error("Error updating payment method:", error);
    res.status(500).json({ message: "Failed to update payment method", error });
  }
};

const deletePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Missing payment method ID" });
    }

    const deleted = await Payment.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Payment method not found" });
    }

    res.status(200).json({
      message: "Payment method deleted successfully",
      deletedMethod: deleted,
    });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    res.status(500).json({ message: "Failed to delete payment method", error });
  }
};
const setDefaultPaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm payment method theo id
    const targetPayment = await Payment.findById(id);

    if (!targetPayment) {
      return res.status(404).json({ message: "Payment method not found" });
    }

    const type = targetPayment.Type;

    // Set tất cả các payment method cùng Type về Default: false
    await Payment.updateMany({ Type: type }, { $set: { Default: false } });

    // Set payment hiện tại về Default: true
    targetPayment.Default = true;
    await targetPayment.save();

    res.status(200).json({
      message: `Set default payment method for Type '${type}' successfully`,
      paymentMethod: targetPayment,
    });
  } catch (error) {
    console.error("Error setting default payment method:", error);
    res.status(500).json({ message: "Failed to set default", error });
  }
};
const getAllOrder = async (req, res) => {
  try {
    const orders = await Orders.find().populate("Items").populate("PaymentId").populate("BuyerId");

    const totalTransactions = orders.length;

    const totalAmount = orders.reduce((sum, order) => {
      if (order.Status === "Delivered") {
        return sum + (order.TotalAmount || 0);
      }
      return sum;
    }, 0);

    // Lọc ra những đơn hàng có PaymentId và Status là Delivered
    const deliveredOrdersWithPayment = orders.filter(
      (order) => order.PaymentId && order.Status === "Delivered"
    );

    // Tạo thống kê theo từng phương thức thanh toán
    const paymentStatsMap = {};

    deliveredOrdersWithPayment.forEach((order) => {
      const paymentId = order.PaymentId._id.toString();
      if (!paymentStatsMap[paymentId]) {
        paymentStatsMap[paymentId] = {
          paymentId,
          name: order.PaymentId.Name || "Unknown",
          provider: order.PaymentId.Provider || "Unknown",
          totalTransactions: 0,
          totalAmount: 0,
        };
      }

      paymentStatsMap[paymentId].totalTransactions += 1;
      paymentStatsMap[paymentId].totalAmount += order.TotalAmount || 0;
    });

    const paymentStats = Object.values(paymentStatsMap);

    res.status(200).json({
      totalTransactions,
      totalAmount,
      orders,
      paymentStats,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error });
  }
};

const getAllProduct = async (req, res) => {
  try {
    const products = await Products.find().populate("ShopId");
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Fail to fetch products", error });
  }
};

const updateProfile = async (req, res) => {
  try {
    const updateData = req.body;

    // Nếu có file được upload (ảnh đại diện)
    if (req.file && req.file.path) {
      updateData.Image = req.file.path; // Gán link Cloudinary vào trường Image
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    console.error("Lỗi khi cập nhật người dùng:", err);
    res.status(500).json({ message: err.message });
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
  getPaymentMethod,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  getAllOrder,
  getAllProduct,
  acceptRegisterShopRequest,
  updateProfile,
};
