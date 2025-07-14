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

export async function GET() {
    try {
        // Test 1: Check if credentials are loaded
        const credentials = {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY ? 'Present' : 'Missing',
            sheet_id: process.env.GOOGLE_SHEET_ID,
        }

        // Test 2: Try to get sheet metadata
        const sheetResponse = await sheets.spreadsheets.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
        })

        return NextResponse.json({
            success: true,
            message: 'Google Sheets connection successful',
            credentials,
            sheetInfo: {
                title: sheetResponse.data.properties?.title,
                sheets: sheetResponse.data.sheets?.map(sheet => sheet.properties?.title),
            }
        })

    } catch (error: any) {
        console.error('Google Sheets test error:', error)

        return NextResponse.json({
            success: false,
            error: error.message,
            details: {
                code: error.code,
                status: error.status,
                message: error.message,
            },
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? 'Present' : 'Missing',
                private_key: process.env.GOOGLE_PRIVATE_KEY ? 'Present' : 'Missing',
                sheet_id: process.env.GOOGLE_SHEET_ID ? 'Present' : 'Missing',
            }
        }, { status: 500 })
    }
} 