'use client';

import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Heart, ShoppingBag, Truck, RefreshCw, Shield, ChevronDown, Star, Plus, Minus, X, Loader2, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCounts } from '@/contexts/CountsContext';

interface ProductDetailPageProps {
  productSlug: string;
  onNavigate: (page: string, productSlug?: string) => void;
}

interface ProductImage {
  url: string;
  alt: string;
  is_primary: boolean;
}

interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  color_hex: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
}

interface ProductReview {
  id: string;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
  user: {
    name: string;
    avatar?: string;
  };
}

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  material: string;
  care_instructions: string;
  is_featured: boolean;
  brand: string;
  category: {
    id: string;
    name: string;
    slug: string;
    parent: any;
  };
  price: number;
  original_price: number | null;
  price_range: {
    min: number;
    max: number;
  };
  images: ProductImage[];
  colors: Array<{
    name: string;
    hex: string;
    in_stock: boolean;
  }>;
  sizes: string[];
  variants_by_color: Record<string, {
    color: string;
    color_hex: string;
    sizes: Array<{
      id: string;
      sku: string;
      size: string;
      price: number;
      stock_quantity: number;
      in_stock: boolean;
    }>;
  }>;
  in_stock: boolean;
  total_stock: number;
  reviews: {
    average_rating: number;
    total_reviews: number;
    rating_distribution: Record<string, number>;
    reviews: ProductReview[];
  };
  created_at: string;
}

