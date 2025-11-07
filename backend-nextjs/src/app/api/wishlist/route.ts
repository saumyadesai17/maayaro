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

    const { data: wishlist, error } = await supabase
      .from('wishlists')
      .select(`
        *,
        product:products(
          *,
          images:product_images(
            id,
            image_url,
            alt_text,
            sort_order,
            is_primary
          ),
          variants:product_variants(
            id,
            sku,
            size,
            color,
            color_hex,
            price,
            stock_quantity,
            is_active
          ),
          category:categories(
            name,
            slug
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data for frontend
    const transformedWishlist = wishlist?.map(item => {
      const primaryImage = item.product.images?.find((img: any) => img.is_primary)
      const sortedImages = item.product.images?.sort((a: any, b: any) => a.sort_order - b.sort_order)
      
      return {
        id: item.id,
        product_id: item.product_id,
        name: item.product.name,
        slug: item.product.slug,
        description: item.product.description,
        price: item.product.base_price,
        sku: item.product.variants?.[0]?.sku || `MAAY-${item.product_id.substring(0, 8)}`,
        image: primaryImage?.image_url || sortedImages?.[0]?.image_url || '',
        hoverImage: sortedImages?.[1]?.image_url || sortedImages?.[0]?.image_url,
        colors: item.product.variants?.filter((v: any) => v.is_active).length || 0,
        variants: item.product.variants,
        category: item.product.category?.name,
        material: item.product.material,
        is_featured: item.product.is_featured,
        created_at: item.created_at,
      }
    })

    return NextResponse.json({ wishlist: transformedWishlist })
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { product_id } = await request.json()

    const { data, error } = await supabase
      .from('wishlists')
      .insert({
        user_id: user.id,
        product_id,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Product already in wishlist' },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return NextResponse.json(
      { error: 'Failed to add to wishlist' },
      { status: 500 }
    )
  }
}