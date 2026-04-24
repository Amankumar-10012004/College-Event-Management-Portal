// Email utility - logs to console in development, sends via SMTP in production
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  if (process.env.NODE_ENV === 'development' || !process.env.SMTP_USER) {
    console.log(`\n📧 [EMAIL MOCK] To: ${to} | Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
};

const registrationConfirmEmail = (userName, eventTitle, eventDate, qrCodeImage) => `
<div style="font-family:sans-serif;max-width:600px;margin:auto">
  <h2 style="color:#7c3aed">🎉 Registration Confirmed!</h2>
  <p>Hi <strong>${userName}</strong>,</p>
  <p>You're registered for <strong>${eventTitle}</strong> on <strong>${new Date(eventDate).toLocaleDateString()}</strong>.</p>
  <p>Show this QR code at the entry:</p>
  <img src="${qrCodeImage}" alt="QR Code" style="width:200px"/>
  <p style="color:#666;font-size:12px">CollegeEvents Platform</p>
</div>`;

const reminderEmail = (userName, eventTitle, eventDate, venue) => `
<div style="font-family:sans-serif;max-width:600px;margin:auto">
  <h2 style="color:#7c3aed">⏰ Event Reminder</h2>
  <p>Hi <strong>${userName}</strong>,</p>
  <p><strong>${eventTitle}</strong> is happening tomorrow at <strong>${venue}</strong>.</p>
  <p>Date: ${new Date(eventDate).toLocaleString()}</p>
  <p>Don't forget to bring your QR code!</p>
</div>`;

module.exports = { sendEmail, registrationConfirmEmail, reminderEmail };
