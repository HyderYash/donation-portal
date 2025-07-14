# NGO Donation Platform

A modern donation platform for A Ray of Hope Charitable Trust, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Modern UI/UX**: Beautiful, responsive design with animations
- **Form Validation**: Real-time validation with visual feedback
- **Payment Integration**: Razorpay payment gateway (simulated for demo)
- **Data Storage**: MongoDB for donation records
- **Email Notifications**: Automatic receipt emails
- **Google Sheets Integration**: Store donation data with metadata
- **Mobile Responsive**: Works perfectly on all devices

## Google Sheets Integration

The platform automatically stores all donation data in Google Sheets with comprehensive metadata including:

### Donation Data
- Timestamp
- Donor Name, Email, Phone
- Amount and Purpose
- Payment ID

### Metadata Collected
- IP Address
- User Agent
- Screen Resolution
- Timezone
- Language
- Platform & Browser
- Device Type
- Geographic Location (Country, City, Coordinates)
- Referer URL

### Setup Instructions

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google Sheets API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API" and enable it

3. **Create Service Account**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in service account details
   - Download the JSON key file

4. **Create Google Sheet**
   - Create a new Google Sheet
   - Share it with your service account email (with Editor permissions)
   - Copy the Sheet ID from the URL

5. **Set Environment Variables**
   ```env
   GOOGLE_SHEET_ID=your_sheet_id_here
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
   GOOGLE_PRIVATE_KEY=your_private_key_from_json_file
   ```

6. **Sheet Structure**
   The API expects the following columns in your sheet:
   ```
   A: Timestamp | B: Donor Name | C: Email | D: Phone | E: Amount | F: Purpose | G: Payment ID | H: IP Address | I: User Agent | J: Referer | K: Screen Resolution | L: Timezone | M: Language | N: Platform | O: Browser | P: Device Type | Q: Country | R: City | S: Latitude | T: Longitude
   ```

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in your configuration
4. Run the development server: `npm run dev`

## Environment Variables

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Google Sheets Configuration
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Usage

1. Fill out the donation form with valid information
2. Click "Donate Now" to simulate payment
3. Data is automatically stored in Google Sheets with metadata
4. Redirect to thank-you page with donation details

## Trust Information

- **Name**: A Ray of Hope Charitable Trust
- **Founder**: Mr. Sanjay Kumar
- **PAN**: AAHTA8428R
- **80G Registration**: AAHTA8428RF20211
- **Contact**: +91 9730255167
- **Address**: B4, Safa Complex, Sheikh Wasti, Lane 2, Wakad, Pune - 411057

## Technologies Used

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Database**: MongoDB
- **Payment**: Razorpay
- **Email**: Nodemailer
- **Data Storage**: Google Sheets API

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Payment**: Razorpay
- **Database**: MongoDB
- **Email**: Nodemailer
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Prerequisites

- Node.js 18+ 
- MongoDB database
- Razorpay account
- Email service (Gmail recommended)

## Configuration

### Razorpay Setup
1. Create a Razorpay account at [razorpay.com](https://razorpay.com)
2. Get your API keys from the Razorpay Dashboard
3. Add them to your `.env.local` file

### MongoDB Setup
1. Create a MongoDB database (MongoDB Atlas recommended)
2. Get your connection string
3. Add it to your `.env.local` file

### Email Setup (Gmail)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Use the App Password in your `.env.local` file

## Features in Detail

### Donation Form
- Preset amounts: ₹100, ₹500, ₹1000, ₹5000
- Custom amount input
- Required fields: Name, Email
- Optional field: Phone number
- Donation purpose dropdown with 8 categories

### Payment Processing
- Secure Razorpay integration
- Payment verification with signature
- Error handling for failed payments
- Automatic email confirmations

### Database Schema
```javascript
{
  orderId: String,
  paymentId: String,
  amount: Number,
  purpose: String,
  donor: {
    name: String,
    email: String,
    phone: String
  },
  status: String, // 'pending' | 'completed' | 'failed'
  timestamp: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Security Considerations

- All payment data is processed by Razorpay
- Payment signatures are verified server-side
- Environment variables are used for sensitive data
- Input validation on all forms
- HTTPS required for production

## License

This project is open source and available under the MIT License. 