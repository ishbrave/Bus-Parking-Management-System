const mongoose = require('mongoose');

const busSchema = new mongoose.Schema(
  {
    plateNumber: {
      type: String,
      required: [true, 'Plate number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{3}\d{3}[A-Z]$/, 'Plate must be Rwandan format (e.g. RAB123A)'],
    },
    busType: {
      type: String,
      required: [true, 'Bus type is required'],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Owner',
      required: [true, 'Owner is required'],
    },
  },
  { timestamps: true }
);

busSchema.index({ owner: 1 });

module.exports = mongoose.model('Bus', busSchema);
