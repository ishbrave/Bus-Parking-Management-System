const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
      minlength: 3,
      match: [/^[A-Za-z\s]+$/, 'Name must contain only alphabetic characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      unique: true,
      match: [/^(079|078|072|073)\d{7}$/, 'Phone must be a valid Rwandan number'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Owner', ownerSchema);
