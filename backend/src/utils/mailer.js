const nodemailer = require('nodemailer');

/**
 * Sends an email notification about a new contact form inquiry.
 * @param {Object} data
 * @param {string} data.name - Name of the sender
 * @param {string} data.email - Email address of the sender
 * @param {string} data.phone - Mobile number of the sender
 * @param {string} data.message - Message content
 */
const sendInquiryEmail = async ({ name, email, phone, message }) => {
  // Check if SMTP configuration exists
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[MAILER WARNING] SMTP credentials not configured (SMTP_USER and SMTP_PASS are required). Skipping email dispatch.');
    return { skipped: true };
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const emailTo = process.env.EMAIL_TO || 'bestbillsolutions@gmail.com';

  const mailOptions = {
    from: `"BestBill Website" <${process.env.SMTP_USER}>`,
    to: emailTo,
    subject: `New Website Inquiry from ${name}`,
    text: `You have received a new inquiry from your website.
    
Name: ${name}
Email: ${email}
Phone: ${phone}
Message: ${message}

--
BestBill Notification`,
    html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="background: linear-gradient(to right, #0ea5e9, #38bdf8); padding: 20px; border-radius: 8px 8px 0 0; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.03em;">BestBill<sup>&trade;</sup></h2>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">New Website Inquiry</p>
      </div>
      
      <div style="padding: 24px;">
        <p style="font-size: 16px; margin-top: 0;">Hi Shubham,</p>
        <p>A user has submitted an inquiry form on the BestBill marketing website. Here are the details:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px 0; font-weight: bold; width: 120px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Name:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: bold; border-bottom: 1px solid #f1f5f9; color: #64748b;">Email:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;"><a href="mailto:${email}" style="color: #0ea5e9; text-decoration: none; font-weight: 600;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: bold; border-bottom: 1px solid #f1f5f9; color: #64748b;">Phone:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600;">${phone}</td>
          </tr>
        </table>
        
        <div style="margin-top: 24px; padding: 20px; background-color: #f8fafc; border-left: 4px solid #0ea5e9; border-radius: 6px;">
          <h4 style="margin: 0 0 8px 0; color: #475569; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Message:</h4>
          <p style="white-space: pre-wrap; margin: 0; color: #1e293b; font-size: 15px; line-height: 1.5;">${message}</p>
        </div>
      </div>
      
      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
        <p style="margin: 0;">This is an automated system notification from your BestBill server.</p>
      </div>
    </div>`
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendInquiryEmail };
