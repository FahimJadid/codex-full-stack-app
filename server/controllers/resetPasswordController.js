const User = require("../models/UserModel");
const mailService = require("../utils/mailService");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

// reset password Token
exports.resetPasswordToken = async (req, res) => {
  try {
    // fetch email from req.body
    const { email } = req.body;

    // check user for this email and email validation (user exists & verified email)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User does not exists.",
      });
    }

    //generate the token
    const resetPassToken = crypto.randomBytes(20).toString("hex");

    // update user by storing the token and its expiry time in the user document

    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: resetPassToken,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true } //returns updated document in response
    );

    // create URL
    let resetURL = `http://localhost:3000>/reset-password/${resetPassToken}`;

    // send mail containing the URL
    await mailService(
      email,
      "Password Reset Link",
      `You are receiving this because 
      you (or someone else) have requested the 
      reset of the password for your account.\n\nPlease 
      click on the following link, or paste this into your browser 
      to complete the process within 5 minutes of receiving it:\n\n${resetURL}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`
    );
    // return response
    return res.status(200).json({
      success: true,
      message: "Reset password token generated and sent to email",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Error sending email" });
  }
};

// reset password

exports.resetPassword = async (req, res) => {
  try {
    //   fetch token and new password from req.body
    const { password, confirmPassword, token } = req.body;

    //   validation
    if (!token || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password does not match.",
      });
    }
    //   get user details from DB using token
    const userDetails = await User.findOne({ token: token });
    //   if entry not found - invalid token
    if (!userDetails) {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    // also check token expiration
    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.status(401).json({
        success: false,
        message: "Token has expired.",
      });
    }

    //   hash the new password
    const hashedPassword = await bcrypt.hash(confirmPassword, 10);

    //   update the password and clear token and expiry time
    await User.findOneAndUpdate(
      { token: token },
      {
        password: hashedPassword,
        token: undefined,
        resetPasswordExpires: undefined,
      },
      { new: true } //returns updated document in response
    );

    //   return response
    return res.status(200).json({
      success: true,
      message: "Password has been updated.",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Error updating password" });
  }
};
