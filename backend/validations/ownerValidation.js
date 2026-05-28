const { body } = require('express-validator');

const ownerValidation = [
  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters')
    .matches(/^[A-Za-z\s]+$/)
    .withMessage('Name must contain only alphabetic characters'),
  body('phone')
    .matches(/^(079|078|072|073)\d{7}$/)
    .withMessage('Phone must be a valid Rwandan number (079/078/072/073 + 7 digits)'),
];

module.exports = { ownerValidation };
