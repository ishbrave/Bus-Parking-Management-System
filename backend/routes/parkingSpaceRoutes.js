const express = require('express');
const router = express.Router();
const {
  getParkingSpaces,
  getParkingSpace,
  createParkingSpace,
  updateParkingSpace,
  deleteParkingSpace,
} = require('../controllers/parkingSpaceController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { parkingSpaceValidation } = require('../validations/parkingSpaceValidation');

router.use(protect);

router.route('/').get(getParkingSpaces).post(parkingSpaceValidation, validate, createParkingSpace);

router
  .route('/:id')
  .get(getParkingSpace)
  .put(parkingSpaceValidation, validate, updateParkingSpace)
  .delete(deleteParkingSpace);

module.exports = router;
