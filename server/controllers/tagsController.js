const Tag = require("../models/TagsModel");

// Create Tag Handler

exports.createTag = async (req, res) => {
  try {
    // data fetching
    const { name, description } = req.body;
    // validation
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    // create entry in DB
    const tagDetails = await Tag.create({
      name: name,
      description: description,
    });

    console.log(tagDetails);
    return res.status(200).json({
      success: true,
      message: "Tag created Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.showAllTags = async (req, res) => {
  try {
    const allTags = await Tag.find({}, { name: true, description: true });

    return res.status(200).json({
      success: true,
      allTags,
      message: "All tags returned Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
