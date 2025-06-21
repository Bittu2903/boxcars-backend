import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Vehicle from '../models/Vehicle.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/vehicles
// @desc    Get all vehicles with filtering and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be positive'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be positive')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true, status: 'available' };

    if (req.query.make) filter.make = new RegExp(req.query.make, 'i');
    if (req.query.model) filter.model = new RegExp(req.query.model, 'i');
    if (req.query.year) filter.year = parseInt(req.query.year);
    if (req.query.condition) filter.condition = req.query.condition;
    if (req.query.fuelType) filter.fuelType = req.query.fuelType;
    if (req.query.transmission) filter.transmission = req.query.transmission;
    if (req.query.bodyType) filter.bodyType = req.query.bodyType;
    
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Build sort object
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort = { [sortField]: sortOrder };
    }

    // Execute query
    const vehicles = await Vehicle.find(filter)
      .populate('dealer', 'name email phone')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Vehicle.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
        vehicles,
        pagination: {
          currentPage: page,
          totalPages,
          totalVehicles: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/vehicles/:id
// @desc    Get single vehicle
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('dealer', 'name email phone');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Increment views
    vehicle.views += 1;
    await vehicle.save();

    res.json({vehicle });
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/vehicles
// @desc    Create new vehicle
// @access  Private (Dealer/Admin)
router.post('/', protect, authorize('dealer', 'admin'), [
  body('make').trim().notEmpty().withMessage('Make is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Invalid year'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('mileage').isFloat({ min: 0 }).withMessage('Mileage must be positive'),
  body('image').trim().notEmpty().withMessage('Image is required'),
  body('fuelType').isIn(['Petrol', 'Diesel', 'Hybrid', 'Electric', 'CNG', 'LPG']).withMessage('Invalid fuel type'),
  body('transmission').isIn(['Manual', 'Automatic', 'CVT', 'Semi-Automatic']).withMessage('Invalid transmission'),
  body('bodyType').isIn(['SUV', 'Sedan', 'Hatchback', 'Coupe', 'Convertible', 'Truck', 'Van', 'Wagon']).withMessage('Invalid body type'),
  body('condition').isIn(['New', 'Used', 'Certified Pre-Owned']).withMessage('Invalid condition')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const vehicleData = {
      ...req.body,
      dealer: req.user.id
    };

    const vehicle = await Vehicle.create(vehicleData);
    await vehicle.populate('dealer', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: { vehicle }
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/vehicles/:id
// @desc    Update vehicle
// @access  Private (Owner/Admin)
router.put('/:id', protect, async (req, res) => {
  try {
    let vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check ownership or admin role
    if (vehicle.dealer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this vehicle'
      });
    }

    vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('dealer', 'name email phone');

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: { vehicle }
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/vehicles/:id
// @desc    Delete vehicle
// @access  Private (Owner/Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check ownership or admin role
    if (vehicle.dealer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this vehicle'
      });
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;