const mongoose = require("mongoose");

const { Schema } = mongoose;

const courseProgressSchema = new Schema({
  courseID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
  completedVideos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSection",
    },
  ],
});

const CourseProgress = mongoose.model("CourseProgress", courseProgressSchema);

module.exports = CourseProgress;
