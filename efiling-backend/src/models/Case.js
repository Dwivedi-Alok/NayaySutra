import mongoose from 'mongoose';

const caseSchema = new mongoose.Schema({
  eFilingNumber: {
    type: String,
    required: true,
    unique: true
  },
  cnrNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courtDetails: {
    state: { type: String, required: true },
    district: { type: String, required: true },
    establishment: { type: String, required: true },
    caseType: { type: String, required: true },
    category: {
      type: String,
      enum: ['civil', 'criminal'],
      required: true
    }
  },
  petitioner: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: String,
    age: Number,
    address: String,
    isOrganization: { type: Boolean, default: false },
    organizationDetails: {
      name: String,
      type: String,
      address: String
    }
  },
  respondents: [{
    name: { type: String, required: true },
    designation: String,
    address: String,
    isOrganization: { type: Boolean, default: false }
  }],
  caseDetails: {
    acts: [{
      actName: String,
      sections: [String]
    }],
    caseSummary: String,
    subordinateCourtDetails: {
      courtName: String,
      caseNumber: String,
      judgeName: String,
      dateOfOrder: Date
    }
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  courtFees: {
    filingFee: { type: Number, default: 0 },
    processFee: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    deficitAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid'],
      default: 'pending'
    }
  },
  status: {
    type: String,
    enum: ['draft', 'pending_acceptance', 'not_accepted', 'pending_scrutiny', 'defective', 'filed', 'rejected'],
    default: 'draft'
  },
  signingMethod: {
    type: String,
    enum: ['aadhar', 'digital'],
    required: true
  },
  affirmationSigned: {
    type: Boolean,
    default: false
  },
  submissionDate: Date,
  lastUpdated: Date,
  rejectionReason: String,
  defects: [String],
  hearingDates: [{
    date: Date,
    purpose: String,
    status: String
  }]
}, {
  timestamps: true
});

export default mongoose.model('Case', caseSchema);