const mongoose = require('mongoose');

const parkingSpaceSchema = new mongoose.Schema(
  {
    spaceNumber: {
      type: String,
      required: [true, 'Space number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Price per day is required'],
      min: [0, 'Price must be positive'],
    },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Maintenance'],
      default: 'Available',
    },
  },
  { timestamps: true }
);

parkingSpaceSchema.index({ status: 1 });

module.exports = mongoose.model('ParkingSpace', parkingSpaceSchema);
