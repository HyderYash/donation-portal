'use client'

import { useState, useEffect } from 'react'
import { Heart, Users, BookOpen, Leaf, Shield, Baby, AlertTriangle, Home, CheckCircle, XCircle, GraduationCap, Globe, Target, Award, Star, ArrowRight, Sparkles, Menu, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { DonationPurpose } from '@/types/donation'
import Image from 'next/image'
import { collectClientMetadata, getLocationData } from '@/lib/metadata'

const presetAmounts = [100, 500, 1000, 5000]

const donationPurposes: { value: DonationPurpose; label: string; icon: React.ReactNode }[] = [
    { value: 'Education', label: 'Education Support', icon: <BookOpen className="w-5 h-5" /> },
    { value: 'Health', label: 'Student Health & Nutrition', icon: <Heart className="w-5 h-5" /> },
    { value: 'Environment', label: 'Learning Environment', icon: <Leaf className="w-5 h-5" /> },
    { value: 'Women Empowerment', label: 'Girl Child Education', icon: <Users className="w-5 h-5" /> },
    { value: 'Child Welfare', label: 'Child Welfare Programs', icon: <Baby className="w-5 h-5" /> },
    { value: 'Disaster Relief', label: 'Emergency Support', icon: <AlertTriangle className="w-5 h-5" /> },
    { value: 'Rural Development', label: 'Rural Education', icon: <Home className="w-5 h-5" /> },
    { value: 'Other', label: 'General Donation', icon: <Shield className="w-5 h-5" /> },
]

// Function to format number with commas
const formatNumberWithCommas = (value: string): string => {
    // Remove all non-digit characters
    const numericValue = value.replace(/[^\d]/g, '')

    // If empty, return empty string
    if (!numericValue) return ''

    // Convert to number and format with commas
    const number = parseInt(numericValue, 10)
    return number.toLocaleString('en-IN')
}

// Function to parse formatted number back to numeric value
const parseFormattedNumber = (formattedValue: string): number => {
    return parseInt(formattedValue.replace(/[^\d]/g, ''), 10) || 0
}

// Function to validate Indian phone number
const validateIndianPhoneNumber = (phone: string): boolean => {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '')

    // Indian phone number patterns:
    // 1. Mobile numbers: 6, 7, 8, 9 followed by 9 digits (total 10 digits)
    // 2. With country code: +91 followed by 10 digits (total 13 characters)
    // 3. With country code: 91 followed by 10 digits (total 12 digits)

    // Check if it's a valid Indian mobile number
    const mobilePattern = /^[6-9]\d{9}$/

    // Check if it has country code +91
    const withCountryCode = /^\+91[6-9]\d{9}$/

    // Check if it has country code 91
    const withCountryCodeDigits = /^91[6-9]\d{9}$/

    return mobilePattern.test(digitsOnly) ||
        withCountryCode.test(phone) ||
        withCountryCodeDigits.test(digitsOnly)
}

// Function to format Indian phone number
const formatIndianPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '')

    // If it starts with 91 and has 12 digits, remove the country code
    if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
        return digitsOnly.slice(2)
    }

    // If it has 10 digits and starts with 6-9, format it
    if (digitsOnly.length === 10 && /^[6-9]/.test(digitsOnly)) {
        return digitsOnly
    }

    // If it has 10 digits but doesn't start with 6-9, return as is (will be validated)
    if (digitsOnly.length === 10) {
        return digitsOnly
    }

    return digitsOnly
}

// Validation functions
const validateName = (name: string): { isValid: boolean; message: string } => {
    if (!name.trim()) {
        return { isValid: false, message: 'Name is required' }
    }
    if (name.trim().length < 2) {
        return { isValid: false, message: 'Name must be at least 2 characters' }
    }
    if (name.trim().length > 50) {
        return { isValid: false, message: 'Name must be less than 50 characters' }
    }
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
        return { isValid: false, message: 'Name can only contain letters and spaces' }
    }
    return { isValid: true, message: 'Name is valid' }
}

const validateEmail = (email: string): { isValid: boolean; message: string } => {
    if (!email.trim()) {
        return { isValid: false, message: 'Email is required' }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
        return { isValid: false, message: 'Please enter a valid email address' }
    }
    return { isValid: true, message: 'Email is valid' }
}

const validatePhone = (phone: string): { isValid: boolean; message: string } => {
    if (!phone.trim()) {
        return { isValid: false, message: 'Phone number is required' }
    }
    if (!validateIndianPhoneNumber(phone)) {
        return { isValid: false, message: 'Please enter a valid Indian phone number' }
    }
    return { isValid: true, message: 'Phone number is valid' }
}

