const mongoose = require("mongoose");
const mailService = require("../utils/mailService");

const { Schema } = mongoose;

const OTPSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 3 * 60,
  },
});

// send emails =>

const sendEmailVerification = async (email, otp) => {
  try {
    const mailResponse = await mailService(
      email,
      "Verification Email from CodeX",
      otp
    );
    console.error("Email sent Successfully...", mailResponse);
  } catch (error) {
    console.error("Error while sending verification email: ", error);
    throw error;
  }
};

//
OTPSchema.pre("save", async function (next) {
  await sendEmailVerification(this.email, this.otp);
  next();
});

//
const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;
