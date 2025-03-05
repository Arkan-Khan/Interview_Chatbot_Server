import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]; // Extract token from "Bearer <TOKEN>"
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user object to request, removing password field
    req.user = await User.findOne({ email: decoded.email }).select("-password");

    next(); // Move to the next middleware
  } catch (error) {
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};
