import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import clientPromise from '@/lib/mongodb'

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { amount, purpose, donor } = body

        if (!amount || !purpose || !donor) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: amount, // Amount in paise
            currency: 'INR',
            receipt: `donation_${Date.now()}`,
            notes: {
                purpose,
                donor_name: donor.name,
                donor_email: donor.email,
            },
        })

        // Save donation record to MongoDB
        const client = await clientPromise
        const db = client.db('ngo_donations')

        await db.collection('donations').insertOne({
            orderId: order.id,
            amount: amount / 100, // Convert back to rupees
            purpose,
            donor,
            status: 'pending',
            timestamp: new Date(),
            createdAt: new Date(),
        })

        return NextResponse.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
        })
    } catch (error) {
        console.error('Create order error:', error)
        return NextResponse.json(
            { error: 'Failed to create order' },
            { status: 500 }
        )
    }
} 