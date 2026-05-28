const express = require('express');
const router = express.Router();
const { getPayments, createPayment, deletePayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { paymentValidation } = require('../validations/paymentValidation');

router.use(protect);

router.route('/').get(getPayments).post(paymentValidation, validate, createPayment);

router.route('/:id').delete(deletePayment);

module.exports = router;
