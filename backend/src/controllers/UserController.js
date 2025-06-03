const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.SECRET_KEY; // nên để trong .env
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(
  "452044254054-auvkf89chh5uahvttnmqegnrf9uj9l98.apps.googleusercontent.com"
);

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error });
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
  const {
    Username,
    Address,
    DateOfBirth,
    Email,
    FirstName,
    LastName,
    Gender,
    Image,
    Password,
    PhoneNumber,
  } = req.body;
  try {
    const existing = await User.findOne({ Email });
    if (existing) {
      return res.status(400).json({ message: "Email already exixsts" });
    }
    const hashed = await bcrypt.hash(Password, 10);
    const user = new User({
      Username,
      Address,
      DateOfBirth,
      Email,
      FirstName,
      LastName,
      Gender,
      Image,
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
      audience:
        "452044254054-auvkf89chh5uahvttnmqegnrf9uj9l98.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture } = payload;

    // Kiểm tra người dùng đã tồn tại
    let user = await User.findOne({ Email: email });

    if (!user) {
      user = new User({
        Email: email,
        FirstName: given_name || "",
        LastName: family_name || "",
        Image: picture || "",
        Password: "", // để trống vì không đăng ký bằng mật khẩu
        UserRole: "Customer",
        Status: "Active",
      });

      await user.save(); // 💥 Nếu thiếu trường bắt buộc thì dòng này sẽ gây lỗi
    }

    res.status(200).json({ message: "Đăng nhập Google thành công", user });
  } catch (error) {
    console.error("Lỗi khi đăng nhập Google:", error);
    res.status(401).json({ message: "Token không hợp lệ hoặc lỗi server" });
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
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getUsers, login, register, googleLogin,updateUser,getUserById };
