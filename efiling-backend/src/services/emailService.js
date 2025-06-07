import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

export const sendWelcomeEmail = async (email, name, userId) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Welcome to Nayay Sutra e-Filing Portal</h2>
      <p>Dear ${name},</p>
      <p>Your account has been successfully created with User ID: <strong>${userId}</strong></p>
      <p>You can now access all e-Filing services including:</p>
      <ul>
        <li>File new cases</li>
        <li>Upload documents</li>
        <li>Track case status</li>
        <li>Make payments online</li>
      </ul>
      <p>Best regards,<br>Nayay Sutra Team</p>
    </div>
  `;

  return await sendEmail({
    email,
    subject: 'Welcome to Nayay Sutra e-Filing Portal',
    html
  });
};

export const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">OTP Verification</h2>
      <p>Your OTP for ${purpose} is:</p>
      <div style="font-size: 32px; font-weight: bold; color: #dc2626; text-align: center; margin: 20px 0; padding: 20px; background-color: #fef2f2; border-radius: 8px;">
        ${otp}
      </div>
      <p>This OTP is valid for 10 minutes only.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>Nayay Sutra Team</p>
    </div>
  `;

  return await sendEmail({
    email,
    subject: `OTP for ${purpose} - Nayay Sutra`,
    html
  });
};

export const sendCaseStatusUpdate = async (email, name, caseNumber, status, message) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Case Status Update</h2>
      <p>Dear ${name},</p>
      <p>Your case <strong>${caseNumber}</strong> status has been updated.</p>
      <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>New Status:</strong> ${status}</p>
        <p><strong>Details:</strong> ${message}</p>
      </div>
      <p>You can check your case details by logging into your account.</p>
      <p>Best regards,<br>Nayay Sutra Team</p>
    </div>
  `;

  return await sendEmail({
    email,
    subject: `Case Update: ${caseNumber} - Nayay Sutra`,
    html
  });
};