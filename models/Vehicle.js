import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  make: {
    type: String,
    required: [true, 'Make is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price must be positive']
  },
  mileage: {
    type: Number,
    required: [true, 'Mileage is required'],
    min: [0, 'Mileage must be positive']
  },
  fuelType: {
    type: String,
    required: [true, 'Fuel type is required'],
    enum: ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'CNG', 'LPG']
  },
  transmission: {
    type: String,
    required: [true, 'Transmission is required'],
    enum: ['Manual', 'Automatic', 'CVT', 'Semi-Automatic']
  },
  bodyType: {
    type: String,
    required: [true, 'Body type is required'],
    enum: ['SUV', 'Sedan', 'Hatchback', 'Coupe', 'Convertible', 'Truck', 'Van', 'Wagon']
  },
  engine: {
    type: String,
    required: [true, 'Engine details are required'],
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: [true, 'image is required'],
    trim: true
  },
  features: [{
    type: String,
    trim: true
  }],
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: ['New', 'Used', 'Certified Pre-Owned']
  },
  badge: {
    type: String,
    enum: ['Great Price', 'Low Mileage', 'Sale', 'Featured', 'Hot Deal']
  },
  location: {
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  dealer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved', 'pending'],
    default: 'available'
  },
  views: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
vehicleSchema.index({ make: 1, model: 1 });
vehicleSchema.index({ price: 1 });
vehicleSchema.index({ year: -1 });
vehicleSchema.index({ condition: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ createdAt: -1 });


// Ensuring virtual fields are serialized
vehicleSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Vehicle', vehicleSchema);