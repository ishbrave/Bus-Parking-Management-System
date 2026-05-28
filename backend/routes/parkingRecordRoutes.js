const express = require('express');
const router = express.Router();
const {
  getParkingRecords,
  getParkingRecord,
  createParkingRecord,
  updateParkingRecord,
  deleteParkingRecord,
  checkoutParkingRecord,
} = require('../controllers/parkingRecordController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { parkingRecordValidation } = require('../validations/parkingRecordValidation');

router.use(protect);

router.route('/').get(getParkingRecords).post(parkingRecordValidation, validate, createParkingRecord);

router.get('/checkout/:id', checkoutParkingRecord);

router
  .route('/:id')
  .get(getParkingRecord)
  .put(parkingRecordValidation, validate, updateParkingRecord)
  .delete(deleteParkingRecord);

module.exports = router;
