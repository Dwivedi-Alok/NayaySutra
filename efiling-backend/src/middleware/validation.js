import { body, param, query, validationResult } from 'express-validator';
import { INDIAN_STATES, USER_TYPES } from '../utils/constants.js';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
export const validateRegistration = [
  body('userType')
    .isIn(Object.values(USER_TYPES))
    .withMessage('Invalid user type'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('mobile')
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian mobile number'),
  body('barRegistrationNumber')
    .if(body('userType').equals('advocate'))
    .notEmpty()
    .withMessage('Bar registration number is required for advocates'),
  body('state')
    .isIn(INDIAN_STATES)
    .withMessage('Please select a valid state'),
  body('district')
    .notEmpty()
    .trim()
    .withMessage('District is required'),
  handleValidationErrors
];

// Login validation
export const validateLogin = [
  body('userId')
    .notEmpty()
    .trim()
    .withMessage('User ID is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  handleValidationErrors
];

// Profile completion validation
export const validateProfileCompletion = [
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character'),
  body('firstName')
    .notEmpty()
    .trim()
    .withMessage('First name is required'),
  body('lastName')
    .notEmpty()
    .trim()
    .withMessage('Last name is required'),
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Please select a valid gender'),
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  handleValidationErrors
];

// Case creation validation
export const validateCaseCreation = [
  body('courtDetails.state')
    .isIn(INDIAN_STATES)
    .withMessage('Please select a valid state'),
  body('courtDetails.district')
    .notEmpty()
    .trim()
    .withMessage('District is required'),
  body('courtDetails.establishment')
    .notEmpty()
    .trim()
    .withMessage('Court establishment is required'),
  body('courtDetails.caseType')
    .notEmpty()
    .trim()
    .withMessage('Case type is required'),
  body('courtDetails.category')
    .isIn(['civil', 'criminal'])
    .withMessage('Case category must be civil or criminal'),
  body('petitioner.firstName')
    .notEmpty()
    .trim()
    .withMessage('Petitioner first name is required'),
  body('petitioner.lastName')
    .notEmpty()
    .trim()
    .withMessage('Petitioner last name is required'),
  body('signingMethod')
    .isIn(['aadhar', 'digital'])
    .withMessage('Signing method must be aadhar or digital'),
  handleValidationErrors
];

// Document upload validation
export const validateDocumentUpload = [
  body('documentType')
    .isIn(['petition', 'affidavit', 'application', 'reply', 'rejoinder', 'other'])
    .withMessage('Invalid document type'),
  body('documentTitle')
    .notEmpty()
    .trim()
    .withMessage('Document title is required'),
  body('cnrNumber')
    .optional()
    .matches(/^[A-Z]{4}\d{2}-\d{6}-\d{4}$/)
    .withMessage('Invalid CNR number format'),
  handleValidationErrors
];

// Payment validation
export const validatePayment = [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be greater than 0'),
  body('paymentType')
    .isIn(['court_fee', 'deficit_fee', 'filing_fee'])
    .withMessage('Invalid payment type'),
  body('paymentMethod')
    .isIn(['online', 'offline'])
    .withMessage('Payment method must be online or offline'),
  handleValidationErrors
];

// OTP validation
export const validateOTP = [
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be 6 digits'),
  handleValidationErrors
];

// Case ID parameter validation
export const validateCaseId = [
  param('caseId')
    .isMongoId()
    .withMessage('Invalid case ID'),
  handleValidationErrors
];

// Pagination validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];