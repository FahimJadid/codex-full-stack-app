const User = require("../models/UserModel");
const OTP = require("../models/OTPModel");
const validator = require("validator");
const otpGenerator = require("otp-generator");
// Send OTP

exports.sendOTP = async (req, res) => {
  try {
    // fetch email from req.body
    const { email } = req.body;

    // check if the email is valid
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    //   check for existing user
    const checkExistingUser = await User.findOne({ email });

    //   if exists
    if (checkExistingUser) {
      return res.status(401).json({
        success: false,
        message: "User already registered with this email!",
      });
    }

    // generate OTP using otp-generator
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP generated: ", otp);

    //checking OTP exists or not
    const otpResult = await OTP.findOne({ otp: otp });

    while (otpResult) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      otpResult = await OTP.findOne({ otp: otp });
    }

    const otpPayload = { email, otp };

    // create an OTP entry in DB
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    // return response
    return res.status(200).json({
      success: true,
      message: "OTP sent Successfully...",
      otp,
    });

    //
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Sign Up

// Login

// Change Password
