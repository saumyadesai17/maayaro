'use client';

import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Heart, ShoppingBag, Truck, RefreshCw, Shield, ChevronDown, Star, Plus, Minus, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore } from '@/contexts/StoreContext';

interface ProductDetailPageProps {
  productId: number;
  onNavigate: (page: string, productId?: number) => void;
}

interface ProductColor {
  id: string;
  name: string;
  hex_code: string;
  image_url: string;
}

interface ProductSize {
  id: string;
  name: string;
  value: string;
  in_stock: boolean;
}

export function ProductDetailPage({ productId, onNavigate }: ProductDetailPageProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist, addToCart } = useStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('description');
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const isWishlisted = isInWishlist(productId);

  // Mock product data based on schema
  const product = {
    id: productId,
    name: 'Hand-Embroidered Silk Kurta Set',
    slug: 'hand-embroidered-silk-kurta-set',
    short_description: 'Exquisite silk kurta with intricate hand embroidery and traditional craftsmanship',
    description: 'Experience the perfect blend of traditional artistry and contemporary elegance with our Hand-Embroidered Silk Kurta Set. Each piece is meticulously crafted by skilled artisans using premium silk fabric and adorned with intricate hand embroidery work. The kurta features a contemporary silhouette while maintaining the essence of traditional Indian craftsmanship. Perfect for festive occasions, weddings, and special celebrations.',
    sku: 'MAAY-WOM-KUR-001',
    price: 4999,
    original_price: 7999,
    brand: {
      name: 'MAAYARO',
      slug: 'maayaro',
    },
    category: {
      name: 'Ethnic Wear',
      slug: 'ethnic-wear',
    },
    material: {
      name: 'Pure Silk',
      description: 'Premium quality pure silk fabric',
      care_instructions: 'Dry clean only. Store in a cool, dry place away from direct sunlight.',
    },
    fit_description: 'Regular fit with comfortable drape. Model is wearing size M and is 5\'7" tall.',
    care_instructions: 'Dry clean only. Do not bleach. Iron on low heat. Store in a muslin cloth bag.',
    is_featured: true,
    tags: ['ethnic', 'silk', 'embroidered', 'traditional', 'festive'],
    stock_quantity: 12,
  };

  const productColors: ProductColor[] = [
    {
      id: 'col-1',
      name: 'Ivory',
      hex_code: '#FFFFF0',
      image_url: 'https://images.unsplash.com/photo-1610030469956-f0c75c6eabd8?w=800&q=90',
    },
    {
      id: 'col-2',
      name: 'Blush Pink',
      hex_code: '#FFB6C1',
      image_url: 'https://images.unsplash.com/photo-1583391733981-30b9d59e6f8a?w=800&q=90',
    },
    {
      id: 'col-3',
      name: 'Sage Green',
      hex_code: '#9CAF88',
      image_url: 'https://images.unsplash.com/photo-1617623682246-f428d82afb05?w=800&q=90',
    },
    {
      id: 'col-4',
      name: 'Navy Blue',
      hex_code: '#000080',
      image_url: 'https://images.unsplash.com/photo-1617623962025-b82c4ecb6962?w=800&q=90',
    },
  ];

  const productSizes: ProductSize[] = [
    { id: 'size-1', name: 'XS', value: '32', in_stock: true },
    { id: 'size-2', name: 'S', value: '34', in_stock: true },
    { id: 'size-3', name: 'M', value: '36', in_stock: true },
    { id: 'size-4', name: 'L', value: '38', in_stock: true },
    { id: 'size-5', name: 'XL', value: '40', in_stock: false },
    { id: 'size-6', name: 'XXL', value: '42', in_stock: true },
  ];

  const images = [
    'https://images.unsplash.com/photo-1610030469956-f0c75c6eabd8?w=1000&q=90',
    'https://images.unsplash.com/photo-1583391733981-30b9d59e6f8a?w=1000&q=90',
    'https://images.unsplash.com/photo-1617623682246-f428d82afb05?w=1000&q=90',
    'https://images.unsplash.com/photo-1617623962025-b82c4ecb6962?w=1000&q=90',
  ];

  const relatedProducts = [
    {
      id: 11,
      name: 'Embroidered Anarkali Gown',
      price: 6999,
      image: 'https://images.unsplash.com/photo-1617623682246-f428d82afb05?w=600&q=85',
      colors: 5,
    },
    {
      id: 12,
      name: 'Silk Palazzo Set',
      price: 5499,
      image: 'https://images.unsplash.com/photo-1583391733981-30b9d59e6f8a?w=600&q=85',
      colors: 4,
    },
    {
      id: 13,
      name: 'Cotton Kurta Set',
      price: 3499,
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=85',
      colors: 6,
    },
    {
      id: 14,
      name: 'Designer Dupatta',
      price: 2499,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=85',
      colors: 3,
    },
  ];

  useState(() => {
    if (productColors.length > 0) {
      setSelectedColor(productColors[0].id);
    }
  });

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

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
                src={images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Wishlist Button - On Image */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  if (isWishlisted) {
                    removeFromWishlist(productId);
                  } else {
                    addToWishlist({
                      product_id: productId,
                      name: product.name,
                      sku: product.sku,
                      price: product.price,
                      original_price: product.original_price,
                      image: images[0],
                      hoverImage: images[1],
                      colors: productColors.length,
                    });
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
              {images.map((img, idx) => (
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
              <div className="text-xs tracking-widest text-muted-foreground mb-2">{product.brand.name}</div>
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

              <p className="text-muted-foreground leading-relaxed">{product.short_description}</p>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 py-6 border-y border-border">
              <span className="text-3xl">₹{product.price.toLocaleString('en-IN')}</span>
              {product.original_price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{product.original_price.toLocaleString('en-IN')}
                  </span>
                  <span className="px-3 py-1 bg-destructive text-white text-sm">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Color Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm tracking-wide">
                  COLOUR: <span className="text-muted-foreground">{productColors.find((c) => c.id === selectedColor)?.name}</span>
                </label>
              </div>
              <div className="flex gap-3">
                {productColors.map((color) => (
                  <motion.button
                    key={color.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedColor(color.id)}
                    className={`relative w-14 h-14 border-2 transition-all ${
                      selectedColor === color.id ? 'border-foreground' : 'border-border hover:border-muted-foreground'
                    }`}
                    style={{ backgroundColor: color.hex_code }}
                    aria-label={color.name}
                  >
                    {selectedColor === color.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-3 h-3 bg-foreground rounded-full" />
                      </motion.div>
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
              <div className="grid grid-cols-6 gap-2">
                {productSizes.map((size) => (
                  <motion.button
                    key={size.id}
                    whileHover={size.in_stock ? { scale: 1.05 } : {}}
                    whileTap={size.in_stock ? { scale: 0.95 } : {}}
                    onClick={() => size.in_stock && setSelectedSize(size.id)}
                    disabled={!size.in_stock}
                    className={`py-4 text-sm border-2 transition-all relative ${
                      !size.in_stock
                        ? 'border-border text-muted-foreground cursor-not-allowed'
                        : selectedSize === size.id
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border hover:border-foreground'
                    }`}
                  >
                    {size.name}
                    {!size.in_stock && (
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
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="w-12 h-12 hover:bg-secondary transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  Only {product.stock_quantity} items left in stock
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (!selectedSize) {
                    alert('Please select a size');
                    return;
                  }
                  if (!selectedColor) {
                    alert('Please select a color');
                    return;
                  }
                  
                  const color = productColors.find(c => c.id === selectedColor);
                  const size = productSizes.find(s => s.id === selectedSize);
                  
                  addToCart({
                    product_id: productId,
                    name: product.name,
                    sku: product.sku,
                    price: product.price,
                    image: images[selectedImageIndex],
                    color: color?.name || '',
                    size: size?.name || '',
                    max_quantity: product.stock_quantity,
                    available_sizes: productSizes.filter(s => s.in_stock).map(s => s.name),
                  }, size?.name || '');
                  
                  // Navigate to cart
                  onNavigate('cart');
                }}
                className="w-full py-4 bg-foreground text-background hover:bg-primary transition-all flex items-center justify-center gap-3 tracking-wide"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>ADD TO BAG</span>
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
                    <li>Premium {product.material.name} fabric</li>
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
                    <p className="font-mono">{product.sku}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Material</p>
                    <p>{product.material.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Fit</p>
                    <p>{product.fit_description}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Category</p>
                    <p>{product.category.name}</p>
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
                onClick={() => onNavigate('product', item.id)}
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
    </div>
  );
}
