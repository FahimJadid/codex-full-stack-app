const mongoose = require("mongoose");

const { Schema } = mongoose;

const sectionSchema = new Schema({
  sectionName: {
    type: String,
  },
  subSection: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSection",
      required: true,
    },
  ],
});

const Section = mongoose.model("Section", sectionSchema);

module.exports = Section;