const validateAmount = (customAmount: string, presetAmount: string): { isValid: boolean; message: string } => {
    let amount = 0
    if (customAmount) {
        amount = parseFormattedNumber(customAmount)
    } else if (presetAmount) {
        amount = parseInt(presetAmount, 10)
    }

    if (!amount) {
        return { isValid: false, message: 'Please select or enter an amount' }
    }
    if (amount < 1) {
        return { isValid: false, message: 'Minimum amount is ₹1' }
    }
    if (amount > 1000000) {
        return { isValid: false, message: 'Maximum amount is ₹10,00,000' }
    }
    return { isValid: true, message: 'Amount is valid' }
}

interface ValidationState {
    name: { isValid: boolean; message: string; isTouched: boolean }
    email: { isValid: boolean; message: string; isTouched: boolean }
    phone: { isValid: boolean; message: string; isTouched: boolean }
    amount: { isValid: boolean; message: string; isTouched: boolean }
}

export default function DonationPage() {
    const [formData, setFormData] = useState({
        amount: '',
        customAmount: '',
        name: '',
        email: '',
        phone: '',
        purpose: 'Education' as DonationPurpose,
    })
    const [isLoading, setIsLoading] = useState(false)
    const [validation, setValidation] = useState<ValidationState>({
        name: { isValid: false, message: '', isTouched: false },
        email: { isValid: false, message: '', isTouched: false },
        phone: { isValid: false, message: '', isTouched: false },
        amount: { isValid: false, message: '', isTouched: false },
    })
    const [mobileNavOpen, setMobileNavOpen] = useState(false)

    // Prevent background scroll when mobile menu is open
    useEffect(() => {
        if (mobileNavOpen) {
            document.body.classList.add('overflow-hidden')
        } else {
            document.body.classList.remove('overflow-hidden')
        }
        return () => document.body.classList.remove('overflow-hidden')
    }, [mobileNavOpen])

    // Real-time validation effect
    useEffect(() => {
        const nameValidation = validateName(formData.name)
        const emailValidation = validateEmail(formData.email)
        const phoneValidation = validatePhone(formData.phone)
        const amountValidation = validateAmount(formData.customAmount, formData.amount)

        setValidation(prev => ({
            ...prev,
            name: { ...nameValidation, isTouched: prev.name.isTouched },
            email: { ...emailValidation, isTouched: prev.email.isTouched },
            phone: { ...phoneValidation, isTouched: prev.phone.isTouched },
            amount: { ...amountValidation, isTouched: prev.amount.isTouched },
        }))
    }, [formData.name, formData.email, formData.phone, formData.customAmount, formData.amount])

    const handleAmountSelect = (amount: number) => {
        setFormData(prev => ({ ...prev, amount: amount.toString(), customAmount: '' }))
        setValidation(prev => ({
            ...prev,
            amount: { ...prev.amount, isTouched: true }
        }))
    }

    const handleCustomAmountChange = (value: string) => {
        // Format the input with commas
        const formattedValue = formatNumberWithCommas(value)
        setFormData(prev => ({ ...prev, customAmount: formattedValue, amount: '' }))
        setValidation(prev => ({
            ...prev,
            amount: { ...prev.amount, isTouched: true }
        }))
    }

    const handleInputChange = (field: string, value: string) => {
        if (field === 'phone') {
            // Format phone number as user types
            const formattedPhone = formatIndianPhoneNumber(value)
            setFormData(prev => ({ ...prev, [field]: formattedPhone }))
        } else {
            setFormData(prev => ({ ...prev, [field]: value }))
        }

        // Mark field as touched for validation display
        setValidation(prev => ({
            ...prev,
            [field]: { ...prev[field as keyof ValidationState], isTouched: true }
        }))
    }

    const validateForm = () => {
        // Mark all fields as touched
        setValidation(prev => ({
            name: { ...prev.name, isTouched: true },
            email: { ...prev.email, isTouched: true },
            phone: { ...prev.phone, isTouched: true },
            amount: { ...prev.amount, isTouched: true },
        }))

        // Check if all validations pass
        const nameValidation = validateName(formData.name)
        const emailValidation = validateEmail(formData.email)
        const phoneValidation = validatePhone(formData.phone)
        const amountValidation = validateAmount(formData.customAmount, formData.amount)

        if (!nameValidation.isValid) {
            toast.error(nameValidation.message)
            return false
        }
        if (!emailValidation.isValid) {
            toast.error(emailValidation.message)
            return false
        }
        if (!phoneValidation.isValid) {
            toast.error(phoneValidation.message)
            return false
        }
        if (!amountValidation.isValid) {
            toast.error(amountValidation.message)
            return false
        }

        return true
    }

    const handleDonation = async () => {
        if (!validateForm()) return

        setIsLoading(true)

        // Get the actual amount value
        let amount = 0
        if (formData.customAmount) {
            amount = parseFormattedNumber(formData.customAmount)
        } else if (formData.amount) {
            amount = parseInt(formData.amount, 10)
        }

        try {
            // Collect client metadata
            const clientMetadata = collectClientMetadata()
            const locationData = await getLocationData()
            const metadata = { ...clientMetadata, ...locationData }

            // Simulate payment processing delay
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Generate a simulated payment ID
            const simulatedPaymentId = 'sim_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

            // Store donation data in Google Sheets
            try {
                const storeResponse = await fetch('/api/store-donation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        donationData: {
                            amount,
                            purpose: formData.purpose,
                            donor: {
                                name: formData.name.trim(),
                                email: formData.email.trim(),
                                phone: formData.phone.trim(),
                            },
                            paymentId: simulatedPaymentId,
                        },
                        metadata,
                    }),
                })

                if (storeResponse.ok) {
                    console.log('Donation data stored successfully in Google Sheets')
                } else {
                    console.error('Failed to store donation data in Google Sheets')
                }
            } catch (error) {
                console.error('Error storing donation data:', error)
                // Continue with the flow even if Google Sheets storage fails
            }

            // Show success message
            toast.success('Payment successful! Thank you for your donation!')

            // Redirect to thank you page with simulated payment data
            window.location.href = `/thank-you?paymentId=${simulatedPaymentId}&amount=${amount}&purpose=${formData.purpose}&name=${encodeURIComponent(formData.name.trim())}`
        } catch (error) {
            console.error('Donation error:', error)
            toast.error('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    // Helper function to render validation message
    const renderValidationMessage = (field: keyof ValidationState) => {
        const fieldValidation = validation[field]
        if (!fieldValidation.isTouched) return null

        return (
            <div className={`flex items-center mt-1 text-sm transition-all duration-300 ${fieldValidation.isValid ? 'text-green-600' : 'text-red-600'
                }`}>
                {fieldValidation.isValid ? (
                    <CheckCircle className="w-4 h-4 mr-1 animate-pulse" />
                ) : (
                    <XCircle className="w-4 h-4 mr-1 animate-pulse" />
                )}
                {fieldValidation.message}
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
                                    <h1 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                                        A Ray of Hope Charitable Trust
                                    </h1>
                                    <p className="text-xs text-gray-600 italic mt-1">"A child without education is like a bird without wings."</p>
                                </div>
                                <div className="flex flex-col gap-2 mt-2">
                                    <div className="whitespace-nowrap bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-medium shadow-md">
                                        PAN: AAHTA8428R
                                    </div>
                                    <div className="whitespace-nowrap bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium shadow-md">
                                        80G: AAHTA8428RF20211
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <main className="w-full px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                {/* Hero Section */}
                <div className="text-center mb-16 animate-fade-in-up">
                    <div className="inline-flex items-center mb-4 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium animate-fade-in-up animation-delay-200">
                        <Star className="w-4 h-4 mr-2" />
                        Trusted by 44+ Children
                    </div>
                    <h2 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent animate-fade-in-up animation-delay-400">
                        Give Wings to Dreams
                    </h2>
                    <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed animate-fade-in-up animation-delay-600">
                        Help underprivileged children overcome language and knowledge barriers to compete in India's toughest entrance exams like <span className="font-semibold text-indigo-600">IIT-JEE</span>, <span className="font-semibold text-indigo-600">NEET</span>, and <span className="font-semibold text-indigo-600">UPSC</span>.
                    </p>
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 inline-block shadow-lg border border-indigo-100 animate-fade-in-up animation-delay-800 hover:shadow-xl transition-all duration-300">
                        <p className="text-indigo-800 font-medium text-lg">
                            "Light a lamp of education, and darkness disappears forever."
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
                    {/* Donation Form */}
                    <div className="card backdrop-blur-sm bg-white/90 shadow-2xl border-0 animate-fade-in-up animation-delay-1000 hover:shadow-3xl transition-all duration-500">
                        <div className="flex items-center mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center mr-4">
                                <Heart className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900">Make a Donation</h3>
                        </div>

                        {/* Amount Selection */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-4">
                                Select Amount (₹)
                            </label>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {presetAmounts.map((amount, index) => (
                                    <button
                                        key={amount}
                                        type="button"
                                        onClick={() => handleAmountSelect(amount)}
                                        className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${formData.amount === amount.toString()
                                            ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 shadow-lg'
                                            : 'border-gray-200 hover:border-indigo-300 bg-white hover:bg-gray-50'
                                            }`}
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="text-lg font-bold">₹{amount.toLocaleString('en-IN')}</div>
                                        <div className="text-xs text-gray-500 mt-1">Quick Select</div>
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">₹</span>
                                <input
                                    type="text"
                                    placeholder="Enter custom amount (minimum ₹1)"
                                    value={formData.customAmount}
                                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                                    className={`input-field pl-12 py-4 text-lg rounded-xl transition-all duration-300 ${validation.amount.isTouched && !validation.amount.isValid
                                        ? 'border-red-500 focus:ring-red-500 shadow-lg'
                                        : validation.amount.isTouched && validation.amount.isValid
                                            ? 'border-emerald-500 focus:ring-emerald-500 shadow-lg'
                                            : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500'
                                        }`}
                                />
                            </div>
                            {renderValidationMessage('amount')}
                            <p className="text-xs text-gray-500 mt-2 flex items-center">
                                <Shield className="w-3 h-3 mr-1" />
                                Minimum donation amount: ₹1 | Maximum: ₹10,00,000
                            </p>
                        </div>

                        {/* Donor Information */}
                        <div className="space-y-6 mb-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className={`input-field py-4 rounded-xl transition-all duration-300 ${validation.name.isTouched && !validation.name.isValid
                                        ? 'border-red-500 focus:ring-red-500 shadow-lg'
                                        : validation.name.isTouched && validation.name.isValid
                                            ? 'border-emerald-500 focus:ring-emerald-500 shadow-lg'
                                            : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500'
                                        }`}
                                    placeholder="Enter your full name"
                                    required
                                />
                                {renderValidationMessage('name')}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className={`input-field py-4 rounded-xl transition-all duration-300 ${validation.email.isTouched && !validation.email.isValid
                                        ? 'border-red-500 focus:ring-red-500 shadow-lg'
                                        : validation.email.isTouched && validation.email.isValid
                                            ? 'border-emerald-500 focus:ring-emerald-500 shadow-lg'
                                            : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500'
                                        }`}
                                    placeholder="Enter your email address"
                                    required
                                />
                                {renderValidationMessage('email')}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className={`input-field py-4 rounded-xl transition-all duration-300 ${validation.phone.isTouched && !validation.phone.isValid
                                        ? 'border-red-500 focus:ring-red-500 shadow-lg'
                                        : validation.phone.isTouched && validation.phone.isValid
                                            ? 'border-emerald-500 focus:ring-emerald-500 shadow-lg'
                                            : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500'
                                        }`}
                                    placeholder="Enter your Indian phone number"
                                    required
                                />
                                {renderValidationMessage('phone')}
                                <p className="text-xs text-gray-500 mt-2 flex items-center">
                                    <Globe className="w-3 h-3 mr-1" />
                                    Enter 10-digit Indian mobile number (e.g., 9876543210)
                                </p>
                            </div>
                        </div>

                        {/* Donation Purpose */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Donation Purpose
                            </label>
                            <select
                                value={formData.purpose}
                                onChange={(e) => handleInputChange('purpose', e.target.value)}
                                className="input-field py-4 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-300"
                            >
                                {donationPurposes.map((purpose) => (
                                    <option key={purpose.value} value={purpose.value}>
                                        {purpose.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Donate Button */}
                        <button
                            onClick={handleDonation}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                                    Processing...
                                </div>
                            ) : (
                                <>
                                    <Heart className="w-6 h-6 mr-3" />
                                    Donate Now
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Information Panel */}
                    <div className="space-y-8">
                        {/* Impact Stats */}
                        <div className="card backdrop-blur-sm bg-white/90 shadow-2xl border-0 animate-fade-in-up animation-delay-1200 hover:shadow-3xl transition-all duration-500">
                            <div className="flex items-center mb-6">
                                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mr-4">
                                    <Target className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Our Impact</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                                    <div className="text-3xl font-bold text-indigo-600 mb-1">44</div>
                                    <div className="text-sm text-gray-600 font-medium">Children Supported</div>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                                    <div className="text-3xl font-bold text-blue-600 mb-1">3</div>
                                    <div className="text-sm text-gray-600 font-medium">States Covered</div>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                                    <div className="text-3xl font-bold text-emerald-600 mb-1">100%</div>
                                    <div className="text-sm text-gray-600 font-medium">Free Education</div>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                                    <div className="text-3xl font-bold text-slate-600 mb-1">10-18</div>
                                    <div className="text-sm text-gray-600 font-medium">Age Range</div>
                                </div>
                            </div>
                        </div>

                        {/* Mission & Vision */}
                        <div className="card backdrop-blur-sm bg-white/90 shadow-2xl border-0 animate-fade-in-up animation-delay-1400 hover:shadow-3xl transition-all duration-500">
                            <div className="flex items-center mb-6">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
                                    <GraduationCap className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Our Mission</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-all duration-300">
                                    <Target className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-gray-700">Bridge the gap between regional language education and English-centric competitive coaching</p>
                                </div>
                                <div className="flex items-start p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg hover:shadow-md transition-all duration-300">
                                    <GraduationCap className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-gray-700">Prepare students for IIT-JEE, NEET, and UPSC entrance exams</p>
                                </div>
                                <div className="flex items-start p-3 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg hover:shadow-md transition-all duration-300">
                                    <Globe className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-gray-700">Create a level playing field for underprivileged students</p>
                                </div>
                            </div>
                        </div>

                        {/* Locations */}
                        <div className="card backdrop-blur-sm bg-white/90 shadow-2xl border-0 animate-fade-in-up animation-delay-1600 hover:shadow-3xl transition-all duration-500">
                            <div className="flex items-center mb-6">
                                <div className="w-10 h-10 bg-gradient-to-r from-slate-500 to-slate-600 rounded-full flex items-center justify-center mr-4">
                                    <Home className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Our Branches</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center p-3 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg hover:shadow-md transition-all duration-300">
                                    <div className="w-3 h-3 bg-indigo-500 rounded-full mr-4 animate-pulse"></div>
                                    <span className="text-sm font-medium text-gray-700">Pune, Maharashtra</span>
                                </div>
                                <div className="flex items-center p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg hover:shadow-md transition-all duration-300">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full mr-4 animate-pulse"></div>
                                    <span className="text-sm font-medium text-gray-700">Kerala</span>
                                </div>
                                <div className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-all duration-300">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-4 animate-pulse"></div>
                                    <span className="text-sm font-medium text-gray-700">Bihar</span>
                                </div>
                            </div>
                        </div>

                        {/* Contact & Legal Info */}
                        <div className="card backdrop-blur-sm bg-gradient-to-r from-slate-50 to-slate-100 shadow-2xl border-0 animate-fade-in-up animation-delay-1800 hover:shadow-3xl transition-all duration-500">
                            <div className="flex items-start">
                                <Award className="w-8 h-8 text-slate-600 mr-4 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Legal Information</h3>
                                    <div className="text-slate-700 text-sm space-y-2">
                                        <p className="flex items-center"><strong className="mr-2">Registration:</strong> F - 56297</p>
                                        <p className="flex items-center"><strong className="mr-2">Contact:</strong> +91 9730255167</p>
                                        <p className="flex items-center"><strong className="mr-2">Address:</strong> B4, Safa Complex, Sheikh Wasti, Lane 2, Wakad, Pune - 411057</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Info */}
                        <div className="card backdrop-blur-sm bg-gradient-to-r from-emerald-50 to-emerald-100 shadow-2xl border-0 animate-fade-in-up animation-delay-2000 hover:shadow-3xl transition-all duration-500">
                            <div className="flex items-start">
                                <Shield className="w-8 h-8 text-emerald-600 mr-4 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold text-emerald-800 mb-2">Secure Donations</h3>
                                    <p className="text-emerald-700 text-sm">
                                        Your donation is processed securely through Razorpay.
                                        We never store your payment information.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Razorpay Script */}
            <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

            <style jsx>{`
                @keyframes blob {
                    0% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                .animation-delay-1000 {
                    animation-delay: 1s;
                }
                .animation-delay-3000 {
                    animation-delay: 3s;
                }
                .animation-delay-200 {
                    animation-delay: 0.2s;
                }
                .animation-delay-400 {
                    animation-delay: 0.4s;
                }
                .animation-delay-600 {
                    animation-delay: 0.6s;
                }
                .animation-delay-800 {
                    animation-delay: 0.8s;
                }
                .animation-delay-1000 {
                    animation-delay: 1s;
                }
                .animation-delay-1200 {
                    animation-delay: 1.2s;
                }
                .animation-delay-1400 {
                    animation-delay: 1.4s;
                }
                .animation-delay-1600 {
                    animation-delay: 1.6s;
                }
                .animation-delay-1800 {
                    animation-delay: 1.8s;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s ease-out forwards;
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .shadow-3xl {
                    box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
                }
            `}</style>
        </div>
    )
} 