import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient()
    const { slug } = await params

    console.log('Fetching product details for slug:', slug)

    // Fetch product with all related data
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        description,
        base_price,
        is_featured,
        material,
        care_instructions,
        created_at,
        category:categories(
          id,
          name,
          slug,
          parent:categories(id, name, slug)
        ),
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
        reviews:reviews(
          id,
          rating,
          title,
          comment,
          is_verified_purchase,
          created_at,
          user:profiles(full_name, avatar_url)
        )
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !product) {
      console.error('Product not found:', error)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Sort images by sort_order
    const sortedImages = (product.images || []).sort((a: any, b: any) => a.sort_order - b.sort_order)

    // Process variants - group by color
    const activeVariants = product.variants.filter((v: any) => v.is_active)
    const variantsByColor = activeVariants.reduce((acc: any, variant: any) => {
      if (!acc[variant.color]) {
        acc[variant.color] = {
          color: variant.color,
          color_hex: variant.color_hex,
          sizes: []
        }
      }
      acc[variant.color].sizes.push({
        id: variant.id,
        sku: variant.sku,
        size: variant.size,
        price: variant.price || product.base_price,
        stock_quantity: variant.stock_quantity,
        in_stock: variant.stock_quantity > 0
      })
      return acc
    }, {})

    // Get all available colors and sizes
    const availableColors = Object.keys(variantsByColor).map(color => ({
      name: color,
      hex: variantsByColor[color].color_hex,
      in_stock: variantsByColor[color].sizes.some((s: any) => s.in_stock)
    }))

    const allSizes = [...new Set(activeVariants.map((v: any) => v.size))]
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '28', '30', '32', '34', '36', '38', '40', '42', 'Free Size']
    const availableSizes = allSizes.sort((a, b) => {
      const aIndex = sizeOrder.indexOf(a)
      const bIndex = sizeOrder.indexOf(b)
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
      if (aIndex !== -1) return -1
      if (bIndex !== -1) return 1
      return a.localeCompare(b)
    })

    // Calculate price range
    const prices = activeVariants
      .filter((v: any) => v.stock_quantity > 0)
      .map((v: any) => v.price || product.base_price)
    
    const priceRange = prices.length > 0
      ? { min: Math.min(...prices), max: Math.max(...prices) }
      : { min: product.base_price, max: product.base_price }

    // Process reviews - only approved ones
    const approvedReviews = (product.reviews || [])
      .filter((r: any) => r.is_approved !== false) // Show if is_approved is true or null
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Calculate review stats
    const totalReviews = approvedReviews.length
    const averageRating = totalReviews > 0
      ? (approvedReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews)
      : 0

    const ratingDistribution = {
      5: approvedReviews.filter((r: any) => r.rating === 5).length,
      4: approvedReviews.filter((r: any) => r.rating === 4).length,
      3: approvedReviews.filter((r: any) => r.rating === 3).length,
      2: approvedReviews.filter((r: any) => r.rating === 2).length,
      1: approvedReviews.filter((r: any) => r.rating === 1).length,
    }

    // Format response
    const categoryData = Array.isArray(product.category) ? product.category[0] : product.category
    
    const productDetail = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      material: product.material,
      care_instructions: product.care_instructions,
      is_featured: product.is_featured,
      
      category: {
        id: categoryData?.id,
        name: categoryData?.name,
        slug: categoryData?.slug,
        parent: categoryData?.parent?.[0] || null
      },

      price: priceRange.min,
      original_price: priceRange.max > priceRange.min ? priceRange.max : null,
      price_range: priceRange,

      images: sortedImages.map((img: any) => ({
        url: img.image_url,
        alt: img.alt_text || product.name,
        is_primary: img.is_primary
      })),

      colors: availableColors,
      sizes: availableSizes,
      variants_by_color: variantsByColor,

      in_stock: activeVariants.some((v: any) => v.stock_quantity > 0),
      total_stock: activeVariants.reduce((sum: number, v: any) => sum + v.stock_quantity, 0),

      reviews: {
        average_rating: parseFloat(averageRating.toFixed(1)),
        total_reviews: totalReviews,
        rating_distribution: ratingDistribution,
        reviews: approvedReviews.map((r: any) => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          is_verified_purchase: r.is_verified_purchase,
          created_at: r.created_at,
          user: {
            name: r.user?.full_name || 'Anonymous',
            avatar: r.user?.avatar_url
          }
        }))
      },

      created_at: product.created_at
    }

    return NextResponse.json(productDetail)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}