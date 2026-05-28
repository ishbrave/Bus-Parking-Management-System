const express = require('express');
const router = express.Router();
const {
  getBuses,
  getBus,
  createBus,
  updateBus,
  deleteBus,
} = require('../controllers/busController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { busValidation } = require('../validations/busValidation');

router.use(protect);

router.route('/').get(getBuses).post(busValidation, validate, createBus);

router.route('/:id').get(getBus).put(busValidation, validate, updateBus).delete(deleteBus);

module.exports = router;
