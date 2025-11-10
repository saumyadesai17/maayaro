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

    const { product_id, order_item_id, rating, title, comment } =
      await request.json()

    // Verify user purchased the product
    const { data: orderItem } = await supabase
      .from('order_items')
      .select('order:orders!inner(user_id)')
      .eq('id', order_item_id)
      .single()

    if (!orderItem || (orderItem.order as any)?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only review products you have purchased' },
        { status: 403 }
      )
    }

    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        product_id,
        user_id: user.id,
        order_item_id,
        rating,
        title,
        comment,
        is_verified_purchase: true,
        is_approved: false, // Requires admin approval
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        return NextResponse.json(
          { error: 'You have already reviewed this product' },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, review })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}