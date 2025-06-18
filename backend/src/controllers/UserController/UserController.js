const { User } = require("../../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.SECRET_KEY; // nên để trong .env
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.O2Auth_Key);

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

module.exports = { getUsers, login, register, googleLogin };