export function ProductDetailPage({ productSlug, onNavigate }: ProductDetailPageProps) {
  const { isInWishlist, refreshWishlist, refreshCounts } = useCounts();
  
  // State for UI
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('description');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  
  // State for API data
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showAddedToCart, setShowAddedToCart] = useState(false);

  const isWishlisted = product ? isInWishlist(product.id) : false;

  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productSlug) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/products/${productSlug}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        
        const productData = await response.json();
        setProduct(productData);
        
        // Set default selections
        if (productData.colors?.length > 0) {
          const defaultColor = productData.colors[0].name;
          setSelectedColor(defaultColor);
          
          // Find first available size for the default color
          const colorVariant = productData.variants_by_color[defaultColor];
          const availableSize = colorVariant?.sizes?.find((v: any) => v.stock_quantity > 0);
          if (availableSize) {
            setSelectedSize(availableSize.size);
          }
        }
        
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productSlug]);

  // Wishlist functions
  const handleAddToWishlist = async () => {
    if (!product || addingToWishlist) return;
    
    try {
      setAddingToWishlist(true);
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
        }),
      });

      if (response.ok) {
        await refreshWishlist();
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    } finally {
      setAddingToWishlist(false);
    }
  };

  const handleRemoveFromWishlist = async () => {
    if (!product || addingToWishlist) return;
    
    try {
      setAddingToWishlist(true);
      const response = await fetch(`/api/wishlist/${product.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await refreshWishlist();
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setAddingToWishlist(false);
    }
  };

  // Add to cart function
  const handleAddToCart = async () => {
    if (!product || !selectedColor || !selectedSize || addingToCart) return;
    
    try {
      setAddingToCart(true);
      
      // Find the selected variant
      const colorVariant = product.variants_by_color[selectedColor];
      const selectedVariant = colorVariant?.sizes?.find(v => v.size === selectedSize);
      
      if (!selectedVariant) {
        return;
      }
      
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_variant_id: selectedVariant.id,
          quantity: quantity,
        }),
      });

      if (response.ok) {
        // Show success modal and refresh cart count
        setShowAddedToCart(true);
        await refreshCounts();
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
          setShowAddedToCart(false);
        }, 3000);
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Product Not Found</h1>
          <p className="text-muted-foreground mb-4">{error || 'The product you are looking for does not exist.'}</p>
          <button 
            onClick={() => onNavigate('/')}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Use actual product images from API
  const images = product.images?.map(img => img.url) || [];
  
  // Fallback to a placeholder if no images
  const displayImages = images.length > 0 ? images : [
    'https://via.placeholder.com/1000x1000?text=No+Image'
  ];

  const relatedProducts = [
    {
      id: 11,
      slug: 'embroidered-anarkali-gown',
      name: 'Embroidered Anarkali Gown',
      price: 6999,
      image: 'https://images.unsplash.com/photo-1617623682246-f428d82afb05?w=600&q=85',
      colors: 5,
    },
    {
      id: 12,
      slug: 'silk-palazzo-set',
      name: 'Silk Palazzo Set',
      price: 5499,
      image: 'https://images.unsplash.com/photo-1583391733981-30b9d59e6f8a?w=600&q=85',
      colors: 4,
    },
    {
      id: 13,
      slug: 'cotton-kurta-set',
      name: 'Cotton Kurta Set',
      price: 3499,
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=85',
      colors: 6,
    },
    {
      id: 14,
      slug: 'designer-dupatta',
      name: 'Designer Dupatta',
      price: 2499,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=85',
      colors: 3,
    },
  ];

  // Calculate discount based on current variant price
  const getDiscountInfo = () => {
    const currentVariant = getCurrentVariant();
    const currentPrice = currentVariant?.price || product?.price || 0;
    const originalPrice = product?.original_price;
    
    if (!originalPrice || currentPrice >= originalPrice) {
      return { discount: 0, hasDiscount: false };
    }
    
    const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    return { discount, hasDiscount: discount > 0 };
  };

  // Get current variant SKU based on selected color and size
  const getCurrentVariantSku = () => {
    if (!product) return 'Loading...';
    if (!selectedColor || !selectedSize) return 'Select color & size';
    
    const colorVariant = product.variants_by_color[selectedColor];
    const selectedVariant = colorVariant?.sizes?.find((v: any) => v.size === selectedSize);
    
    return selectedVariant?.sku || 'Variant not found';
  };

  // Get current variant details
  const getCurrentVariant = () => {
    if (!product || !selectedColor || !selectedSize) return null;
    
    const colorVariant = product.variants_by_color[selectedColor];
    return colorVariant?.sizes?.find((v: any) => v.size === selectedSize) || null;
  };

  // Get available sizes for selected color with stock info
  const getAvailableSizes = () => {
    if (!product || !selectedColor) return [];
    
    const colorVariant = product.variants_by_color[selectedColor];
    const availableSizes = colorVariant?.sizes || [];
    
    // Create a map of all sizes with their availability
    return product.sizes?.map(size => {
      const sizeVariant = availableSizes.find((v: any) => v.size === size);
      return {
        name: size,
        available: sizeVariant ? sizeVariant.stock_quantity > 0 : false,
        stock_quantity: sizeVariant?.stock_quantity || 0
      };
    }) || [];
  };

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  return (
    <div className="pt-16 min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground overflow-x-auto scrollbar-hide">
            <button onClick={() => onNavigate('home')} className="hover:text-foreground transition-colors whitespace-nowrap shrink-0 font-normal">
              Home
            </button>
            <span className="shrink-0">/</span>
            <button onClick={() => onNavigate('women')} className="hover:text-foreground transition-colors whitespace-nowrap shrink-0 font-normal">
              {product.category.name}
            </button>
            <span className="shrink-0">/</span>
            <span className="text-foreground truncate font-normal">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div
              key={selectedImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="aspect-3/4 bg-muted overflow-hidden relative group"
            >
              <ImageWithFallback
                src={displayImages[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Wishlist Button - On Image */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  if (isWishlisted) {
                    handleRemoveFromWishlist();
                  } else {
                    handleAddToWishlist();
                  }
                }}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/70 border border-gray-200 backdrop-blur-sm hover:bg-white flex items-center justify-center transition-all shadow-sm z-10"
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isWishlisted ? 'fill-destructive text-destructive' : 'text-foreground'
                  }`}
                />
              </motion.button>
            </motion.div>

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-4 gap-4">
              {displayImages.map((img, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`aspect-3/4 bg-muted overflow-hidden border-2 transition-all ${
                    selectedImageIndex === idx ? 'border-foreground' : 'border-transparent hover:border-muted-foreground'
                  }`}
                >
                  <ImageWithFallback src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Brand & Title */}
            <div>
              <div className="text-xs tracking-widest text-muted-foreground mb-2">MAAAYARO</div>
              <h1 className="text-3xl md:text-4xl mb-3 leading-tight">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < 4 ? 'fill-foreground text-foreground' : 'fill-muted text-muted'}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(127 reviews)</span>
              </div>

              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 py-6 border-y border-border">
              <span className="text-3xl">₹{(getCurrentVariant()?.price || product.price).toLocaleString('en-IN')}</span>
              {getDiscountInfo().hasDiscount && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{product.original_price!.toLocaleString('en-IN')}
                  </span>
                  <span className="px-3 py-1 bg-destructive text-white text-sm">
                    {getDiscountInfo().discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Color Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm tracking-wide">
                  COLOUR: <span className="text-muted-foreground">{selectedColor}</span>
                </label>
              </div>
              <div className="flex gap-3">
                {product.colors?.map((colorObj) => (
                  <motion.button
                    key={colorObj.name}
                    whileHover={colorObj.in_stock ? { scale: 1.1 } : {}}
                    whileTap={colorObj.in_stock ? { scale: 0.95 } : {}}
                    onClick={() => {
                      if (colorObj.in_stock) {
                        const newColor = colorObj.name;
                        setSelectedColor(newColor);
                        
                        // Reset size if current size is not available in new color
                        if (selectedSize) {
                          const colorVariant = product.variants_by_color[newColor];
                          const sizeAvailable = colorVariant?.sizes?.some((v: any) => v.size === selectedSize && v.stock_quantity > 0);
                          if (!sizeAvailable) {
                            setSelectedSize('');
                          }
                        }
                      }
                    }}
                    disabled={!colorObj.in_stock}
                    className={`relative w-14 h-14 border-2 transition-all ${
                      !colorObj.in_stock 
                        ? 'border-border opacity-50 cursor-not-allowed'
                        : selectedColor === colorObj.name 
                        ? 'border-foreground' 
                        : 'border-border hover:border-muted-foreground'
                    }`}
                    style={{ backgroundColor: colorObj.hex || '#6b7280' }}
                    aria-label={colorObj.name}
                  >
                    {selectedColor === colorObj.name && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-white drop-shadow-sm" strokeWidth={3} />
                      </motion.div>
                    )}
                    {!colorObj.in_stock && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-gray-400 transform rotate-45" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm tracking-wide">SELECT SIZE</label>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
                >
                  Size Guide
                </button>
              </div>
              {getAvailableSizes().length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No sizes available for selected color</p>
              ) : getAvailableSizes().every(size => !size.available) ? (
                <p className="text-sm text-muted-foreground py-4">All sizes are currently out of stock for this color</p>
              ) : (
                <div className="grid grid-cols-6 gap-2">
                  {getAvailableSizes().map((sizeInfo) => (
                  <motion.button
                    key={sizeInfo.name}
                    whileHover={sizeInfo.available ? { scale: 1.05 } : {}}
                    whileTap={sizeInfo.available ? { scale: 0.95 } : {}}
                    onClick={() => sizeInfo.available && setSelectedSize(sizeInfo.name)}
                    disabled={!sizeInfo.available}
                    className={`py-4 text-sm border-2 transition-all relative ${
                      !sizeInfo.available
                        ? 'border-border text-muted-foreground cursor-not-allowed opacity-50'
                        : selectedSize === sizeInfo.name
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border hover:border-foreground'
                    }`}
                  >
                    {sizeInfo.name}
                    {!sizeInfo.available && (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                        <line 
                          x1="0" 
                          y1="100%" 
                          x2="100%" 
                          y2="0" 
                          stroke="currentColor" 
                          strokeWidth="1"
                          className="text-muted-foreground"
                        />
                      </svg>
                    )}

                  </motion.button>
                ))}
                </div>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="text-sm tracking-wide mb-4 block">QUANTITY</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-border">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 hover:bg-secondary transition-colors flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-16 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(getCurrentVariant()?.stock_quantity || 999, quantity + 1))}
                    className="w-12 h-12 hover:bg-secondary transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {getCurrentVariant() ? (
                    getCurrentVariant()!.stock_quantity === 0
                      ? 'Out of stock'
                      : getCurrentVariant()!.stock_quantity <= 5
                      ? `Only ${getCurrentVariant()!.stock_quantity} left in stock`
                      : 'In stock'
                  ) : (
                    'Select size to see availability'
                  )}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (!selectedColor) {
                    return;
                  }
                  
                  if (!selectedSize) {
                    return;
                  }

                  const currentVariant = getCurrentVariant();
                  if (!currentVariant || currentVariant.stock_quantity < quantity) {
                    return;
                  }
                  
                  handleAddToCart();
                }}
                disabled={!selectedColor || !selectedSize || addingToCart}
                className="w-full py-4 bg-foreground text-background hover:bg-primary transition-all flex items-center justify-center gap-3 tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingToCart ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>ADDING...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>ADD TO BAG</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border text-center">
              <div>
                <Truck className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs">Free Shipping</p>
                <p className="text-xs text-muted-foreground">On orders above ₹5,000</p>
              </div>
              <div>
                <RefreshCw className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs">Easy Returns</p>
                <p className="text-xs text-muted-foreground">7 days return policy</p>
              </div>
              <div>
                <Shield className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs">Secure Checkout</p>
                <p className="text-xs text-muted-foreground">100% secure payments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Accordion Details */}
        <div className="mt-20 max-w-3xl border-t border-border">
          {[
            {
              id: 'description',
              title: 'Description',
              content: (
                <div className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Premium {product.material} fabric</li>
                    <li>Intricate hand embroidery work</li>
                    <li>Contemporary silhouette with traditional elements</li>
                    <li>Comfortable and breathable</li>
                    <li>Perfect for festive occasions</li>
                  </ul>
                </div>
              ),
            },
            {
              id: 'details',
              title: 'Product Details',
              content: (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">SKU</p>
                    <p className="font-mono">{getCurrentVariantSku()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Material</p>
                    <p>{product.material}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Fit</p>
                    <p>{product.description}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Category</p>
                    <p>{product.category.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Price</p>
                    <p>₹{(getCurrentVariant()?.price || product.price).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground mb-1">Care Instructions</p>
                    <p>{product.care_instructions}</p>
                  </div>
                </div>
              ),
            },
            {
              id: 'reviews',
              title: 'Reviews (127)',
              content: (
                <div className="space-y-6">
                  <div className="flex items-center gap-8 pb-6 border-b border-border">
                    <div className="text-center">
                      <div className="text-4xl mb-2">4.5</div>
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < 4 ? 'fill-foreground text-foreground' : 'fill-muted text-muted'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">127 reviews</p>
                    </div>
                    <button className="px-6 py-3 border-2 border-foreground hover:bg-foreground hover:text-background transition-all">
                      Write a Review
                    </button>
                  </div>

                  {[1, 2, 3].map((review) => (
                    <div key={review} className="space-y-2">
                      <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-foreground text-foreground" />
                        ))}
                      </div>
                      <p>Excellent quality and beautiful embroidery work! The fit is perfect.</p>
                      <p className="text-sm text-muted-foreground">Priya S. • Verified Purchase • 15 Jan 2025</p>
                    </div>
                  ))}
                </div>
              ),
            },
          ].map((section) => (
            <div key={section.id} className="border-b border-border">
              <button
                onClick={() => toggleAccordion(section.id)}
                className="w-full py-6 flex items-center justify-between text-left hover:text-muted-foreground transition-colors"
              >
                <span className="text-lg">{section.title}</span>
                <motion.div
                  animate={{ rotate: activeAccordion === section.id ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>
              <AnimatePresence>
                {activeAccordion === section.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-6">{section.content}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Related Products */}
        <div className="mt-20">
          <h2 className="text-2xl md:text-3xl mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className="cursor-pointer"
                onClick={() => onNavigate('product', item.slug)}
              >
                <div className="aspect-3/4 bg-muted mb-3 overflow-hidden">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-sm mb-1 line-clamp-2">{item.name}</h3>
                <p className="text-sm">₹{item.price.toLocaleString('en-IN')}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {showSizeGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
            onClick={() => setShowSizeGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white max-w-2xl w-full p-8 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl">Size Guide</h2>
                <button onClick={() => setShowSizeGuide(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <table className="w-full text-sm border border-border">
                <thead>
                  <tr className="bg-secondary">
                    <th className="border border-border p-3 text-left">Size</th>
                    <th className="border border-border p-3 text-left">Bust (inches)</th>
                    <th className="border border-border p-3 text-left">Waist (inches)</th>
                    <th className="border border-border p-3 text-left">Hips (inches)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { size: 'XS', bust: '32', waist: '26', hips: '34' },
                    { size: 'S', bust: '34', waist: '28', hips: '36' },
                    { size: 'M', bust: '36', waist: '30', hips: '38' },
                    { size: 'L', bust: '38', waist: '32', hips: '40' },
                    { size: 'XL', bust: '40', waist: '34', hips: '42' },
                    { size: 'XXL', bust: '42', waist: '36', hips: '44' },
                  ].map((row) => (
                    <tr key={row.size}>
                      <td className="border border-border p-3">{row.size}</td>
                      <td className="border border-border p-3">{row.bust}</td>
                      <td className="border border-border p-3">{row.waist}</td>
                      <td className="border border-border p-3">{row.hips}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Added to Cart Modal */}
      <AnimatePresence>
        {showAddedToCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddedToCart(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">Added to Bag!</h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                {product?.name} has been added to your shopping bag.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddedToCart(false)}
                  className="flex-1 px-4 py-3 border border-border rounded hover:bg-secondary transition-colors"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => {
                    setShowAddedToCart(false);
                    onNavigate('cart');
                  }}
                  className="flex-1 px-4 py-3 bg-foreground text-background rounded hover:bg-primary transition-colors"
                >
                  View Bag
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
