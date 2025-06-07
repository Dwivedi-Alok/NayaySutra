import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case'
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  paymentType: {
    type: String,
    enum: ['court_fee', 'deficit_fee', 'filing_fee'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['online', 'offline'],
    required: true
  },
  gatewayDetails: {
    gateway: String,
    transactionId: String,
    orderId: String,
    paymentSignature: String
  },
  offlineDetails: {
    receiptNumber: String,
    receiptDate: Date,
    receiptDocument: String
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDate: Date,
  description: String
}, {
  timestamps: true
});

export default mongoose.model('Payment', paymentSchema);