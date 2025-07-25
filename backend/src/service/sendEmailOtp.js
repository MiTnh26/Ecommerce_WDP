const nodemailer = require('nodemailer');
const User = require('../models/Users');
const session = require('express-session');


//Cấu hình transporter cho nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
});


// Send Email otp
const sendEmailOtp = async (req, res) =>{
  const {email} = req.body;
   //console.log("SEN", email)
  try {
    const user = await User.findOne({Email: email});
    if(!user) return res.status(404).json({message: "User not found"});
    
    //tao ma otp 6 so
    const otp = Math.floor(100000+ Math.random() * 900000);
    
    // luu otp vao session
    req.session.otp = {
      code: otp,
      email: email,
      expireAt: Date.now() + 3 * 60 * 1000 // 3p 
    }
    //console.log("data session1", req.session.otp)
    // Cấu hình email
    const mailOptions = {
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Password Reset OTP',
      html: `
        <h2>Password Reset Request</h2>
        <p>Your OTP code is: <strong>${otp}</strong></p>
        <p>This code will expire in 3 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    // Gui email bang nodemailer 
    await transporter.sendMail(mailOptions);
    res.status(200).json({message: "Email sent successfully"});
  }catch(e){
    console.error("Error sending OTP:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to send OTP" 
    });
  }
}

//verify otp
const verifyOtp = async (req, res) => {
    const {otp} = req.body;
    //console.log("otp req", otp);
    //console.log("data session2", req.session.otp);
    try{
        //Kiem tra session OTP co ton tai khong sessionId đa duoc ma hoa
        if(!req.session.otp) {
            return res.status(400).json({message: "OTP not found"});
        }
        //Kiem tra otp da het han chua
        if(Date.now() > req.session.otp.expireAt){
            return res.status(400).json({message: "OTP has expired"});
        }
        // Kiem tra otp co khop khong
        if(req.session.otp.code != otp){
            return res.status(400).json({message: "Invalid OTP"});
        }
        //Danh dau  otp khi thuc hien thanh cong
        req.session.otpVerified = true;

        res.status(200).json({message: "OTP verified successfully"});
    }catch(error){
        console.error("Error verifying OTP:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to verify OTP" 
        });
    }
}
module.exports = {sendEmailOtp, verifyOtp};
