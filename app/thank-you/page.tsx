'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Heart, Download, CheckCircle, ArrowLeft, Sparkles, Star, Menu, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface DonationDetails {
    paymentId: string
    amount: number
    purpose: string
    name: string
    timestamp: string
}

export default function ThankYouPage() {
    const searchParams = useSearchParams()
    const [donationDetails, setDonationDetails] = useState<DonationDetails | null>(null)
    const [isDownloading, setIsDownloading] = useState(false)
    const [mobileNavOpen, setMobileNavOpen] = useState(false)

    useEffect(() => {
        const paymentId = searchParams.get('paymentId')
        const amount = searchParams.get('amount')
        const purpose = searchParams.get('purpose')
        const name = searchParams.get('name')

        if (paymentId && amount && purpose && name) {
            setDonationDetails({
                paymentId,
                amount: parseFloat(amount),
                purpose,
                name: decodeURIComponent(name),
                timestamp: new Date().toISOString(),
            })
        }
    }, [searchParams])

    // Prevent background scroll when mobile menu is open
    useEffect(() => {
        if (mobileNavOpen) {
            document.body.classList.add('overflow-hidden')
        } else {
            document.body.classList.remove('overflow-hidden')
        }
        return () => document.body.classList.remove('overflow-hidden')
    }, [mobileNavOpen])

    const handleDownloadReceipt = async () => {
        if (!donationDetails) return

        setIsDownloading(true)
        try {
            const response = await fetch('/api/download-receipt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(donationDetails),
            })

            if (response.ok) {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `donation-receipt-${donationDetails.paymentId}.pdf`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            } else {
                console.error('Failed to download receipt')
            }
        } catch (error) {
            console.error('Download error:', error)
        } finally {
            setIsDownloading(false)
        }
    }

    if (!donationDetails) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading donation details...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-slate-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Floating Sparkles */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-10 animate-bounce">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="absolute top-40 right-20 animate-bounce animation-delay-1000">
                    <Star className="w-3 h-3 text-blue-400" />
                </div>
                <div className="absolute bottom-40 left-20 animate-bounce animation-delay-2000">
                    <Sparkles className="w-4 h-4 text-indigo-300" />
                </div>
                <div className="absolute bottom-20 right-10 animate-bounce animation-delay-3000">
                    <Star className="w-3 h-3 text-blue-300" />
                </div>
            </div>

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50 w-full">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    {/* Desktop Navbar */}
                    <div className="hidden sm:flex flex-col sm:flex-row sm:justify-between sm:items-center py-6 w-full gap-4 sm:gap-0">
                        <div className="flex flex-col sm:flex-row sm:items-center animate-fade-in-up w-full text-center sm:text-left justify-center sm:justify-start">
                            <div className="relative flex-shrink-0 flex items-center justify-center h-16 w-20 mx-auto sm:mx-0 mr-0 sm:mr-4 mb-2 sm:mb-0">
                                <Image src="/logo.png" alt="A Ray of Hope Charitable Trust Logo" fill style={{ objectFit: 'contain' }} className="h-full w-full" priority />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h1 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                                    A Ray of Hope Charitable Trust
                                </h1>
                                <p className="text-sm text-gray-600 italic">"A child without education is like a bird without wings."</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 animate-fade-in-up animation-delay-300 w-full sm:w-auto">
                            <div className="whitespace-nowrap bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                                PAN: AAHTA8428R
                            </div>
                            <div className="whitespace-nowrap bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                                80G: AAHTA8428RF20211
                            </div>
                        </div>
                    </div>
                    {/* Mobile Navbar */}
                    <div className="flex sm:hidden justify-between items-center py-4 w-full">
                        <div className="flex items-center">
                            <div className="relative flex-shrink-0 flex items-center justify-center h-12 w-16">
                                <Image src="/logo.png" alt="A Ray of Hope Charitable Trust Logo" fill style={{ objectFit: 'contain' }} className="h-full w-full" priority />
                            </div>
                        </div>
                        {!mobileNavOpen && (
                            <button
                                aria-label="Open menu"
                                className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                onClick={() => setMobileNavOpen(true)}
                            >
                                <Menu className="w-7 h-7 text-indigo-700" />
                            </button>
                        )}
                    </div>
                    {/* Mobile Menu Overlay */}
                    {mobileNavOpen && (
                        <div className="fixed inset-0 w-full h-full z-50 bg-white">
                            <div className="p-6 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="relative flex-shrink-0 flex items-center justify-center h-12 w-16">
                                        <Image src="/logo.png" alt="A Ray of Hope Charitable Trust Logo" fill style={{ objectFit: 'contain' }} className="h-full w-full" priority />
                                    </div>
                                    <button
                                        aria-label="Close menu"
                                        className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        onClick={() => setMobileNavOpen(false)}
                                    >
                                        <X className="w-7 h-7 text-indigo-700" />
                                    </button>
                                </div>
                                <div className="mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-2">A Ray of Hope Charitable Trust</h2>
                                    <p className="text-sm text-gray-600 italic">"A child without education is like a bird without wings."</p>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <div className="whitespace-nowrap bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-medium">
                                        PAN: AAHTA8428R
                                    </div>
                                    <div className="whitespace-nowrap bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium">
                                        80G: AAHTA8428RF20211
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col justify-end">
                                    <Link
                                        href="/"
                                        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                        onClick={() => setMobileNavOpen(false)}
                                    >
                                        <ArrowLeft className="w-5 h-5 inline mr-2" />
                                        Back to Donation
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <main className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-12">
                {/* Success Message */}
                <div className="text-center mb-16 animate-fade-in-up max-w-6xl mx-auto">
                    <div className="mx-auto w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-2xl">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                        Thank You for Your Donation!
                    </h1>
                    <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                        Your generosity will make a real difference in our community. Together, we're building a brighter future for underprivileged children.
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                    {/* Donation Details Card */}
                    <div className="lg:col-span-2 bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-100 p-8 animate-fade-in-up animation-delay-200">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                            <Heart className="w-8 h-8 text-indigo-600 mr-4" />
                            Donation Details
                        </h2>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center py-6 border-b border-gray-100">
                                <span className="text-gray-600 font-semibold text-lg">Donor Name:</span>
                                <span className="font-bold text-gray-900 text-xl">{donationDetails.name}</span>
                            </div>

                            <div className="flex justify-between items-center py-6 border-b border-gray-100">
                                <span className="text-gray-600 font-semibold text-lg">Amount:</span>
                                <span className="font-bold text-3xl bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                                    ₹{donationDetails.amount.toLocaleString()}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-6 border-b border-gray-100">
                                <span className="text-gray-600 font-semibold text-lg">Purpose:</span>
                                <span className="font-bold text-gray-900 text-xl">{donationDetails.purpose}</span>
                            </div>

                            <div className="flex justify-between items-center py-6 border-b border-gray-100">
                                <span className="text-gray-600 font-semibold text-lg">Payment ID:</span>
                                <span className="font-mono text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-xl border">{donationDetails.paymentId}</span>
                            </div>

                            <div className="flex justify-between items-center py-6">
                                <span className="text-gray-600 font-semibold text-lg">Date:</span>
                                <span className="font-bold text-gray-900 text-xl">
                                    {new Date(donationDetails.timestamp).toLocaleDateString('en-IN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons Sidebar */}
                    <div className="lg:col-span-1 space-y-6 animate-fade-in-up animation-delay-400">
                        <button
                            onClick={handleDownloadReceipt}
                            disabled={isDownloading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-6 px-8 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isDownloading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-4"></div>
                                    Generating Receipt...
                                </div>
                            ) : (
                                <>
                                    <Download className="w-8 h-8 inline mr-4" />
                                    Download Receipt
                                </>
                            )}
                        </button>

                        <Link
                            href="/"
                            className="w-full bg-white text-indigo-600 py-6 px-8 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border-2 border-indigo-600 flex items-center justify-center"
                        >
                            <Heart className="w-8 h-8 mr-4" />
                            Make Another Donation
                        </Link>

                        {/* Quick Contact Card */}
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h3>
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                                    <span className="text-gray-700">Email confirmation sent</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                                    <span className="text-gray-700">Receipt available for download</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                                    <span className="text-gray-700">Tax benefits applicable</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Impact Message - Full Width */}
                <div className="w-full bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-100 p-12 mb-16 animate-fade-in-up animation-delay-600">
                    <h3 className="text-4xl font-bold text-gray-900 mb-8 text-center">
                        Your Impact
                    </h3>
                    <p className="text-2xl text-gray-600 mb-12 text-center max-w-4xl mx-auto">
                        With your donation of <span className="font-bold text-indigo-600">₹{donationDetails.amount.toLocaleString()}</span>, you're helping us:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                            <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-8 h-8 text-white" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-2">Quality Education</h4>
                            <p className="text-gray-600">Provide quality education to underprivileged children</p>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-8 h-8 text-white" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-2">Exam Preparation</h4>
                            <p className="text-gray-600">Support IIT-JEE, NEET, and UPSC preparation</p>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                            <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-8 h-8 text-white" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-2">Better Environment</h4>
                            <p className="text-gray-600">Create better learning environments</p>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-8 h-8 text-white" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-2">Wide Reach</h4>
                            <p className="text-gray-600">Empower students across Pune, Kerala, and Bihar</p>
                        </div>
                    </div>
                </div>

                {/* Trust Information - Full Width */}
                <div className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl shadow-2xl p-12 text-white animate-fade-in-up animation-delay-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="text-center">
                            <h4 className="text-2xl font-bold mb-4">Contact Us</h4>
                            <p className="text-lg mb-2">Phone: +91 9730255167</p>
                            <p className="text-lg">Email: info@arayofhope.org</p>
                        </div>
                        <div className="text-center">
                            <h4 className="text-2xl font-bold mb-4">Address</h4>
                            <p className="text-lg">
                                B4, Safa Complex, Sheikh Wasti,<br />
                                Lane 2, Wakad, Pune - 411057
                            </p>
                        </div>
                        <div className="text-center">
                            <h4 className="text-2xl font-bold mb-4">Legal Details</h4>
                            <p className="text-lg mb-2">PAN: AAHTA8428R</p>
                            <p className="text-lg">80G: AAHTA8428RF20211</p>
                        </div>
                    </div>
                </div>

                {/* Final Message */}
                <div className="text-center text-gray-600 animate-fade-in-up animation-delay-1000 mt-12">
                    <p className="text-xl mb-4">
                        A confirmation email has been sent to your registered email address.
                    </p>
                    <p className="text-lg">
                        Thank you for being part of our mission to educate and empower underprivileged children.
                    </p>
                </div>
            </main>
        </div>
    )
} 