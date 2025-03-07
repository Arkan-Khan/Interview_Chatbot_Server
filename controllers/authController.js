import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: "User registered successfully", userId: user._id, name: user.name });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    // Generate token
    const token = generateToken(user.email);

    // Send token in response body
    res.json({ message: "Login successful", userId: user._id, name: user.name, token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};