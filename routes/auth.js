const express = require('express');
const router = express.Router();

const { register, logout, login, getMe, updateProfile, getAllUser } = require('../controllers/auth');

const { protect } = require('../middlewares/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/me', protect, getMe);
router.get('/users', protect, getAllUser)
router.put('/updatedetails', protect, updateProfile)


module.exports = router;