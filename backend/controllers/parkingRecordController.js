const ParkingRecord = require('../models/ParkingRecord');
const ParkingSpace = require('../models/ParkingSpace');

const getParkingRecords = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await ParkingRecord.countDocuments();
    const records = await ParkingRecord.find()
      .populate({ path: 'bus', populate: { path: 'owner', select: 'name phone' } })
      .populate('parkingSpace', 'spaceNumber location pricePerDay')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: records,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const getParkingRecord = async (req, res, next) => {
  try {
    const record = await ParkingRecord.findById(req.params.id)
      .populate({ path: 'bus', populate: { path: 'owner', select: 'name phone' } })
      .populate('parkingSpace', 'spaceNumber location pricePerDay');
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

const createParkingRecord = async (req, res, next) => {
  try {
    const { bus, parkingSpace, entryTime, hourlyRate } = req.body;
    const record = await ParkingRecord.create({
      bus,
      parkingSpace,
      entryTime: entryTime || Date.now(),
      hourlyRate: hourlyRate || 500,
    });

    await ParkingSpace.findByIdAndUpdate(parkingSpace, { status: 'Occupied' });

    const populated = await ParkingRecord.findById(record._id)
      .populate({ path: 'bus', populate: { path: 'owner', select: 'name phone' } })
      .populate('parkingSpace', 'spaceNumber location pricePerDay');

    res.status(201).json({ success: true, message: 'Parking record created — timer started', data: populated });
  } catch (error) {
    next(error);
  }
};

const updateParkingRecord = async (req, res, next) => {
  try {
    if (req.body.paymentStatus === 'Cancelled') {
      await ParkingSpace.findByIdAndUpdate(req.body.parkingSpace, { status: 'Available' });
    }

    const record = await ParkingRecord.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate({ path: 'bus', populate: { path: 'owner', select: 'name phone' } })
      .populate('parkingSpace', 'spaceNumber location pricePerDay');
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

    res.status(200).json({ success: true, message: 'Parking record updated', data: record });
  } catch (error) {
    next(error);
  }
};

const deleteParkingRecord = async (req, res, next) => {
  try {
    const record = await ParkingRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

    await ParkingSpace.findByIdAndUpdate(record.parkingSpace, { status: 'Available' });

    res.status(200).json({ success: true, message: 'Parking record deleted' });
  } catch (error) {
    next(error);
  }
};

const checkoutParkingRecord = async (req, res, next) => {
  try {
    const record = await ParkingRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    if (record.paymentStatus === 'Paid') return res.status(400).json({ success: false, message: 'Already paid' });
    if (record.paymentStatus === 'Cancelled') return res.status(400).json({ success: false, message: 'Record is cancelled' });

    const exitTime = new Date();
    const elapsedMs = exitTime - new Date(record.entryTime);
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    const totalAmount = Math.max(1, Math.ceil(elapsedHours)) * record.hourlyRate;
    const balanceDue = totalAmount - record.amountPaid;

    res.status(200).json({
      success: true,
      data: {
        _id: record._id,
        bus: record.bus,
        parkingSpace: record.parkingSpace,
        entryTime: record.entryTime,
        exitTime,
        hourlyRate: record.hourlyRate,
        elapsedHours,
        totalAmount,
        amountPaid: record.amountPaid,
        balanceDue,
        paymentStatus: record.amountPaid > 0 ? 'Partially Paid' : 'Pending',
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getParkingRecords,
  getParkingRecord,
  createParkingRecord,
  updateParkingRecord,
  deleteParkingRecord,
  checkoutParkingRecord,
};
