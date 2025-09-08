import nodemailer from 'nodemailer';
import { resetPasswordTemplate, welcomeTemplate, passwordChangedTemplate } from './templates';

// Create Gmail SMTP transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Gmail specific settings
    tls: {
      ciphers: 'SSLv3',
    },
  });
};

const FROM_EMAIL = process.env.FROM_EMAIL || 'CardVerse Support <cardverse.eggplant203@gmail.com>';

/**
 * Send a password reset email using Gmail SMTP
 */
export async function sendPasswordResetEmail(
  email: string,
  username: string,
  resetToken: string
): Promise<void> {
  // Create the reset link
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

  // Generate email content
  const html = resetPasswordTemplate(username, resetLink);

  // Send email
  const transporter = createTransporter();

  const mailOptions = {
    from: FROM_EMAIL,
    to: email,
    subject: 'Reset Your CardVerse Password',
    html: html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

/**
 * Send a password changed notification email using Gmail SMTP
 */
export async function sendPasswordChangedEmail(
  email: string,
  username: string
): Promise<void> {
  // Generate email content
  const html = passwordChangedTemplate(username);

  // Send email
  const transporter = createTransporter();

  const mailOptions = {
    from: FROM_EMAIL,
    to: email,
    subject: 'Your CardVerse Password Has Been Changed',
    html: html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password changed email:', error);
    throw new Error('Failed to send password changed notification email');
  }
}

/**
 * Send a welcome email with verification link using Gmail SMTP
 */
export async function sendWelcomeEmail(
  email: string,
  username: string,
  verificationToken: string
): Promise<void> {
  // Create the verification link
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const verifyLink = `${baseUrl}/verify-email?token=${verificationToken}`;

  // Generate email content
  const html = welcomeTemplate(username, verifyLink);

  // Send email
  const transporter = createTransporter();

  const mailOptions = {
    from: FROM_EMAIL,
    to: email,
    subject: 'Welcome to CardVerse!',
    html: html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}

/**
 * Test email configuration
 */
export async function testEmailConnection(): Promise<boolean> {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
}
