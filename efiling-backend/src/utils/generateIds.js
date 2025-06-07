import crypto from 'crypto';

export const generateUserId = (userType) => {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  const prefix = userType.toUpperCase().substring(0, 3);
  return `${prefix}${timestamp.slice(-6)}${random}`;
};

export const generateEFilingNumber = () => {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-8);
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `EF/${year}/${timestamp}${random}`;
};

export const generateCNRNumber = (state, district) => {
  const year = new Date().getFullYear();
  const stateCode = state.substring(0, 2).toUpperCase();
  const districtCode = district.substring(0, 2).toUpperCase();
  const sequence = Math.floor(Math.random() * 900000) + 100000;
  return `${stateCode}${districtCode}01-${sequence}-${year}`;
};

export const generateDocumentId = () => {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `DOC${timestamp.slice(-8)}${random}`;
};

export const generatePaymentId = () => {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `PAY${timestamp.slice(-8)}${random}`;
};