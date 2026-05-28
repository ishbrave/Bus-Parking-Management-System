const Owner = require('../models/Owner');

const getOwners = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Owner.countDocuments();
    const owners = await Owner.find().skip(skip).limit(limit).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: owners,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const getOwner = async (req, res, next) => {
  try {
    const owner = await Owner.findById(req.params.id);
    if (!owner) return res.status(404).json({ success: false, message: 'Owner not found' });
    res.status(200).json({ success: true, data: owner });
  } catch (error) {
    next(error);
  }
};

const createOwner = async (req, res, next) => {
  try {
    const owner = await Owner.create(req.body);
    res.status(201).json({ success: true, message: 'Owner created', data: owner });
  } catch (error) {
    next(error);
  }
};

const updateOwner = async (req, res, next) => {
  try {
    const owner = await Owner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!owner) return res.status(404).json({ success: false, message: 'Owner not found' });
    res.status(200).json({ success: true, message: 'Owner updated', data: owner });
  } catch (error) {
    next(error);
  }
};

const deleteOwner = async (req, res, next) => {
  try {
    const owner = await Owner.findByIdAndDelete(req.params.id);
    if (!owner) return res.status(404).json({ success: false, message: 'Owner not found' });
    res.status(200).json({ success: true, message: 'Owner deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOwners, getOwner, createOwner, updateOwner, deleteOwner };
