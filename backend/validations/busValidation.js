const { body } = require('express-validator');

const busValidation = [
  body('plateNumber')
    .trim()
    .notEmpty().withMessage('Plate number is required')
    .matches(/^[A-Za-z]{3}\d{3}[A-Za-z]$/).withMessage('Plate must be Rwandan format (e.g. RAB123A)'),
  body('busType').trim().notEmpty().withMessage('Bus type is required'),
  body('owner').isMongoId().withMessage('Valid owner ID is required'),
];

module.exports = { busValidation };
