const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  dateOfBirth: { type: Date },
  password: { type: String },
  country: { type: String },
  language: { type: String },
  proficiency: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  onboardingStep: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
