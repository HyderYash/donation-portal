export interface ClientMetadata {
    screenResolution: string
    timezone: string
    language: string
    platform: string
    browser: string
    deviceType: string
    country?: string
    city?: string
    latitude?: string
    longitude?: string
}

export function collectClientMetadata(): ClientMetadata {
    // Screen resolution
    const screenResolution = `${window.screen.width}x${window.screen.height}`

    // Timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    // Language
    const language = navigator.language || 'Unknown'

    // Platform
    const platform = navigator.platform || 'Unknown'

    // Browser detection
    const userAgent = navigator.userAgent
    let browser = 'Unknown'

    if (userAgent.includes('Chrome')) browser = 'Chrome'
    else if (userAgent.includes('Firefox')) browser = 'Firefox'
    else if (userAgent.includes('Safari')) browser = 'Safari'
    else if (userAgent.includes('Edge')) browser = 'Edge'
    else if (userAgent.includes('Opera')) browser = 'Opera'

    // Device type detection
    let deviceType = 'Desktop'
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        deviceType = 'Mobile'
    } else if (/iPad|Android/i.test(userAgent)) {
        deviceType = 'Tablet'
    }

    return {
        screenResolution,
        timezone,
        language,
        platform,
        browser,
        deviceType,
    }
}

export async function getLocationData(): Promise<{ country?: string; city?: string; latitude?: string; longitude?: string }> {
    try {
        // Try to get location from IP using a free service
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json()

        return {
            country: data.country_name || 'Unknown',
            city: data.city || 'Unknown',
            latitude: data.latitude?.toString() || 'Unknown',
            longitude: data.longitude?.toString() || 'Unknown',
        }
    } catch (error) {
        console.log('Could not fetch location data:', error)
        return {
            country: 'Unknown',
            city: 'Unknown',
            latitude: 'Unknown',
            longitude: 'Unknown',
        }
    }
} 