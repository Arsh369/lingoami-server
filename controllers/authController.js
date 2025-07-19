const User = require('../models/userModel');
const { hashPassword } = require('../utils/hash');

// Step 1: Init Registration
const registerStep1 = async (req, res) => {
  const { firstName, lastName, email } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ message: 'Step 1 fields are required' });
  }

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email already exists' });

  const user = await User.create({ firstName, lastName, email, onboardingStep: 1 });
  res.status(201).json({ userId: user._id });
};

// Generic update handler
const updateStep = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const user = await User.findByIdAndUpdate(id, { ...data, onboardingStep: data.step }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: `Step ${data.step} completed`, userId: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Error updating user', error: err.message });
  }
};

// Step 4: Password (with hashing)
const registerStep4Password = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password) return res.status(400).json({ message: 'Password is required' });

  try {
    const hashedPassword = await hashPassword(password);
    const user = await User.findByIdAndUpdate(id, { password: hashedPassword, onboardingStep: 4 }, { new: true });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Password saved successfully', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Error saving password', error: err.message });
  }
};

module.exports = {
  registerStep1,
  updateStep,
  registerStep4Password
};
