# Google Sheets Setup Guide

## Quick Fix for Permission Error

The error "The caller does not have permission" means your service account doesn't have access to the Google Sheet. Here's how to fix it:

### Step 1: Test Your Current Setup

Visit this URL in your browser to test the connection:
```
http://localhost:3000/api/test-sheets
```

This will show you exactly what's wrong with your setup.

### Step 2: Fix Google Sheet Permissions

1. **Open your Google Sheet**
2. **Click the "Share" button** (top right)
3. **Add your service account email** with **Editor** permissions
   - The email looks like: `your-project@your-project.iam.gserviceaccount.com`
4. **Make sure to give "Editor" access** (not just Viewer)
5. **Click "Send"** (you can uncheck "Notify people")

### Step 3: Verify Your Environment Variables

Make sure your `.env.local` file has these variables:

```env
GOOGLE_SHEET_ID=1JAT7SUtggsVCgzCEkZ9XxkhgNADDYbhQJlSy_KcB0Go
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour long private key here\n-----END PRIVATE KEY-----\n"
```

### Step 4: Get Your Service Account Email

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "IAM & Admin" > "Service Accounts"
4. Find your service account
5. Copy the email address (ends with `@your-project.iam.gserviceaccount.com`)

### Step 5: Get Your Private Key

1. In the same service account page
2. Click on your service account
3. Go to "Keys" tab
4. Click "Add Key" > "Create new key"
5. Choose "JSON" format
6. Download the file
7. Open the JSON file and copy the `private_key` value
8. Paste it in your `.env.local` file (keep the quotes and \n characters)

### Step 6: Get Your Sheet ID

1. Open your Google Sheet
2. Copy the ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
   ```
3. The ID is the long string between `/d/` and `/edit`

### Step 7: Test Again

1. Restart your development server: `npm run dev`
2. Visit: `http://localhost:3000/api/test-sheets`
3. You should see a success message

### Common Issues & Solutions

#### Issue: "Permission denied"
**Solution**: Make sure you shared the sheet with the service account email

#### Issue: "Sheet not found"
**Solution**: Check your GOOGLE_SHEET_ID is correct

#### Issue: "Invalid credentials"
**Solution**: Check your GOOGLE_PRIVATE_KEY is properly formatted

#### Issue: "API not enabled"
**Solution**: Enable Google Sheets API in Google Cloud Console

### Alternative: Create a New Sheet

If you're still having issues, create a new Google Sheet:

1. Create a new Google Sheet
2. Copy the Sheet ID from the URL
3. Share it with your service account email (Editor access)
4. Update your `.env.local` with the new Sheet ID
5. Test the connection

### Testing the Full Flow

Once the test endpoint works:

1. Fill out the donation form
2. Submit a donation
3. Check your Google Sheet - you should see a new row with all the data

### Sheet Structure

Your sheet will automatically get these 15 columns:
- **A**: Timestamp (formatted as DD/MM/YYYY, HH:MM:SS)
- **B**: Donor Name
- **C**: Email
- **D**: Phone
- **E**: Amount
- **F**: Purpose
- **G**: Payment ID
- **H**: Referer
- **I**: Language
- **J**: Platform
- **K**: Browser
- **L**: Device Type
- **M**: Country
- **N**: City
- **O**: Latitude

### Manual Column Setup (Optional)

If you want to create the headers manually, add these in row 1:

```
A1: Timestamp
B1: Donor Name
C1: Email
D1: Phone
E1: Amount
F1: Purpose
G1: Payment ID
H1: Referer
I1: Language
J1: Platform
K1: Browser
L1: Device Type
M1: Country
N1: City
O1: Latitude
```

### Need Help?

If you're still having issues:

1. Check the test endpoint: `/api/test-sheets`
2. Look at the error details
3. Make sure all environment variables are set
4. Verify the service account has Editor access to the sheet
5. Check that Google Sheets API is enabled in your Google Cloud project 