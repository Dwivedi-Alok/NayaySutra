// efiling/controllers/authController.js - Continued

import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendOTP, verifyOTP } from '../services/otpService.js';
import { sendWelcomeEmail } from '../services/emailService.js';
import { generateUserId } from '../utils/generateIds.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user }
  });
};

export const register = async (req, res) => {
  try {
    const { userType, email, mobile, barRegistrationNumber, state, district, establishment } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }]
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email or mobile already exists'
      });
    }

    // Generate unique user ID
    const userId = generateUserId(userType);

    // Create user data
    const userData = {
      userId,
      userType,
      email,
      mobile,
      password: crypto.randomBytes(32).toString('hex'), // Temporary password
      isEmailVerified: false,
      isMobileVerified: false
    };

    // Add specific info based on user type
    if (userType === 'advocate') {
      userData.advocateInfo = {
        barRegistrationNumber,
        enrolledState: state,
        enrolledDistrict: district,
        enrolledEstablishment: establishment
      };
    } else if (userType === 'police') {
      userData.policeInfo = {
        stationName: req.body.stationName,
        stationAddress: req.body.stationAddress,
        district,
        state
      };
    }

    const newUser = await User.create(userData);

    // Send OTP for verification
    await sendOTP(mobile, email, 'registration');

    res.status(201).json({
      status: 'success',
      message: 'Registration initiated. Please verify OTP sent to your mobile and email.',
      data: {
        userId: newUser.userId,
        userType: newUser.userType
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const verifyOTPController = async (req, res) => {
  try {
    const { userId, mobileOTP, emailOTP } = req.body;

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Verify OTP (using same OTP for both mobile and email for simplicity)
    const otpVerification = await verifyOTP(user.mobile, user.email, mobileOTP);
    
    if (!otpVerification.success) {
      return res.status(400).json({
        status: 'error',
        message: otpVerification.message
      });
    }

    // Mark as verified
    user.isMobileVerified = true;
    user.isEmailVerified = true;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'OTP verified successfully. Please complete your profile.',
      data: { userId: user.userId }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const completeProfile = async (req, res) => {
  try {
    const { 
      userId, 
      password, 
      firstName, 
      lastName, 
      gender, 
      dateOfBirth, 
      address, 
      city, 
      state, 
      pinCode 
    } = req.body;

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (!user.isMobileVerified || !user.isEmailVerified) {
      return res.status(400).json({
        status: 'error',
        message: 'Please verify your mobile and email first'
      });
    }

    // Update user profile
    user.password = password;
    user.personalInfo = {
      firstName,
      lastName,
      gender,
      dateOfBirth: new Date(dateOfBirth),
      address: {
        street: address,
        city,
        state,
        pinCode
      }
    };

    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, `${firstName} ${lastName}`, user.userId);

    createSendToken(user, 201, res);
  } catch (error) {
    console.error('Profile completion error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide userId and password'
      });
    }

    // Find user by userId, email, or mobile
    const user = await User.findOne({ 
      $or: [
        { userId },
        { email: userId },
        { mobile: userId }
      ] 
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is deactivated. Please contact support.'
      });
    }

    if (!user.isEmailVerified || !user.isMobileVerified) {
      return res.status(401).json({
        status: 'error',
        message: 'Please complete your registration by verifying email and mobile'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    createSendToken(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

export const forgotPassword = async (req, res) => {
  try {
    const { emailOrMobile } = req.body;

    const user = await User.findOne({
      $or: [
        { email: emailOrMobile },
        { mobile: emailOrMobile }
      ]
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found with that email or mobile number'
      });
    }

    // Send OTP for password reset
    await sendOTP(user.mobile, user.email, 'password_reset');

    res.status(200).json({
      status: 'success',
      message: 'OTP sent for password reset'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { emailOrMobile, otp, newPassword } = req.body;

    const user = await User.findOne({
      $or: [
        { email: emailOrMobile },
        { mobile: emailOrMobile }
      ]
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Verify OTP
    const otpVerification = await verifyOTP(user.mobile, user.email, otp);
    
    if (!otpVerification.success) {
      return res.status(400).json({
        status: 'error',
        message: otpVerification.message
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Remove sensitive fields that shouldn't be updated here
    delete updates.password;
    delete updates.email;
    delete updates.mobile;
    delete updates.userId;
    delete updates.userType;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // Check if current password is correct
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    createSendToken(user, 200, res);
  } catch (error) {
    console.error('Update password error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    await sendOTP(user.mobile, user.email, 'verification');

    res.status(200).json({
      status: 'success',
      message: 'OTP resent successfully'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};