const Payment = require('../models/Payment');
const ParkingRecord = require('../models/ParkingRecord');
const ParkingSpace = require('../models/ParkingSpace');

const getDashboardStats = async (req, res, next) => {
  try {
    const totalSpaces = await ParkingSpace.countDocuments();
    const availableSpaces = await ParkingSpace.countDocuments({ status: 'Available' });
    const occupiedSpaces = await ParkingSpace.countDocuments({ status: 'Occupied' });
    const totalRecords = await ParkingRecord.countDocuments();
    const pendingPayments = await ParkingRecord.countDocuments({ paymentStatus: { $in: ['Pending', 'Partially Paid'] } });
    const paidRecords = await ParkingRecord.countDocuments({ paymentStatus: 'Paid' });

    const paymentAgg = await Payment.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
    ]);
    const totalRevenue = paymentAgg.length > 0 ? paymentAgg[0].totalRevenue : 0;

    const statusData = await ParkingRecord.aggregate([
      { $group: { _id: '$paymentStatus', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSpaces,
        availableSpaces,
        occupiedSpaces,
        totalRecords,
        pendingPayments,
        paidRecords,
        totalRevenue,
        statusData,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDailyIncomeReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {};
    if (startDate || endDate) {
      matchStage.paymentDate = {};
      if (startDate) matchStage.paymentDate.$gte = new Date(startDate);
      if (endDate) {
        const ed = new Date(endDate);
        ed.setUTCHours(23, 59, 59, 999);
        matchStage.paymentDate.$lte = ed;
      }
    }

    const report = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' } },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

const getAllReportData = async (req, res, next) => {
  try {
    const records = await ParkingRecord.find()
      .populate({ path: 'bus', populate: { path: 'owner', select: 'name phone' } })
      .populate('parkingSpace', 'spaceNumber location pricePerDay')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getDailyIncomeReport, getAllReportData };
