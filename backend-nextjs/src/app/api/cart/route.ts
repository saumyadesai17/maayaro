import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: cart } = await supabase
      .from('carts')
      .select(`
        *,
        cart_items(
          *,
          product_variant:product_variants(
            *,
            product:products(
              *,
              images:product_images(*)
            )
          )
        )
      `)
      .eq('user_id', user.id)
      .single()

    if (!cart) {
      // Create cart if it doesn't exist
      const { data: newCart } = await supabase
        .from('carts')
        .insert({ user_id: user.id })
        .select()
        .single()

      return NextResponse.json({ ...newCart, cart_items: [] })
    }

    return NextResponse.json(cart)
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}