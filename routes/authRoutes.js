const express = require('express');
const router = express.Router();
const {
  registerStep1,
  updateStep,
  registerStep4Password
} = require('../controllers/authController');

// Step 1: Create user
router.post('/register/step1', registerStep1);

// Step 2, 3, 5, 6, 7: Update user field
router.patch('/register/step/:id', updateStep);

// Step 4: Password (hashed)
router.patch('/register/step4/:id', registerStep4Password);

module.exports = router;
