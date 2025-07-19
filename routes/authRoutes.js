// routes/register.js
const express = require('express');
const router = express.Router();

const { step1, step2, step3, step4, step5, step6, step7} = require('../controllers/authController')
// Step 1: Create or retrieve user by email
router.post('/step1', step1);

// Step 2 to 7: Update fields progressively
router.put('/step2/:userId', step2);

router.put('/step3/:userId', step3);

router.put('/step4/:userId', step4);

router.put('/step5/:userId', step5);

router.put('/step6/:userId', step6);

router.put('/step7/:userId', step7);

module.exports = router;
