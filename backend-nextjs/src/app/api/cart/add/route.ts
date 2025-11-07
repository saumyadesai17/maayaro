import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { product_variant_id, quantity } = await request.json()

    // Check stock availability
    const { data: variant } = await supabase
      .from('product_variants')
      .select('stock_quantity')
      .eq('id', product_variant_id)
      .single()

    if (!variant || variant.stock_quantity < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      )
    }

    // Get or create cart
    let { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!cart) {
      const { data: newCart } = await supabase
        .from('carts')
        .insert({ user_id: user.id })
        .select('id')
        .single()
      cart = newCart
    }

    // Add or update cart item
    const { data: cartItem, error } = await supabase
      .from('cart_items')
      .upsert(
        {
          cart_id: cart!.id,
          product_variant_id,
          quantity,
        },
        {
          onConflict: 'cart_id,product_variant_id',
        }
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, cartItem })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    )
  }
}