const { body } = require('express-validator');
const User = require('../models/User');

const SECURITY_QUESTIONS = User.getSecurityQuestions();

const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be 3-50 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters')
    .matches(/^[A-Za-z\s]+$/)
    .withMessage('Name must contain only alphabetic characters'),
  body('phone')
    .matches(/^(079|078|072|073)\d{7}$/)
    .withMessage('Phone must be a valid Rwandan number (079/078/072/073 + 7 digits)'),
  body('securityQuestion')
    .trim()
    .notEmpty()
    .withMessage('Security question is required')
    .isIn(SECURITY_QUESTIONS)
    .withMessage('Invalid security question'),
  body('securityAnswer')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Security answer must be at least 3 characters'),
];

const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
];

const resetPasswordValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('securityAnswer').trim().notEmpty().withMessage('Security answer is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

module.exports = { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation };