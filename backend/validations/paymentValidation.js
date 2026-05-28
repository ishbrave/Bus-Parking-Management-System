const { body } = require('express-validator');

const paymentValidation = [
  body('parkingRecord').isMongoId().withMessage('Valid parking record ID is required'),
  body('paymentDate').isISO8601().withMessage('Valid payment date is required'),
  body('receivedBy').trim().notEmpty().withMessage('Receiver name is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('paymentType')
    .optional()
    .isIn(['partial', 'final'])
    .withMessage('Payment type must be partial or final'),
];

module.exports = { paymentValidation };
