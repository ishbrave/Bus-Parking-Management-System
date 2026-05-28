const Payment = require('../models/Payment');
const ParkingRecord = require('../models/ParkingRecord');
const ParkingSpace = require('../models/ParkingSpace');

const getPayments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Payment.countDocuments();
    const payments = await Payment.find()
      .populate({
        path: 'parkingRecord',
        populate: [
          { path: 'bus', populate: { path: 'owner', select: 'name phone' } },
          { path: 'parkingSpace', select: 'spaceNumber' },
        ],
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: payments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const createPayment = async (req, res, next) => {
  try {
    const { parkingRecord, paymentDate, receivedBy, amount, paymentType } = req.body;

    const record = await ParkingRecord.findById(parkingRecord);
    if (!record) return res.status(404).json({ success: false, message: 'Parking record not found' });
    if (record.paymentStatus === 'Paid') return res.status(400).json({ success: false, message: 'Already paid' });
    if (record.paymentStatus === 'Cancelled') return res.status(400).json({ success: false, message: 'Record is cancelled' });

    const payment = await Payment.create({ parkingRecord, paymentDate, receivedBy, amount, paymentType: paymentType || 'partial' });

    if (paymentType === 'final') {
      const exitTime = paymentDate ? new Date(paymentDate) : new Date();
      const elapsedMs = exitTime - new Date(record.entryTime);
      const elapsedHours = Math.ceil(elapsedMs / (1000 * 60 * 60));
      const totalAmount = Math.max(elapsedHours, 1) * record.hourlyRate;
      const newAmountPaid = record.amountPaid + amount;
      const balanceDue = totalAmount - newAmountPaid;

      await ParkingRecord.findByIdAndUpdate(parkingRecord, {
        exitTime,
        totalAmount,
        amountPaid: newAmountPaid,
        balanceDue: Math.max(balanceDue, 0),
        paymentStatus: 'Paid',
      });

      await ParkingSpace.findByIdAndUpdate(record.parkingSpace, { status: 'Available' });
    } else {
      const newAmountPaid = record.amountPaid + amount;
      await ParkingRecord.findByIdAndUpdate(parkingRecord, {
        amountPaid: newAmountPaid,
        paymentStatus: 'Partially Paid',
      });
    }

    const populated = await Payment.findById(payment._id).populate({
      path: 'parkingRecord',
      populate: [
        { path: 'bus', populate: { path: 'owner', select: 'name phone' } },
        { path: 'parkingSpace', select: 'spaceNumber' },
      ],
    });

    const msg = paymentType === 'final' ? 'Checkout complete — parking space freed' : 'Partial payment recorded';
    res.status(201).json({ success: true, message: msg, data: populated });
  } catch (error) {
    next(error);
  }
};

const deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    const record = await ParkingRecord.findById(payment.parkingRecord);
    if (record) {
      const allPayments = await Payment.find({ parkingRecord: payment.parkingRecord });
      const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

      if (payment.paymentType === 'final') {
        await ParkingRecord.findByIdAndUpdate(payment.parkingRecord, {
          exitTime: null,
          totalAmount: 0,
          balanceDue: 0,
          amountPaid: totalPaid,
          paymentStatus: totalPaid > 0 ? 'Partially Paid' : 'Pending',
        });
        await ParkingSpace.findByIdAndUpdate(record.parkingSpace, { status: 'Occupied' });
      } else {
        await ParkingRecord.findByIdAndUpdate(payment.parkingRecord, {
          amountPaid: totalPaid,
          paymentStatus: totalPaid > 0 ? 'Partially Paid' : 'Pending',
        });
      }
    }

    res.status(200).json({ success: true, message: 'Payment deleted — record state recalculated' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPayments, createPayment, deletePayment };
