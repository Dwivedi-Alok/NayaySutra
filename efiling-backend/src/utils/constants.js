export const USER_TYPES = {
  ADVOCATE: 'advocate',
  PARTY: 'party',
  POLICE: 'police'
};

export const CASE_STATUS = {
  DRAFT: 'draft',
  PENDING_ACCEPTANCE: 'pending_acceptance',
  NOT_ACCEPTED: 'not_accepted',
  PENDING_SCRUTINY: 'pending_scrutiny',
  DEFECTIVE: 'defective',
  FILED: 'filed',
  REJECTED: 'rejected'
};

export const DOCUMENT_TYPES = {
  PETITION: 'petition',
  AFFIDAVIT: 'affidavit',
  APPLICATION: 'application',
  REPLY: 'reply',
  REJOINDER: 'rejoinder',
  OTHER: 'other'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

export const COURT_FEES = {
  CIVIL: {
    FILING_FEE: 500,
    PROCESS_FEE: 200
  },
  CRIMINAL: {
    FILING_FEE: 300,
    PROCESS_FEE: 150
  }
};

export const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes

export const JWT_EXPIRY = '7d';

export const FILE_UPLOAD_LIMITS = {
  MAX_SIZE: 25 * 1024 * 1024, // 25MB
  ALLOWED_TYPES: ['application/pdf']
};

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
];