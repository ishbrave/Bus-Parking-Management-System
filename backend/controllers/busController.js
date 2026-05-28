const Bus = require('../models/Bus');

const getBuses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Bus.countDocuments();
    const buses = await Bus.find()
      .populate('owner', 'name phone')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: buses,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const getBus = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.id).populate('owner', 'name phone');
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });
    res.status(200).json({ success: true, data: bus });
  } catch (error) {
    next(error);
  }
};

const createBus = async (req, res, next) => {
  try {
    const bus = await Bus.create(req.body);
    const populated = await bus.populate('owner', 'name phone');
    res.status(201).json({ success: true, message: 'Bus created', data: populated });
  } catch (error) {
    next(error);
  }
};

const updateBus = async (req, res, next) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('owner', 'name phone');
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });
    res.status(200).json({ success: true, message: 'Bus updated', data: bus });
  } catch (error) {
    next(error);
  }
};

const deleteBus = async (req, res, next) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });
    res.status(200).json({ success: true, message: 'Bus deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBuses, getBus, createBus, updateBus, deleteBus };
