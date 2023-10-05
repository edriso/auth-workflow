const express = require('express');
const {
  register,
  verifyEmail,
  login,
  logout,
} = require('../controllers/authController');
const { authenticateUser } = require('../middleware/authentication');
const router = express.Router();

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.delete('/logout', authenticateUser, logout);

module.exports = router;
