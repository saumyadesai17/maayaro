import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient()

    const { slug } = await params

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*),
        reviews:reviews(
          *,
          user:profiles(full_name, avatar_url)
        )
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Calculate average rating
    const approvedReviews = product.reviews.filter((r: any) => r.is_approved)
    const averageRating =
      approvedReviews.length > 0
        ? approvedReviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
          approvedReviews.length
        : 0

    return NextResponse.json({
      ...product,
      averageRating: averageRating.toFixed(1),
      reviewCount: approvedReviews.length,
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}