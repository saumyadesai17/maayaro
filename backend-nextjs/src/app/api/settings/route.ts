import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Fetch public settings
    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('key, value, type')
      .eq('is_public', true)

    if (error) {
      console.error('Settings fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      )
    }

    // Convert array to object for easier access
    const settingsObject: Record<string, any> = {}
    settings?.forEach((setting) => {
      let value: any = setting.value
      
      // Convert based on type
      if (setting.type === 'number') {
        value = parseFloat(setting.value)
      } else if (setting.type === 'boolean') {
        value = setting.value === 'true'
      }
      
      settingsObject[setting.key] = value
    })

    return NextResponse.json(settingsObject)
  } catch (error) {
    console.error('Settings API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
