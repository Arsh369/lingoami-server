const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const { hashPassword } = require('../utils/hash')
const step1 = async (req, res) => {
  const { email, firstName, lastName } = req.body;

  let user = await User.findOne({ email });
  if (user && user.status === 'complete') {
    return res.status(400).json({ error: 'User already registered' });
  }

  if (!user) {
    user = await User.create({ email, firstName, lastName });
  } else {
    user.firstName = firstName;
    user.lastName = lastName;
    await user.save();
  }

  res.json({ userId: user._id });
}

const step2 = async (req, res) => {
  const { gender } = req.body;
  await User.findByIdAndUpdate(req.params.userId, { gender });
  res.json({ success: true });
}

const step3 = async (req, res) => {
  const { dateOfBirth } = req.body;
  await User.findByIdAndUpdate(req.params.userId, { dateOfBirth });
  res.json({ success: true });
}

const step4 = async (req, res) => {
  try {
    const { password } = req.body;
    const { userId } = req.params;

    // Validate password
    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password is required' 
      });
    }

    // Optional: Add password strength validation
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Update user with hashed password
    await User.findByIdAndUpdate(userId, { 
      password: hashedPassword,
      step: 4 // Track completion of step 4
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error in step4:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

const step5 = async (req, res) => {
  const { country } = req.body;
  await User.findByIdAndUpdate(req.params.userId, { country });
  res.json({ success: true });
}

const step6 = async (req, res) => {
  const { language } = req.body;
  await User.findByIdAndUpdate(req.params.userId, { language });
  res.json({ success: true });
}

const step7 = async (req, res) => {
  const { proficiency } = req.body;
  await User.findByIdAndUpdate(req.params.userId, {
    proficiency,
    status: 'complete'
  });
  res.json({ success: true });
}

module.exports = {
  step1,
  step2,
  step3,
  step4,
  step5,
  step6,
  step7
}