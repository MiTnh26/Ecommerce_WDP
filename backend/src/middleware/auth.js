const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.SECRET_KEY || "your_jwt_secret";

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user; // gán user từ token vào request
    next();
  });
};

module.exports = verifyToken;
