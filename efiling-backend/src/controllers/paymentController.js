import Payment from '../models/Payment.js';
import Case from '../models/Case.js';
import Document from '../models/Document.js';
import Notification from '../models/Notification.js';
import { generatePaymentId } from '../utils/generateIds.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createPaymentOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, caseId, documentId, paymentType, description } = req.body;

    // Validate case or document exists
    let relatedEntity = null;
    if (caseId) {
      relatedEntity = await Case.findOne({ _id: caseId, userId });
      if (!relatedEntity) {
        return res.status(404).json({
          status: 'error',
          message: 'Case not found or access denied'
        });
      }
    } else if (documentId) {
      relatedEntity = await Document.findOne({ _id: documentId, userId });
      if (!relatedEntity) {
        return res.status(404).json({
          status: 'error',
          message: 'Document not found or access denied'
        });
      }
    }

    const paymentId = generatePaymentId();

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: paymentId,
      notes: {
        paymentType,
        userId,
        caseId: caseId || '',
        documentId: documentId || ''
      }
    });

    // Create payment record
    const payment = await Payment.create({
      paymentId,
      userId,
      caseId: caseId || null,
      documentId: documentId || null,
      paymentType,
      amount,
      paymentMethod: 'online',
      description: description || `Payment for ${paymentType}`,
      gatewayDetails: {
        gateway: 'razorpay',
        orderId: razorpayOrder.id
      },
      status: 'pending'
    });

    res.status(201).json({
      status: 'success',
      data: {
        payment,
        razorpayOrder: {
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          key: process.env.RAZORPAY_KEY_ID
        }
      }
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      paymentId 
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        status: 'error',
        message: 'Payment verification failed'
      });
    }

    // Update payment record
    const payment = await Payment.findOne({ paymentId });
    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment record not found'
      });
    }

    payment.status = 'completed';
    payment.paidAt = new Date();
    payment.gatewayDetails.paymentId = razorpay_payment_id;
    payment.gatewayDetails.signature = razorpay_signature;
    await payment.save();

    // Update case or document payment status
    if (payment.caseId) {
      const case_ = await Case.findById(payment.caseId);
      if (case_) {
        case_.courtFees.paidAmount += payment.amount;
        case_.courtFees.deficitAmount = Math.max(0, case_.courtFees.deficitAmount - payment.amount);
        case_.courtFees.paymentStatus = case_.courtFees.deficitAmount === 0 ? 'paid' : 'partial';
        case_.lastUpdated = new Date();
        await case_.save();

        // Update case status if fully paid
        if (case_.courtFees.paymentStatus === 'paid' && case_.status === 'draft') {
          case_.status = 'pending_acceptance';
          await case_.save();
        }
      }
    }

    if (payment.documentId) {
      await Document.findByIdAndUpdate(payment.documentId, {
        paymentStatus: 'paid',
        lastUpdated: new Date()
      });
    }

    // Create notification
    await Notification.create({
      userId: payment.userId,
      type: 'payment_success',
      title: 'Payment Successful',
      message: `Payment of ₹${payment.amount} for ${payment.paymentType} completed successfully`,
      relatedCase: payment.caseId,
      priority: 'medium'
    });

    res.status(200).json({
      status: 'success',
      message: 'Payment verified successfully',
      data: { payment }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, paymentType } = req.query;

    const query = { userId };
    if (status) query.status = status;
    if (paymentType) query.paymentType = paymentType;

    const skip = (page - 1) * limit;

    const payments = await Payment.find(query)
      .populate('caseId', 'eFilingNumber cnrNumber')
      .populate('documentId', 'documentTitle documentType')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: payments.length,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: { payments }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({ 
      _id: paymentId, 
      userId 
    })
    .populate('caseId', 'eFilingNumber cnrNumber')
    .populate('documentId', 'documentTitle documentType');

    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment not found or access denied'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { payment }
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const generatePaymentReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({ 
      _id: paymentId, 
      userId,
      status: 'completed'
    })
    .populate('caseId', 'eFilingNumber cnrNumber petitioner')
    .populate('documentId', 'documentTitle documentType')
    .populate('userId', 'name email mobile');

    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment not found or access denied'
      });
    }

    // Generate receipt data
    const receiptData = {
      receiptNumber: `REC-${payment.paymentId}`,
      paymentId: payment.paymentId,
      amount: payment.amount,
      paidAt: payment.paidAt,
      paymentMethod: payment.paymentMethod,
      description: payment.description,
      user: payment.userId,
      case: payment.caseId,
      document: payment.documentId,
      gatewayDetails: payment.gatewayDetails
    };

    res.status(200).json({
      status: 'success',
      data: { receipt: receiptData }
    });
  } catch (error) {
    console.error('Generate payment receipt error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason, refundAmount } = req.body;
    const userId = req.user.id;

    const payment = await Payment.findOne({ 
      _id: paymentId, 
      userId,
      status: 'completed'
    });

    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment not found or access denied'
      });
    }

    const refundAmountToProcess = refundAmount || payment.amount;

    if (refundAmountToProcess > payment.amount) {
      return res.status(400).json({
        status: 'error',
        message: 'Refund amount cannot exceed payment amount'
      });
    }

    // Initiate refund with Razorpay
    const refund = await razorpay.payments.refund(
      payment.gatewayDetails.paymentId,
      {
        amount: refundAmountToProcess * 100, // Convert to paise
        notes: {
          reason,
          paymentId: payment.paymentId
        }
      }
    );

    // Update payment record
    payment.status = 'refunded';
    payment.refundDetails = {
      refundId: refund.id,
      refundAmount: refundAmountToProcess,
      refundReason: reason,
      refundedAt: new Date()
    };
    await payment.save();

    // Create notification
    await Notification.create({
      userId: payment.userId,
      type: 'payment_refund',
      title: 'Payment Refunded',
      message: `Refund of ₹${refundAmountToProcess} has been processed for payment ${payment.paymentId}`,
      relatedCase: payment.caseId,
      priority: 'medium'
    });

    res.status(200).json({
      status: 'success',
      message: 'Refund processed successfully',
      data: { payment, refund }
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};