const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

// auth
exports.auth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorization").replace("Bearer ", "");

    // if token missing or unavailable
    if (!token || token === undefined) {
      return res.status(401).json({
        success: false,
        message: "Token not found...",
      });
    }

    // verify the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded);
      req.user = decoded; // storing token in req decoded to access roles in the next middlewares
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid",
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Something went wrong while verifying the token...",
    });
  }
};
// isStudent
exports.isStudent = async (req, res) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message:
          "You don't have access to this route, protected route for Students...",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unauthorized...",
    });
  }
};
// isInstructor
exports.isInstructor = async (req, res) => {
  try {
    if (req.user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message:
          "You don't have access to this route, protected route for Instructors...",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unauthorized...",
    });
  }
};
// isAdmin
exports.isAdmin = async (req, res) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message:
          "You don't have access to this route, protected route for Admin...",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unauthorized...",
    });
  }
};
