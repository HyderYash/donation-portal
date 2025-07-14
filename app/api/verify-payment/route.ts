import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import clientPromise from '@/lib/mongodb'
import { sendEmail, generateReceiptHtml } from '@/lib/email'

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { paymentId, orderId, signature, donationData } = body

        if (!paymentId || !orderId || !signature || !donationData) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Verify signature
        const text = `${orderId}|${paymentId}`
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(text)
            .digest('hex')

        if (generatedSignature !== signature) {
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            )
        }

        // Verify payment with Razorpay
        const payment = await razorpay.payments.fetch(paymentId)

        if (payment.status !== 'captured') {
            return NextResponse.json(
                { error: 'Payment not captured' },
                { status: 400 }
            )
        }

        // Update donation record in MongoDB
        const client = await clientPromise
        const db = client.db('ngo_donations')

        const updateResult = await db.collection('donations').updateOne(
            { orderId },
            {
                $set: {
                    paymentId,
                    status: 'completed',
                    updatedAt: new Date(),
                },
            }
        )

        if (updateResult.matchedCount === 0) {
            return NextResponse.json(
                { error: 'Donation record not found' },
                { status: 404 }
            )
        }

        // Send confirmation email
        const emailHtml = generateReceiptHtml({
            ...donationData,
            paymentId,
            timestamp: new Date(),
        })

        const emailResult = await sendEmail({
            to: donationData.donor.email,
            subject: 'Thank you for your donation! - Receipt Attached',
            html: emailHtml,
        })

        if (!emailResult.success) {
            console.error('Email sending failed:', emailResult.error)
            // Don't fail the payment verification if email fails
        }

        return NextResponse.json({
            success: true,
            paymentId,
            emailSent: emailResult.success,
        })
    } catch (error) {
        console.error('Payment verification error:', error)
        return NextResponse.json(
            { error: 'Payment verification failed' },
            { status: 500 }
        )
    }
} 