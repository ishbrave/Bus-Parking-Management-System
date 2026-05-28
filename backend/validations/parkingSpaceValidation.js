const { body } = require('express-validator');

const parkingSpaceValidation = [
  body('spaceNumber').trim().notEmpty().withMessage('Space number is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('pricePerDay')
    .isFloat({ min: 0 })
    .withMessage('Price per day must be a positive number'),
  body('status')
    .isIn(['Available', 'Occupied', 'Maintenance'])
    .withMessage('Status must be Available, Occupied, or Maintenance'),
];

module.exports = { parkingSpaceValidation };
