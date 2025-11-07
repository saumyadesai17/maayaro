import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { cart_item_id, quantity } = await request.json()

    // Verify ownership and get variant info
    const { data: cartItem } = await supabase
      .from('cart_items')
      .select(`
        *,
        cart:carts(user_id),
        product_variant:product_variants(
          id,
          stock_quantity,
          product:products(name)
        )
      `)
      .eq('id', cart_item_id)
      .single()

    if (!cartItem || cartItem.cart.user_id !== user.id) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    // Check stock availability
    if (cartItem.product_variant.stock_quantity < quantity) {
      return NextResponse.json(
        { 
          error: `Insufficient stock for ${cartItem.product_variant.product.name}. Only ${cartItem.product_variant.stock_quantity} available.` 
        },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('id', cart_item_id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error updating cart:', error)
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    )
  }
}