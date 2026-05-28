const ParkingSpace = require('../models/ParkingSpace');

const getParkingSpaces = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await ParkingSpace.countDocuments();
    const parkingSpaces = await ParkingSpace.find().skip(skip).limit(limit).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: parkingSpaces,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getParkingSpace = async (req, res, next) => {
  try {
    const parkingSpace = await ParkingSpace.findById(req.params.id);
    if (!parkingSpace) {
      return res.status(404).json({ success: false, message: 'Parking space not found' });
    }
    res.status(200).json({ success: true, data: parkingSpace });
  } catch (error) {
    next(error);
  }
};

const createParkingSpace = async (req, res, next) => {
  try {
    const parkingSpace = await ParkingSpace.create(req.body);
    res.status(201).json({ success: true, message: 'Parking space created', data: parkingSpace });
  } catch (error) {
    next(error);
  }
};

const updateParkingSpace = async (req, res, next) => {
  try {
    const parkingSpace = await ParkingSpace.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!parkingSpace) {
      return res.status(404).json({ success: false, message: 'Parking space not found' });
    }
    res.status(200).json({ success: true, message: 'Parking space updated', data: parkingSpace });
  } catch (error) {
    next(error);
  }
};

const deleteParkingSpace = async (req, res, next) => {
  try {
    const parkingSpace = await ParkingSpace.findByIdAndDelete(req.params.id);
    if (!parkingSpace) {
      return res.status(404).json({ success: false, message: 'Parking space not found' });
    }
    res.status(200).json({ success: true, message: 'Parking space deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getParkingSpaces,
  getParkingSpace,
  createParkingSpace,
  updateParkingSpace,
  deleteParkingSpace,
};
