import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Filters
    const categorySlug = searchParams.get('category') // e.g., 'women', 'men', 'traditional'
    const subcategory = searchParams.get('subcategory') // e.g., 'kurtis', 'sarees'
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const colors = searchParams.get('colors')?.split(',').filter(Boolean) || []
    const sizes = searchParams.get('sizes')?.split(',').filter(Boolean) || []
    const sortBy = searchParams.get('sortBy') || 'featured' // newest, price-low, price-high, popular

    // Base query - join with variants to enable color/size/price filtering
    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        description,
        base_price,
        is_featured,
        material,
        category:categories!inner(id, name, slug, parent_id),
        images:product_images(image_url, alt_text, is_primary, sort_order),
        variants:product_variants(
          id,
          sku,
          size,
          color,
          color_hex,
          price,
          stock_quantity,
          is_active
        )
      `, { count: 'exact' })
      .eq('is_active', true)

    // Filter by main category slug (e.g., 'women', 'men')
    if (categorySlug) {
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .is('parent_id', null) // Main category
        .single()
      
      if (category) {
        // Get all subcategory IDs under this main category
        const { data: subcategories } = await supabase
          .from('categories')
          .select('id')
          .eq('parent_id', category.id)
        
        const categoryIds = [category.id, ...(subcategories?.map(s => s.id) || [])]
        query = query.in('category_id', categoryIds)
      }
    }

    // Filter by subcategory (e.g., 'kurtis', 'sarees')
    if (subcategory) {
      const { data: subcat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', subcategory)
        .not('parent_id', 'is', null) // Subcategory only
        .single()
      
      if (subcat) {
        query = query.eq('category_id', subcat.id)
      }
    }

    // Search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Price range filter (check variant prices)
    if (minPrice) {
      query = query.gte('variants.price', parseFloat(minPrice))
    }
    if (maxPrice) {
      query = query.lte('variants.price', parseFloat(maxPrice))
    }

    // Color filter
    if (colors.length > 0) {
      query = query.in('variants.color', colors)
    }

    // Size filter
    if (sizes.length > 0) {
      query = query.in('variants.size', sizes)
    }

    // Execute query
    const { data: rawProducts, error } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Product query error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Deduplicate products (since we joined with variants, same product appears multiple times)
    const productsMap = new Map()
    
    rawProducts?.forEach((item: any) => {
      if (!productsMap.has(item.id)) {
        productsMap.set(item.id, {
          ...item,
          variants: item.variants || [],
          images: item.images || []
        })
      }
      // Note: With the fixed query, each product comes with all its variants already
      // No need to merge variants from multiple rows
    })

    let products = Array.from(productsMap.values())

    // Calculate price range and available colors/sizes for each product
    products = products.map(product => {
      const activeVariants = product.variants.filter((v: any) => v.is_active && v.stock_quantity > 0)
      const prices = activeVariants.map((v: any) => v.price || product.base_price)
      const availableColors = [...new Set(activeVariants.map((v: any) => v.color))]
      const availableSizes = [...new Set(activeVariants.map((v: any) => v.size))]
      const colorHexes = activeVariants.reduce((acc: any, v: any) => {
        if (v.color && v.color_hex) acc[v.color] = v.color_hex
        return acc
      }, {})

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        category: product.category,
        material: product.material,
        is_featured: product.is_featured,
        price: prices.length > 0 ? Math.min(...prices) : product.base_price,
        original_price: prices.length > 0 ? Math.max(...prices) : null,
        price_range: {
          min: prices.length > 0 ? Math.min(...prices) : product.base_price,
          max: prices.length > 0 ? Math.max(...prices) : product.base_price,
        },
        available_colors: availableColors,
        color_hexes: colorHexes,
        available_sizes: availableSizes,
        in_stock: activeVariants.length > 0,
        total_stock: activeVariants.reduce((sum: number, v: any) => sum + v.stock_quantity, 0),
        image: product.images.find((img: any) => img.is_primary)?.image_url || product.images[0]?.image_url,
        images: product.images.sort((a: any, b: any) => a.sort_order - b.sort_order),
      }
    })

    // Filter out products with no stock (after variant filtering)
    products = products.filter(p => p.in_stock)

    // Sorting
    switch (sortBy) {
      case 'price-low':
        products.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        products.sort((a, b) => b.price - a.price)
        break
      case 'popular':
        products.sort((a, b) => b.total_stock - a.total_stock)
        break
      case 'newest':
      default:
        // Already sorted by created_at DESC from query
        break
    }

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total: products.length, // After deduplication
        totalPages: Math.ceil(products.length / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}