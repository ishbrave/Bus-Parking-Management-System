const mongoose = require('mongoose');

const parkingRecordSchema = new mongoose.Schema(
  {
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: [true, 'Bus is required'],
    },
    parkingSpace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingSpace',
      required: [true, 'Parking space is required'],
    },
    entryTime: {
      type: Date,
      default: Date.now,
    },
    exitTime: {
      type: Date,
      default: null,
    },
    hourlyRate: {
      type: Number,
      default: 500,
      min: [0, 'Rate must be positive'],
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: [0, 'Amount must be positive'],
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: [0, 'Amount paid must be positive'],
    },
    balanceDue: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Partially Paid', 'Paid', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

parkingRecordSchema.index({ bus: 1 });
parkingRecordSchema.index({ parkingSpace: 1 });
parkingRecordSchema.index({ paymentStatus: 1 });
parkingRecordSchema.index({ entryTime: -1 });

module.exports = mongoose.model('ParkingRecord', parkingRecordSchema);
