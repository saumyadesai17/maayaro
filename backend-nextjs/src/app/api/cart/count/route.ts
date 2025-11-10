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

    // First get the user's cart
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!cart) {
      return NextResponse.json({ count: 0, items: [] })
    }

    // Get cart items with product details
    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product_variants(
          id,
          sku,
          products(
            name,
            slug
          )
        )
      `)
      .eq('cart_id', cart.id)

    if (error) {
      console.error('Error fetching cart count:', error)
      return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
    }

    return NextResponse.json({
      count: cartItems?.length || 0,
      items: cartItems || [],
      cartId: cart.id
    })
  } catch (error) {
    console.error('Cart count error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}