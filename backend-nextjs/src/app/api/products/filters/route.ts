import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/products/filters
 * Returns available filter options for a category
 * Query params: category (optional) - category slug like 'women', 'men', 'traditional'
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const categorySlug = searchParams.get('category')

    console.log('Fetching filters for category:', categorySlug)

    // Get category ID if slug provided
    let categoryIds: string[] = []
    if (categorySlug) {
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .is('parent_id', null)
        .single()
      
      if (category) {
        // Get subcategories
        const { data: subcategories } = await supabase
          .from('categories')
          .select('id, name, slug')
          .eq('parent_id', category.id)
          .eq('is_active', true)
          .order('sort_order')
        
        categoryIds = [category.id, ...(subcategories?.map(s => s.id) || [])]
      }
    }

    // Build query for active products with variants
    let variantsQuery = supabase
      .from('product_variants')
      .select(`
        color,
        color_hex,
        size,
        price,
        product:products!inner(
          id,
          category_id,
          category:categories(id, name, slug, parent_id)
        )
      `)
      .eq('is_active', true)
      .eq('product.is_active', true)
      .gt('stock_quantity', 0)

    if (categoryIds.length > 0) {
      variantsQuery = variantsQuery.in('product.category_id', categoryIds)
    }

    const { data: variants, error } = await variantsQuery

    if (error) {
      console.error('Filter query error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Extract unique values
    const colorsMap = new Map<string, string>() // color name -> hex
    const sizesSet = new Set<string>()
    const subcategoriesMap = new Map<string, { id: string, name: string, slug: string }>()
    const prices: number[] = []

    variants?.forEach((variant: any) => {
      // Colors
      if (variant.color) {
        if (!colorsMap.has(variant.color)) {
          colorsMap.set(variant.color, variant.color_hex || '')
        }
      }

      // Sizes
      if (variant.size) {
        sizesSet.add(variant.size)
      }

      // Prices
      if (variant.price) {
        prices.push(variant.price)
      }

      // Subcategories (only if parent_id exists)
      if (variant.product?.category?.parent_id) {
        const cat = variant.product.category
        if (!subcategoriesMap.has(cat.slug)) {
          subcategoriesMap.set(cat.slug, {
            id: cat.id,
            name: cat.name,
            slug: cat.slug
          })
        }
      }
    })

    // Format colors array
    const colors = Array.from(colorsMap.entries()).map(([name, hex]) => ({
      name,
      hex: hex || null
    }))

    // Sort sizes in a logical order
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '28', '30', '32', '34', '36', '38', '40', '42', 'Free Size']
    const sizes = Array.from(sizesSet).sort((a, b) => {
      const aIndex = sizeOrder.indexOf(a)
      const bIndex = sizeOrder.indexOf(b)
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
      if (aIndex !== -1) return -1
      if (bIndex !== -1) return 1
      return a.localeCompare(b)
    })

    // Calculate price range
    const priceRange = prices.length > 0
      ? {
          min: Math.floor(Math.min(...prices) / 100) * 100, // Round down to nearest 100
          max: Math.ceil(Math.max(...prices) / 100) * 100,  // Round up to nearest 100
        }
      : { min: 0, max: 50000 }

    // Format subcategories
    const subcategories = Array.from(subcategoriesMap.values())

    return NextResponse.json({
      subcategories,
      colors,
      sizes,
      priceRange,
    })
  } catch (error) {
    console.error('Error fetching filters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch filters' },
      { status: 500 }
    )
  }
}
