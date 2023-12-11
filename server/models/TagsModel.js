const mongoose = require("mongoose");

const { Schema } = mongoose;

const tagsSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
});

const Tag = mongoose.model("Tag", tagsSchema);

module.exports = Tag;
