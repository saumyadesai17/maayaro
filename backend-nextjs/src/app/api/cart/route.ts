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
        cart_items!inner(
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
      .order('created_at', { foreignTable: 'cart_items', ascending: true })
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

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete all cart items first
    await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', (
        await supabase
          .from('carts')
          .select('id')
          .eq('user_id', user.id)
          .single()
      ).data?.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing cart:', error)
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    )
  }
}