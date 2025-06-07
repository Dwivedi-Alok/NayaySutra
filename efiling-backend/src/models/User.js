import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  userType: {
    type: String,
    enum: ['advocate', 'party', 'police'],
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  personalInfo: {
    firstName: String,
    lastName: String,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    dateOfBirth: Date,
    address: {
      street: String,
      city: String,
      state: String,
      pinCode: String
    }
  },
  advocateInfo: {
    barRegistrationNumber: String,
    enrolledState: String,
    enrolledDistrict: String,
    enrolledEstablishment: String
  },
  policeInfo: {
    stationName: String,
    stationAddress: String,
    district: String,
    state: String
  },
  profilePhoto: String,
  identityProof: {
    type: String,
    document: String
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isMobileVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  otpCode: String,
  otpExpires: Date
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

export default mongoose.model('User', userSchema);