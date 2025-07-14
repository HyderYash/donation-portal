import { NextRequest, NextResponse } from 'next/server'
import { generateReceiptHtml } from '@/lib/email'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { paymentId, amount, purpose, name, timestamp } = body

        if (!paymentId || !amount || !purpose || !name) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Generate receipt HTML
        const receiptHtml = generateReceiptHtml({
            paymentId,
            amount,
            purpose,
            donor: { name, email: '', phone: '' },
            timestamp: new Date(timestamp),
        })

        // For this demo, we'll return the HTML as a downloadable file
        // In a production environment, you might want to use a library like puppeteer
        // to convert HTML to PDF
        const response = new NextResponse(receiptHtml, {
            status: 200,
            headers: {
                'Content-Type': 'text/html',
                'Content-Disposition': `attachment; filename="donation-receipt-${paymentId}.html"`,
            },
        })

        return response
    } catch (error) {
        console.error('Download receipt error:', error)
        return NextResponse.json(
            { error: 'Failed to generate receipt' },
            { status: 500 }
        )
    }
} 