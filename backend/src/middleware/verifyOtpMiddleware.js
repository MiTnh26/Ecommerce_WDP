// middlewares/verifyOtpMiddleware.js
const verifyOtpMiddleware = (req, res, next) => {
  if (!req.session.otpVerified) {
    return res.status(403).json({ message: "OTP verification required" });
  }
  next();
};
module.exports = verifyOtpMiddleware;
