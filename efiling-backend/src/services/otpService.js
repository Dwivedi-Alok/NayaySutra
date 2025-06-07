// efiling/services/otpService.js - Continued
import { generateOTP } from '../utils/hashGenerator.js';
import { sendOTPEmail } from './emailService.js';
import { sendOTPSMS } from './smsService.js';
import User from '../models/User.js';
import { OTP_EXPIRY_TIME } from '../utils/constants.js';

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map();

export const sendOTP = async (mobile, email, purpose = 'verification') => {
  try {
    const otp = generateOTP(6);
    const otpKey = `${mobile}_${email}`;
    
    // Store OTP with expiry
    otpStore.set(otpKey, {
      otp,
      expires: Date.now() + OTP_EXPIRY_TIME,
      purpose
    });

    // Send OTP via email and SMS
    const emailPromise = sendOTPEmail(email, otp, purpose);
    const smsPromise = sendOTPSMS(mobile, otp, purpose);

    await Promise.allSettled([emailPromise, smsPromise]);

    console.log(`✅ OTP sent to ${mobile} and ${email}`);
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('❌ OTP send error:', error);
    throw new Error(`OTP sending failed: ${error.message}`);
  }
};

export const verifyOTP = async (mobile, email, providedOTP) => {
  try {
    const otpKey = `${mobile}_${email}`;
    const storedOTPData = otpStore.get(otpKey);

    if (!storedOTPData) {
      return { success: false, message: 'OTP not found or expired' };
    }

    if (Date.now() > storedOTPData.expires) {
      otpStore.delete(otpKey);
      return { success: false, message: 'OTP expired' };
    }

    if (storedOTPData.otp !== providedOTP) {
      return { success: false, message: 'Invalid OTP' };
    }

    // OTP verified successfully, remove from store
    otpStore.delete(otpKey);
    return { success: true, message: 'OTP verified successfully' };
  } catch (error) {
    console.error('❌ OTP verification error:', error);
    throw new Error(`OTP verification failed: ${error.message}`);
  }
};

export const resendOTP = async (mobile, email, purpose = 'verification') => {
  const otpKey = `${mobile}_${email}`;
  
  // Clear existing OTP
  otpStore.delete(otpKey);
  
  // Send new OTP
  return await sendOTP(mobile, email, purpose);
};