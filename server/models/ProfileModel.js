const mongoose = require("mongoose");

const { Schema } = mongoose;

const profileSchema = new Schema({
  gender: {
    type: String,
  },
  dateOfBirth: {
    type: String,
  },
  about: {
    type: String,
    trim: true,
  },
  contact: {
    type: Number,
    trim: true,
  },
});

const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;
