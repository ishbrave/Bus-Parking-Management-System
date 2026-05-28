const { body } = require('express-validator');

const parkingRecordValidation = [
  body('bus').isMongoId().withMessage('Valid bus ID is required'),
  body('parkingSpace').isMongoId().withMessage('Valid parking space ID is required'),
  body('entryTime').optional().isISO8601().withMessage('Valid entry time is required'),
  body('hourlyRate').optional().isFloat({ min: 0 }).withMessage('Hourly rate must be positive'),
  body('paymentStatus')
    .optional()
    .isIn(['Pending', 'Partially Paid', 'Paid', 'Cancelled'])
    .withMessage('Invalid payment status'),
];

module.exports = { parkingRecordValidation };
