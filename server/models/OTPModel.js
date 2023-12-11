const mongoose = require("mongoose");

const { Schema } = mongoose;

const OTPSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60,
  },
});

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;
