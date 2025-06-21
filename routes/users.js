import express from 'express';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users/favorites
// @desc    Get user's favorite vehicles
// @access  Private
router.get('/favorites', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'favorites',
      populate: {
        path: 'dealer',
        select: 'name email phone'
      }
    });

    res.json({
      success: true,
      data: { favorites: user.favorites }
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;