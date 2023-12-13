const User = require("../models/UserModel");
const Profile = require("../models/ProfileModel");
const OTP = require("../models/OTPModel");
const validator = require("validator");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");

// Send OTP

exports.sendOTP = async (req, res) => {
  try {
    // fetch email from req.body
    const { email } = req.body;

    // Check if the email is not empty
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

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
    let plainOtp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP generated: ", plainOtp);

    // Hash the OTP entry in Database
    let hashedOTP = await bcrypt.hash(plainOtp, 10);

    //checking OTP exists or not
    const otpResult = await OTP.findOne({ otp: hashedOTP });

    while (otpResult) {
      hashedOTP = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      otpResult = await OTP.findOne({ otp: hashedOTP });
    }

    const otpPayload = { email, otp: hashedOTP };

    // create an OTP entry in DB
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    // return response
    return res.status(200).json({
      success: true,
      message: "OTP sent Successfully...",
      hashedOTP,
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
exports.signup = async (req, res) => {
  try {
    //  data fetch
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    // validate data
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    // compare passwords (password, confirm passwords)
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password & Confirm Password does not match, please try again",
      });
    }

    // check for existing users
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(401).json({
        success: false,
        message: "User exists!",
      });
    }

    // find most recent User OTP stored in Database
    const mostRecentOtp = await OTP.find({ email }) // finds all OTPs associated with the given email.
      .sort({ createdAt: -1 }) // sorts the results in descending order by the createdAt field, so the most recent OTP comes first.
      .limit(1); // limits the results to the first OTP

    console.log(mostRecentOtp);

    // validate OTP
    if (mostRecentOtp.length === 0) {
      // OTP not found
      return res.status(400).json({
        success: false,
        message: "OTP not found!",
      });
    } else if (otp !== mostRecentOtp.otp) {
      // invalid otp
      return res.status(400).json({
        success: false,
        message: "Invalid OTP!",
      });
    }

    // HASH Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user entry in DB

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contact: null,
    });
    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}${lastName}`,
    });

    // return response
    return res.status(200).json({
      success: true,
      message: "Registration Successful...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Registration Failed! Please try again...",
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    // get data from req.body
    const { email, password } = req.body;

    // data validation
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "Please enter valid email & password",
      });
    }
    // user check exist or not
    const user = await User.findOne({ email }).populate("additionalDetails");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User does not exists, please Sign Up first",
      });
    }
    // after matching the password, generate JWT
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        role: user.role,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      user.token = token;
      user.password = undefined; // removed password from user object for security

      // create cookie and send response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      // cookie create
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged in Successfully...",
      });

      //
    } else {
      // password do not match
      return res.status(403).json({
        success: false,
        message: "Incorrect Email & Password",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Login Failed! Please try again...",
    });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  // get data from req.body
  // get oldpass, newPass, confirmPass
  // validation
  // update Pass in DB
  // send mail - password Updated
  // return response
};
