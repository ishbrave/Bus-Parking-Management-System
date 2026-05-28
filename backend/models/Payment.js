const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    parkingRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingRecord',
      required: [true, 'Parking record is required'],
    },
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required'],
      default: Date.now,
    },
    receivedBy: {
      type: String,
      required: [true, 'Receiver name is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive'],
    },
    paymentType: {
      type: String,
      enum: ['partial', 'final'],
      default: 'partial',
    },
  },
  { timestamps: true }
);

paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ parkingRecord: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
