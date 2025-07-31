const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const { hashPassword, comparePassword } = require("../utils/hash");
const { generateToken } = require("../utils/token");
const countries = require('../utils/countries.json');
const step1 = async (req, res) => {
  const { email, firstName, lastName } = req.body;

  let user = await User.findOne({ email });
  if (user && user.status === "complete") {
    return res.status(400).json({ error: "User already registered" });
  }

  if (!user) {
    user = await User.create({ email, firstName, lastName });
  } else {
    user.firstName = firstName;
    user.lastName = lastName;
    await user.save();
  }

  res.json({ userId: user._id });
};

const step2 = async (req, res) => {
  const { gender } = req.body;
  await User.findByIdAndUpdate(req.params.userId, { gender });
  res.json({ success: true });
};

const step3 = async (req, res) => {
  const { dateOfBirth } = req.body;
  await User.findByIdAndUpdate(req.params.userId, { dateOfBirth });
  res.json({ success: true });
};

const step4 = async (req, res) => {
  try {
    const { password } = req.body;
    const { userId } = req.params;

    // Validate password
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // Optional: Add password strength validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Update user with hashed password
    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      step: 4, // Track completion of step 4
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error in step4:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const step5 = async (req, res) => {
  const { country } = req.body;
  await User.findByIdAndUpdate(req.params.userId, { country });
  res.json({ success: true });
};

const step6 = async (req, res) => {
  const { language } = req.body;
  await User.findByIdAndUpdate(req.params.userId, { language });
  res.json({ success: true });
};

const step7 = async (req, res) => {
  const { proficiency } = req.body;
  await User.findByIdAndUpdate(req.params.userId, {
    proficiency,
    status: "complete",
  });
  const token = generateToken(req.params.userId);
  res.json({ success: true, token });
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input: Ensure email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2. Find the user by email in the database
    const user = await User.findOne({ email });

    // 3. Check if user exists and their registration status is 'complete'
    if (!user || user.status !== "complete") {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials or user not fully registered",
      });
    }

    // 4. Compare the provided plain-text password with the hashed password
    // using the comparePassword utility function.
    const isMatch = await comparePassword(password, user.password);

    // If passwords do not match, return an error
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 5. Generate a JWT upon successful login
    const token = generateToken(user._id);

const userCountry = user.country;
console.log("userCountry:", userCountry);
const matchedCountry = countries.find(c => c.name === userCountry);
const countryCode = matchedCountry ? matchedCountry.code : null;

    // 6. Successful login: Send the token back to the client
    res.json({
      success: true,
      message: "Login successful",
      token: token, // Send the generated JWT
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      country: user.country,
      countryCode: countryCode,
      language: user.language,
      proficiency: user.proficiency,
    });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    console.log("Decoded user:", req.user); // 🔍

    const currentUserId = req.user._id;

    const users = await User.find({ _id: { $ne: currentUserId } }).select(
      "-password"
    );
    res.status(200).json(users);
  } catch (err) {
    console.error("Error in getAllUsers:", err); // 🔍
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

module.exports = {
  step1,
  step2,
  step3,
  step4,
  step5,
  step6,
  step7,
  loginUser,
  getAllUsers,
};
