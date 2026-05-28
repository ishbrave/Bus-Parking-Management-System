const express = require('express');
const router = express.Router();
const {
  getOwners,
  getOwner,
  createOwner,
  updateOwner,
  deleteOwner,
} = require('../controllers/ownerController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { ownerValidation } = require('../validations/ownerValidation');

router.use(protect);

router.route('/').get(getOwners).post(ownerValidation, validate, createOwner);

router.route('/:id').get(getOwner).put(ownerValidation, validate, updateOwner).delete(deleteOwner);

module.exports = router;
