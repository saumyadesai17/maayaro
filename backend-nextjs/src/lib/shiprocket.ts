interface ShiprocketToken {
  token: string
  expiresAt: number
}

let cachedToken: ShiprocketToken | null = null

export async function getShiprocketToken(): Promise<string> {
  // Check if credentials are configured
  if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
    console.error('Shiprocket credentials missing:', {
      hasEmail: !!process.env.SHIPROCKET_EMAIL,
      hasPassword: !!process.env.SHIPROCKET_PASSWORD,
    })
    throw new Error('Shiprocket credentials not configured in environment variables')
  }

  // Return cached token if still valid
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token
  }

  console.log('Authenticating with Shiprocket...', {
    email: process.env.SHIPROCKET_EMAIL,
  })

  const response = await fetch(
    'https://apiv2.shiprocket.in/v1/external/auth/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }),
    }
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('Shiprocket auth error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData,
      email: process.env.SHIPROCKET_EMAIL,
    })
    throw new Error(`Failed to authenticate with Shiprocket: ${response.status} - ${JSON.stringify(errorData)}`)
  }

  const data = await response.json()

  // Cache token for 10 days (Shiprocket tokens are valid for 10 days)
  cachedToken = {
    token: data.token,
    expiresAt: Date.now() + 10 * 24 * 60 * 60 * 1000,
  }

  return data.token
}

export async function shiprocketRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = await getShiprocketToken()

  const response = await fetch(
    `https://apiv2.shiprocket.in/v1/external${endpoint}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Shiprocket API error: ${error}`)
  }

  return response.json()
}