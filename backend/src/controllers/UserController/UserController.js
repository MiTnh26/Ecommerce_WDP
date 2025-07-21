const { User, Payment } = require("../../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const JWT_SECRET = process.env.SECRET_KEY; // nên để trong .env
const { OAuth2Client } = require("google-auth-library");

const nodemailer = require("nodemailer");
// const  {Order,OrderItem}  = require("../../models/index");
const Order = require("../../models/Orders");
const OrderItem = require("../../models/OrderItems");

const client = new OAuth2Client(process.env.O2Auth_Key);

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error });
  }
};
const getPaymentForCheckout = async (req, res) => {
  try {
    const paymentMethod = await Payment.find();
    res.status(200).json(paymentMethod);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payment method", error });
  }
};
const login = async (req, res) => {
  try {
    const { Email, Password } = req.body;
    const user = await User.findOne({ Email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(Password, user.Password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Wrong password" });
    }

    // Tạo token, chứa thông tin cần thiết (ví dụ: id, email, role)
    const token = jwt.sign(
      {
        id: user._id,
        email: user.Email,
        role: user.Role || "Customer", // nếu có phân quyền
      },
      JWT_SECRET,
      { expiresIn: "1d" } // token hết hạn sau 1 ngày
    );

    // Gửi lại token cùng user info (loại bỏ mật khẩu trước)
    const { Password: _, ...userWithoutPassword } = user.toObject();

    return res.status(200).json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to login", error });
  }
};

const register = async (req, res) => {
  const { Username, Email, Gender, Password, PhoneNumber } = req.body;
  try {
    const existing = await User.findOne({ Email });
    if (existing) {
      return res.status(400).json({ message: "Email already exixsts" });
    }
    const hashed = await bcrypt.hash(Password, 10);
    const user = new User({
      Username,
      Email,
      Gender,
      Password: hashed,
      PhoneNumber,
    });
    await user.save();
    res.json({ message: "Register successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to register", error });
  }
};
const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture } = payload;

    let user = await User.findOne({ Email: email });

    if (!user) {
      user = new User({
        Email: email,
        FirstName: given_name || "",
        LastName: family_name || "",
        Image: picture || "",
        Password: "", // không có mật khẩu
        UserRole: "Customer",
        Status: "Active",
      });

      await user.save();
    }

    // ✅ Tạo token để frontend sử dụng sau này
    const tokenJWT = jwt.sign(
      {
        id: user._id,
        email: user.Email,
        role: user.UserRole || "Customer",
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Đăng nhập Google thành công",
      user,
      token: tokenJWT, // ✅ trả token về
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập Google:", error);
    res.status(401).json({ message: "Token không hợp lệ hoặc lỗi server" });
  }
};

const changePassword = async (req, res) => {
  const { newPassword } = req.body;
  //console.log("hi", newPassword);

  try {
    if (!req.session.otp)
      return res.status(400).json({ message: "OTP not found" });
    const user = await User.findOne({ Email: req.session.otp.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    user.Password = hashed;
    await user.save();
    // xoa otp
    req.session.otp = null;
    res.json({ message: "Change password successfully" });
  } catch (error) {
    console.log("Loi change password");
    res.status(500).json({ message: "Failed to change password" });
  }
};
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const updateData = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const addAddress = async (req, res) => {
  const { id } = req.params; // user id
  const { phoneNumber, receiverName, status, province, district, ward, detail } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Nếu chọn là địa chỉ mặc định, gỡ "Default" khỏi các địa chỉ khác
    if (status === "Default") {
      user.ShippingAddress.forEach((addr) => {
        addr.status = "Inactive";
      });
    }

    const newAddress = {
      _id: new mongoose.Types.ObjectId(),
      phoneNumber,
      receiverName,
      status: status || "Inactive",
      province,
      district,
      ward,
      detail,
    };


    user.ShippingAddress.push(newAddress);
    await user.save();

    res
      .status(200)
      .json({ message: "Address added successfully", address: newAddress });
  } catch (error) {
    res.status(500).json({ message: "Failed to add address", error });
  }
};
const updateAddress = async (req, res) => {
  const { userId, addressId } = req.params;
  const { phoneNumber, receiverName, status, province, district, ward, detail } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const addr = user.ShippingAddress.id(addressId);
    if (!addr) return res.status(404).json({ message: "Address not found" });
    if (!phoneNumber || !receiverName) {
      return res.status(400).json({ message: "Thiếu thông tin địa chỉ" });
    }

    // Nếu cập nhật thành mặc định => gỡ mặc định ở các địa chỉ khác
    if (status === "Default") {
      user.ShippingAddress.forEach((a) => {
        if (a._id.toString() !== addressId) {
          a.status = "Inactive";
        }
      });
      addr.status = "Default";
    } else if (status) {
      addr.status = status;
    }

    addr.phoneNumber = phoneNumber ?? addr.phoneNumber;
    addr.receiverName = receiverName ?? addr.receiverName;
    addr.status = status ?? addr.status;
    addr.province = province ?? addr.province;
    addr.district = district ?? addr.district;
    addr.ward = ward ?? addr.ward;
    addr.detail = detail ?? addr.detail;

    await user.save();

    res.status(200).json({
      message: "Address added successfully",
      shippingAddresses: user.ShippingAddress,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update address", error });
  }
};
const getAddressById = async (req, res) => {
  const { userId, addressId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const address = user.ShippingAddress.id(addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    // Trả về object đầy đủ rõ ràng để tránh mất trường nào
    const result = {
      _id: address._id,
      receiverName: address.receiverName,
      phoneNumber: address.phoneNumber,
      
      status: address.status,
      province: address.province,
      district: address.district,
      ward: address.ward,
      detail: address.detail,
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to get address", error });
  }
};

const deleteAddress = async (req, res) => {
  const { userId, addressId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Kiểm tra xem địa chỉ có tồn tại không
    const addressExists = user.ShippingAddress.some(
      (addr) => addr._id.toString() === addressId
    );

    if (!addressExists) {
      return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
    }

    // Xoá địa chỉ bằng filter
    user.ShippingAddress = user.ShippingAddress.filter(
      (addr) => addr._id.toString() !== addressId
    );

    await user.save();

    res.status(200).json({ message: "Đã xoá địa chỉ thành công" });
  } catch (error) {
    console.error("❌ Lỗi server khi xoá địa chỉ:", error);
    res.status(500).json({ message: "Lỗi server khi xoá địa chỉ", error });
  }
};
// const getOrderByUserId = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     // Kiểm tra xem userId có hợp lệ không
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ message: "Invalid userId format" });
//     }

//     // Ép kiểu userId sang ObjectId
//     const orders = await Order.find({ UserId: mongoose.Types.ObjectId.createFromHexString(userId) });

//     res.status(200).json(orders);
//   }catch (error) {
//   console.error("Error when getting orders by user:", error);
//   res.status(500).json({ message: "Failed to get orders by user", error: error.message || error.toString() });
// }
const getOrderByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    const orders = await Order.find({ BuyerId: userId })
      .populate({
        path: "Items",
        select: "-__v -createdAt -updatedAt", // bỏ bớt trường phụ nếu cần
      })
      .populate({
        path: "ShopId",

      })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error when getting orders by user:", error);
    res
      .status(500)
      .json({ message: "Failed to get orders", error: error.message });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid orderId format" });
    }

    // Tìm đơn hàng và populate các OrderItem
    const order = await Order.findById(orderId)
      .populate({
        path: "Items", // ref trong Order schema
        select: "-__v -createdAt -updatedAt",
      })
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order details:", error);
    res
      .status(500)
      .json({ message: "Error fetching order details", error: error.message });
  }
};

const setDefaultAddress = async (req, res) => {
  const { userId, addressId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const addr = user.ShippingAddress.id(addressId);
    if (!addr) return res.status(404).json({ message: "Address not found" });

    // Set tất cả địa chỉ về Inactive
    user.ShippingAddress.forEach((a) => {
      a.status = "Inactive";
    });

    // Set địa chỉ này là Default
    addr.status = "Default";

    await user.save();
    res.status(200).json({ message: "Set default address successfully" });
  } catch (error) {
    console.error("❌ Error setting default address:", error);
    res.status(500).json({ message: "Failed to set default address", error });
  }
};

module.exports = {
  setDefaultAddress,
  getOrderDetails,
  getOrderByUserId,
  addAddress,
  updateAddress,
  getAddressById,
  deleteAddress,
  getUsers,
  login,
  register,
  googleLogin,
  changePassword,
  getUserById,
  updateUser,
  getPaymentForCheckout,
};
