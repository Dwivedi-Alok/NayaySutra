import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  documentId: {
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
  cnrNumber: String,
  documentType: {
    type: String,
    required: true,
    enum: ['petition', 'affidavit', 'application', 'reply', 'rejoinder', 'other']
  },
  documentTitle: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: Number,
  mimeType: String,
  hashValue: {
    type: String,
    required: true
  },
  pageCount: Number,
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  signingMethod: {
    type: String,
    enum: ['aadhar', 'digital']
  },
  isSigned: {
    type: Boolean,
    default: false
  },
  signedAt: Date,
  courtFeeRequired: {
    type: Boolean,
    default: false
  },
  courtFeeAmount: Number,
  status: {
    type: String,
    enum: ['uploaded', 'pending_payment', 'signed', 'filed', 'rejected'],
    default: 'uploaded'
  }
}, {
  timestamps: true
});

export default mongoose.model('Document', documentSchema);