export interface DonorInfo {
    name: string
    email: string
    phone?: string
}

export interface DonationData {
    amount: number
    purpose: DonationPurpose
    donor: DonorInfo
    paymentId?: string
    orderId?: string
    status: 'pending' | 'completed' | 'failed'
    timestamp: Date
    receiptUrl?: string
}

export type DonationPurpose =
    | 'Education'
    | 'Health'
    | 'Environment'
    | 'Women Empowerment'
    | 'Child Welfare'
    | 'Disaster Relief'
    | 'Rural Development'
    | 'Other'

export interface RazorpayOrder {
    id: string
    amount: number
    currency: string
    receipt: string
    status: string
}

export interface RazorpayPayment {
    id: string
    order_id: string
    amount: number
    currency: string
    status: string
    method: string
    email: string
    contact: string
    name: string
}

export interface EmailData {
    to: string
    subject: string
    html: string
    attachments?: Array<{
        filename: string
        content: string | Buffer
        contentType: string
    }>
} 