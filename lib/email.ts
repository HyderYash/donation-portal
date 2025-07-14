import nodemailer from 'nodemailer'
import { EmailData } from '@/types/donation'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendEmail(emailData: EmailData) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      attachments: emailData.attachments,
    }

    const result = await transporter.sendMail(mailOptions)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export function generateReceiptHtml(donationData: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Donation Receipt</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #ed7a1a; padding-bottom: 20px; margin-bottom: 30px; }
        .receipt-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .amount { font-size: 24px; font-weight: bold; color: #ed7a1a; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You for Your Donation!</h1>
          <p>Your generosity makes a real difference</p>
        </div>
        
        <div class="receipt-details">
          <h2>Donation Receipt</h2>
          <p><strong>Donor Name:</strong> ${donationData.donor.name}</p>
          <p><strong>Email:</strong> ${donationData.donor.email}</p>
          <p><strong>Phone:</strong> ${donationData.donor.phone || 'Not provided'}</p>
          <p><strong>Purpose:</strong> ${donationData.purpose}</p>
          <p><strong>Amount:</strong> <span class="amount">₹${donationData.amount.toLocaleString()}</span></p>
          <p><strong>Payment ID:</strong> ${donationData.paymentId}</p>
          <p><strong>Date:</strong> ${new Date(donationData.timestamp).toLocaleDateString('en-IN')}</p>
        </div>
        
        <p>Your donation will be used to support our ${donationData.purpose.toLowerCase()} initiatives. 
        We are committed to transparency and will keep you updated on how your contribution is making an impact.</p>
        
        <div class="footer">
          <p>This is an official receipt for your donation. Please keep this for your records.</p>
          <p>Thank you for your support!</p>
        </div>
      </div>
    </body>
    </html>
  `
} 