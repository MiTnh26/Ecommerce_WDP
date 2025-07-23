const { User, Payment, Products } = require("../../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const JWT_SECRET = process.env.SECRET_KEY; // nên để trong .env
const { OAuth2Client } = require("google-auth-library");

const nodemailer = require("nodemailer");
// const  {Order,OrderItem}  = require("../../models/index");
const Order = require("../../models/Orders");
const OrderItem = require("../../models/OrderItems");
const Shops = require("../../models/Shops");

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

// const updateUser = async (req, res) => {
//   try {
//     const updateData = req.body;
//     const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
//     res.json(updatedUser);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
const updateUser = async (req, res) => {
  try {
    const updateData = req.body;

    // Nếu có file được upload (ảnh đại diện)
    if (req.file && req.file.path) {
      updateData.Image = req.file.path; // Gán link Cloudinary vào trường Image
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.json(updatedUser);
  } catch (err) {
    console.error("Lỗi khi cập nhật người dùng:", err);
    res.status(500).json({ message: err.message });
  }
};

const addAddress = async (req, res) => {
  const { id } = req.params; // user id
  const {
    phoneNumber,
    receiverName,
    status,
    province,
    district,
    ward,
    detail,
  } = req.body;

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
  const {
    phoneNumber,
    receiverName,
    status,
    province,
    district,
    ward,
    detail,
  } = req.body;

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
        select: "-__v -createdAt -updatedAt"
      })
      .populate({
        path: "ShopId"
      })
      .populate({
        path: "PaymentId",
        select: "PaymentMethod" 
      })
      .sort({ createdAt: -1 })
      .lean();

    const fixedOrders = orders.map(order => ({
      ...order,
      Items: order.Items ? [order.Items] : [],
    }));

    res.status(200).json(fixedOrders);
  } catch (error) {
    console.error("Error when getting orders by user:", error);
    res
      .status(500)
      .json({ message: "Failed to get orders", error: error.message });
  }
};


const getOrderDetails = async (req, res) => {
 const rawOrderId = req.params.orderId;
const orderId = rawOrderId?.trim();
 console.log("Raw orderId param:", orderId);
  try {
    // const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid orderId format" });
    }
   
    const order = await Order.findById(orderId)
      .populate({
        path: "Items",
        select: "-__v -createdAt -updatedAt"
      })
      .populate({
        path: "PaymentId",
        select: "PaymentMethod" 
      })
      .populate({
        path: "BuyerId",
        select: "-__v -createdAt -updatedAt" 
      })
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Wrap Items thành mảng nếu cần
    const fixedOrder = {
      ...order,
      Items: order.Items ? [order.Items] : [],
    };

    res.status(200).json(fixedOrder);
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
const changePasswordInUser = async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;
  console.log('id', id);
  console.log('currentPassword', currentPassword);

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });
    console.log('user.Password', user.Password);
    const isMatch = await bcrypt.compare(currentPassword, user.Password);

    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    user.Password = hashedNewPassword;
    await user.save();


    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ message: "Server error" });
  }
};
const cancelOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid orderId" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.Status === "Cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    order.Status = "Cancelled";
    await order.save();

    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (error) {
    console.error("❌ Error cancelling order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




const getAddressByUserId = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select("ShippingAddress");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      addresses: user.ShippingAddress || [],
    });
  } catch (error) {
    console.error("❌ Error get address by userId:", error);
    res.status(500).json({ message: "Failed get address by userId", error });
  }
};
const getShopById = async (req, res) => {
  const { id } = req.params;
  try {
    const shop = await Shops.findById(id);
    if (!shop) {
      return res.status(404).json({ message: "Shop not fount" });
    }
    res.status(200).json(shop);
  } catch (error) {
    res.status(500).json({ message: "Fail get shop by Id", error });
  }
};
const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Products.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not fount" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Fail get product by Id", error });
  }
};
const getProductVariantById = async (req, res) => {
  const { productId, productVariantId } = req.params;

  try {
    const product = await Products.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const productVariant = product.ProductVariant.id(productVariantId);
    if (!productVariant)
      return res.status(404).json({ message: "ProductVariant not found" });

    // Trả về object đầy đủ rõ ràng để tránh mất trường nào
    const result = {
      _id: productVariant._id,
      Image: productVariant.Image,
      Price: productVariant.Price,

      ProductVariantName: productVariant.ProductVariantName,
      StockQuantity: productVariant.StockQuantity,
      Status: productVariant.Status,
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to get address", error });
  }
};
const getPaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await Payment.find();

    if (!paymentMethod || paymentMethod.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy phương thức thanh toán nào." });
    }

    res.status(200).json(paymentMethod);
  } catch (error) {
    console.error("❌ Lỗi khi lấy phương thức thanh toán:", error);
    res
      .status(500)
      .json({ message: "Lấy phương thức thanh toán thất bại", error });
  }
};
const createOrderItems = async (req, res) => {
  try {
    // Lấy dữ liệu từ body
    const { Product, Total, Status } = req.body;
    if (!Product || !Array.isArray(Product) || Product.length === 0) {
      return res.status(400).json({ message: "Product array is required" });
    }
    // Tạo order item mới
    const newOrderItem = new OrderItem({
      Product,
      Total,
      Status: Status || "Pending",
    });
    await newOrderItem.save();
    res.status(201).json({
      message: "Order item created successfully",
      orderItem: newOrderItem,
    });
  } catch (error) {
    console.error("Error creating order item:", error);
    res.status(500).json({ message: "Failed to create order item", error });
  }
};
const checkout = async (req, res) => {
  try {
    const {
      OrderDate,
      PaymentId,
      ShippingAddress,
      Status,
      TotalAmount,
      BuyerId,
      ShopId,
      Items,
    } = req.body;

    if (
      !PaymentId ||
      !ShippingAddress ||
      !TotalAmount ||
      !BuyerId ||
      !ShopId ||
      !Items
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newOrder = new Order({
      OrderDate: OrderDate || Date.now(),
      PaymentId,
      ShippingAddress,
      Status: Status || "Pending",
      TotalAmount,
      BuyerId,
      ShopId,
      Items,
    });
    await newOrder.save();
    res
      .status(201)
      .json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Failed to create order", error });
  }
};
module.exports = {
  setDefaultAddress, changePasswordInUser,
  getOrderDetails, getOrderByUserId,
  addAddress, updateAddress,
  getAddressById, deleteAddress,
  getUsers, login, register,
  googleLogin, changePassword,
  getUserById, updateUser,getPaymentForCheckout,cancelOrder

 




,
  getAddressByUserId,
  getShopById,
  getProductById,
  getProductVariantById,
  getPaymentMethod,
  createOrderItems,
  checkout,
};
