// efiling/services/smsService.js - Continued
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendSMS = async (mobile, message) => {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID) {
      console.warn('⚠️ Twilio not configured, SMS not sent');
      return { success: false, message: 'SMS service not configured' };
    }

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mobile.startsWith('+91') ? mobile : `+91${mobile}`
    });

    console.log('✅ SMS sent:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('❌ SMS send error:', error);
    throw new Error(`SMS sending failed: ${error.message}`);
  }
};

export const sendOTPSMS = async (mobile, otp, purpose = 'verification') => {
  const message = `Your OTP for ${purpose} on Nayay Sutra e-Filing is: ${otp}. Valid for 10 minutes. Do not share with anyone.`;
  return await sendSMS(mobile, message);
};

export const sendCaseUpdateSMS = async (mobile, caseNumber, status) => {
  const message = `Nayay Sutra: Your case ${caseNumber} status updated to ${status}. Login to check details.`;
  return await sendSMS(mobile, message);
};