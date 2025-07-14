import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth })

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { donationData, metadata } = body

        // Get referer
        const referer = request.headers.get('referer') || 'Unknown'

        // Get current timestamp and format it
        const now = new Date()
        const timestamp = now.toLocaleString('en-IN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        })

        // Prepare row data for Google Sheets (removed unwanted columns)
        const rowData = [
            timestamp, // Timestamp (formatted)
            donationData.donor.name, // Donor Name
            donationData.donor.email, // Email
            donationData.donor.phone, // Phone
            donationData.amount, // Amount
            donationData.purpose, // Purpose
            donationData.paymentId, // Payment ID
            referer, // Referer
            metadata?.language || 'Unknown', // Language
            metadata?.platform || 'Unknown', // Platform
            metadata?.browser || 'Unknown', // Browser
            metadata?.deviceType || 'Unknown', // Device Type
            metadata?.country || 'Unknown', // Country (if available)
            metadata?.city || 'Unknown', // City (if available)
            metadata?.latitude || 'Unknown', // Latitude
        ]

        // First, try to get the sheet to check if it exists and we have access
        try {
            await sheets.spreadsheets.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
            })
        } catch (error: any) {
            console.error('Sheet access error:', error)

            if (error.code === 403 || error.status === 403) {
                return NextResponse.json({
                    success: false,
                    error: 'Permission denied. Please check:',
                    details: [
                        '1. Service account email has Editor access to the Google Sheet',
                        '2. Google Sheet ID is correct',
                        '3. Google Sheets API is enabled in Google Cloud Console'
                    ],
                    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                    sheetId: process.env.GOOGLE_SHEET_ID
                }, { status: 403 })
            }

            if (error.code === 404 || error.status === 404) {
                return NextResponse.json({
                    success: false,
                    error: 'Google Sheet not found. Please check the Sheet ID.',
                    sheetId: process.env.GOOGLE_SHEET_ID
                }, { status: 404 })
            }

            throw error
        }

        // Try to append data to the sheet
        try {
            const response = await sheets.spreadsheets.values.append({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'A:O', // Updated range for 15 columns
                valueInputOption: 'RAW',
                insertDataOption: 'INSERT_ROWS',
                requestBody: {
                    values: [rowData],
                },
            })

            return NextResponse.json({
                success: true,
                message: 'Donation data stored successfully',
                rowCount: response.data.updates?.updatedRows
            })
        } catch (appendError: any) {
            console.error('Append error:', appendError)

            // If the sheet exists but append fails, try to create the headers first
            if (appendError.code === 400) {
                try {
                    // Try to add headers if they don't exist (updated headers)
                    await sheets.spreadsheets.values.update({
                        spreadsheetId: process.env.GOOGLE_SHEET_ID,
                        range: 'A1:O1',
                        valueInputOption: 'RAW',
                        requestBody: {
                            values: [[
                                'Timestamp', 'Donor Name', 'Email', 'Phone', 'Amount', 'Purpose',
                                'Payment ID', 'Referer', 'Language', 'Platform', 'Browser',
                                'Device Type', 'Country', 'City', 'Latitude'
                            ]]
                        }
                    })

                    // Now try to append the data again
                    const retryResponse = await sheets.spreadsheets.values.append({
                        spreadsheetId: process.env.GOOGLE_SHEET_ID,
                        range: 'A:O',
                        valueInputOption: 'RAW',
                        insertDataOption: 'INSERT_ROWS',
                        requestBody: {
                            values: [rowData],
                        },
                    })

                    return NextResponse.json({
                        success: true,
                        message: 'Donation data stored successfully (with headers created)',
                        rowCount: retryResponse.data.updates?.updatedRows
                    })
                } catch (retryError) {
                    console.error('Retry error:', retryError)
                    throw retryError
                }
            }

            throw appendError
        }

    } catch (error: any) {
        console.error('Error storing donation data:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to store donation data',
                details: error.message
            },
            { status: 500 }
        )
    }
} 