'use client';

import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ProductCard } from './ProductCard';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from './ui/sheet';
import { Input } from './ui/input';
import { Slider } from './ui/slider';

interface CollectionPageProps {
  title: string;
  description?: string;
  heroImage?: string;
  categoryType: 'women' | 'men' | 'traditional' | 'collection';
  onNavigate: (page: string, productId?: number) => void;
}

type SortOption = 'featured' | 'price-low' | 'price-high' | 'newest' | 'popular';

// API Product Interface
interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price: number | null;
  price_range: {
    min: number;
    max: number;
  };
  available_colors: string[];
  color_hexes: Record<string, string>;
  available_sizes: string[];
  in_stock: boolean;
  total_stock: number;
  image: string;
  images: Array<{
    image_url: string;
    alt_text: string;
    is_primary: boolean;
    sort_order: number;
  }>;
  category: {
    id: string;
    name: string;
    slug: string;
    parent_id: string;
  };
  material: string;
  is_featured: boolean;
}

export function CollectionPage({ 
  title, 
  description, 
  heroImage, 
  categoryType,
  onNavigate 
}: CollectionPageProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [minInputValue, setMinInputValue] = useState<string>('0');
  const [maxInputValue, setMaxInputValue] = useState<string>('50000');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  
  // API state
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [colors, setColors] = useState<Array<{ name: string; hex: string }>>([]);
  const [sizes, setSizes] = useState<string[]>([]);

  // Map category type to API slug
  const getCategorySlug = () => {
    if (categoryType === 'collection') return null;
    return categoryType; // 'women', 'men', 'traditional'
  };

  // Fetch available filters (categories, colors, sizes) - only when category changes
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const params = new URLSearchParams();
        const categorySlug = getCategorySlug();
        
        if (categorySlug) {
          params.append('category', categorySlug);
        }

        const response = await fetch(`/api/products?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch filters');
        }

        const data = await response.json();
        const apiProducts = data.products || [];

        // Extract unique subcategories from all products
        const uniqueCategories = Array.from(
          new Set(apiProducts.map((p: any) => p.category.name))
        ).sort() as string[];
        setCategories(uniqueCategories);

        // Extract unique colors from all products
        const colorMap: Record<string, string> = {};
        apiProducts.forEach((p: any) => {
          p.available_colors.forEach((color: string) => {
            if (p.color_hexes[color]) {
              colorMap[color] = p.color_hexes[color];
            }
          });
        });
        const uniqueColors = Object.keys(colorMap).map(name => ({
          name,
          hex: colorMap[name]
        })).sort((a, b) => a.name.localeCompare(b.name));
        setColors(uniqueColors);

        // Extract unique sizes from all products
        const allSizesSet = new Set<string>();
        apiProducts.forEach((p: any) => {
          p.available_sizes.forEach((size: string) => allSizesSet.add(size));
        });
        const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
        const numericSizes = Array.from(allSizesSet).filter(s => !isNaN(Number(s))).sort((a, b) => Number(a) - Number(b));
        const textSizes = Array.from(allSizesSet).filter(s => isNaN(Number(s))).sort((a, b) => {
          const aIndex = sizeOrder.indexOf(a);
          const bIndex = sizeOrder.indexOf(b);
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return a.localeCompare(b);
        });
        setSizes([...textSizes, ...numericSizes]);

      } catch (err) {
        console.error('Error fetching filters:', err);
      }
    };

    fetchFilters();
  }, [categoryType]); // Only refetch when category changes

  // Fetch filtered products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams();
        const categorySlug = getCategorySlug();
        
        if (categorySlug) {
          params.append('category', categorySlug);
        }
        
        params.append('sortBy', sortBy === 'featured' ? 'newest' : sortBy);
        
        if (selectedColors.length > 0) {
          params.append('colors', selectedColors.join(','));
        }
        
        if (selectedSizes.length > 0) {
          params.append('sizes', selectedSizes.join(','));
        }
        
        if (priceRange[0] > 0) {
          params.append('minPrice', priceRange[0].toString());
        }
        
        if (priceRange[1] < 50000) {
          params.append('maxPrice', priceRange[1].toString());
        }

        const response = await fetch(`/api/products?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        setProducts(data.products || []);

      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryType, sortBy, selectedColors, selectedSizes, priceRange]);

  // Client-side filtering for subcategories (since API doesn't support subcategory filtering yet)
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Apply subcategory filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category.name));
    }

    // Transform to match ProductCard interface
    return filtered.map(p => ({
      id: p.id, // Keep full UUID for wishlist functionality
      slug: p.slug,
      name: p.name,
      price: p.price,
      original_price: p.original_price,
      sku: p.slug,
      image: p.image,
      hoverImage: p.images[1]?.image_url || p.image,
      colors: p.available_colors.length,
      category: p.category.name,
    }));
  }, [products, selectedCategories]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setPriceRange([0, 50000]);
  };

  const activeFiltersCount = selectedCategories.length + selectedColors.length + selectedSizes.length;

  return (
    <div className="pt-16 min-h-screen bg-white">
      {/* Hero Section */}
      {heroImage && (
        <div className="relative h-[40vh] md:h-[50vh] overflow-hidden bg-muted">
          <ImageWithFallback
            src={heroImage}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center px-6"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl mb-3 tracking-wide">{title}</h1>
              {description && (
                <p className="text-lg md:text-xl text-white/90">{description}</p>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Toolbar */}
        <div className="mb-8 pb-6 border-b border-border">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* Left Side - Filters & Product Count */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-6 flex-1 min-w-0">
              {/* Mobile Filter Button with Sheet */}
              <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
              <SheetTrigger asChild>
                <button className="lg:hidden flex items-center gap-2 text-sm hover:text-muted-foreground transition-colors">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="px-2 py-0.5 bg-foreground text-background text-xs rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[90vw] sm:w-[420px] overflow-y-auto p-0">
                <div className="sticky top-0 bg-background z-10 pt-6 pb-4 border-b border-border">
                  <SheetHeader className="p-0 px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <SheetTitle className="text-lg">Filters</SheetTitle>
                        {activeFiltersCount > 0 && (
                          <button
                            onClick={clearAllFilters}
                            className="text-sm text-muted-foreground hover:text-destructive underline underline-offset-2 transition-colors"
                          >
                            Clear All ({activeFiltersCount})
                          </button>
                        )}
                      </div>
                      <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                      </SheetClose>
                    </div>
                  </SheetHeader>
                </div>
                
                <div className="px-6 py-6 space-y-8">
                  {/* Active Filters */}
                  {activeFiltersCount > 0 && (
                    <div className="pb-6 border-b border-border">
                      <h3 className="text-sm font-semibold mb-3 tracking-wide">ACTIVE FILTERS</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedCategories.map(cat => (
                          <motion.span 
                            key={cat} 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="px-3 py-2 bg-foreground text-background text-xs flex items-center gap-2 rounded-sm"
                          >
                            {cat}
                            <button onClick={() => toggleCategory(cat)} className="hover:opacity-70">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </motion.span>
                        ))}
                        {selectedColors.map(color => (
                          <motion.span 
                            key={color} 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="px-3 py-2 bg-foreground text-background text-xs flex items-center gap-2 rounded-sm"
                          >
                            {color}
                            <button onClick={() => toggleColor(color)} className="hover:opacity-70">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </motion.span>
                        ))}
                        {selectedSizes.map(size => (
                          <motion.span 
                            key={size} 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="px-3 py-2 bg-foreground text-background text-xs flex items-center gap-2 rounded-sm"
                          >
                            {size}
                            <button onClick={() => toggleSize(size)} className="hover:opacity-70">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Categories */}
                  <div>
                    <h3 className="text-sm font-semibold mb-4 tracking-wide">CATEGORY</h3>
                    <div className="space-y-3.5">
                      {categories.map((category) => (
                        <label key={category} className="flex items-center gap-3 cursor-pointer group active:scale-95 transition-transform">
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(category)}
                              onChange={() => toggleCategory(category)}
                              className="w-5 h-5 border-2 border-border rounded appearance-none checked:bg-foreground checked:border-foreground cursor-pointer transition-all"
                            />
                            {selectedCategories.includes(category) && (
                              <svg className="w-3 h-3 absolute left-1 top-1 text-background pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm group-hover:text-muted-foreground transition-colors">
                            {category}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="pb-6 border-b border-border">
                    <h3 className="text-sm font-semibold mb-4 tracking-wide">COLOR</h3>
                    <div className="grid grid-cols-5 gap-3">
                      {colors.map((color) => (
                        <motion.button
                          key={color.name}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleColor(color.name)}
                          className={`w-full aspect-square rounded-md border-2 transition-all relative ${
                            selectedColors.includes(color.name)
                              ? 'border-foreground ring-2 ring-offset-2 ring-foreground'
                              : 'border-border hover:border-muted-foreground'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        >
                          {selectedColors.includes(color.name) && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <div className="w-2 h-2 bg-foreground rounded-full shadow-lg" />
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      {selectedColors.length > 0 ? selectedColors.join(', ') : 'Select colors'}
                    </p>
                  </div>

                  {/* Sizes */}
                  <div className="pb-6 border-b border-border">
                    <h3 className="text-sm font-semibold mb-4 tracking-wide">SIZE</h3>
                    <div className="grid grid-cols-3 gap-2.5">
                      {sizes.map((size) => (
                        <motion.button
                          key={size}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleSize(size)}
                          className={`py-4 text-sm font-medium border-2 transition-all rounded-sm ${
                            selectedSizes.includes(size)
                              ? 'border-foreground bg-foreground text-background'
                              : 'border-border hover:border-foreground'
                          }`}
                        >
                          {size}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="pb-8">
                    <h3 className="text-sm font-semibold mb-4 tracking-wide">PRICE RANGE</h3>
                    <div className="space-y-4">
                      {/* Dual Range Slider */}
                      <div className="px-2 py-2">
                        <Slider
                          min={0}
                          max={50000}
                          step={1000}
                          value={[priceRange[0], priceRange[1]]}
                          onValueChange={(value) => {
                            setPriceRange([value[0], value[1]]);
                            setMinInputValue(value[0].toString());
                            setMaxInputValue(value[1].toString());
                          }}
                          className="w-full"
                        />
                      </div>
                      
                      {/* Editable Price Inputs */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground mb-1.5 block">Min</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground z-10 pointer-events-none">₹</span>
                            <Input
                              type="number"
                              value={minInputValue}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMinInputValue(val);
                                
                                // Update slider if valid number
                                if (val !== '' && val !== '-') {
                                  const num = Number(val);
                                  if (!isNaN(num) && num >= 0 && num < priceRange[1] && num <= 50000) {
                                    setPriceRange([num, priceRange[1]]);
                                  }
                                }
                              }}
                              onBlur={() => {
                                const num = Number(minInputValue);
                                if (minInputValue === '' || isNaN(num) || num < 0 || num >= priceRange[1]) {
                                  setMinInputValue(priceRange[0].toString());
                                } else {
                                  setPriceRange([num, priceRange[1]]);
                                  setMinInputValue(num.toString());
                                }
                              }}
                              className="pl-7 bg-muted [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                        </div>
                        <div className="text-muted-foreground pt-6">—</div>
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground mb-1.5 block">Max</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground z-10 pointer-events-none">₹</span>
                            <Input
                              type="number"
                              value={maxInputValue}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMaxInputValue(val);
                                
                                // Update slider if valid number
                                if (val !== '' && val !== '-') {
                                  const num = Number(val);
                                  if (!isNaN(num) && num > priceRange[0] && num <= 50000) {
                                    setPriceRange([priceRange[0], num]);
                                  }
                                }
                              }}
                              onBlur={() => {
                                const num = Number(maxInputValue);
                                if (maxInputValue === '' || isNaN(num) || num <= priceRange[0] || num > 50000) {
                                  setMaxInputValue(priceRange[1].toString());
                                } else {
                                  setPriceRange([priceRange[0], num]);
                                  setMaxInputValue(num.toString());
                                }
                              }}
                              className="pl-7 bg-muted [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Apply Filters Button */}
                  <div className="sticky bottom-0 bg-background pt-4 pb-6 border-t border-border -mx-6 px-6">
                    <SheetClose asChild>
                      <button className="w-full py-4 bg-foreground text-background hover:bg-primary transition-all flex items-center justify-center gap-2 tracking-wide text-sm font-medium">
                        <span>VIEW {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'PRODUCT' : 'PRODUCTS'}</span>
                      </button>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="hidden lg:flex items-center gap-2 text-sm hover:text-muted-foreground transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 bg-foreground text-background text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
              {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'Product' : 'Products'}
            </span>
          </div>

          {/* Right Side - Sort Dropdown */}
          <div className="relative shrink-0">
            <button 
              onClick={() => {
                const dropdown = document.getElementById('sort-dropdown');
                if (dropdown) {
                  dropdown.classList.toggle('hidden');
                }
              }}
              className="flex items-center gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 border border-border hover:border-foreground transition-colors whitespace-nowrap"
            >
              <span>Sort: {sortBy === 'featured' ? 'Featured' : sortBy === 'price-low' ? 'Low to High' : sortBy === 'price-high' ? 'High to Low' : sortBy === 'newest' ? 'Newest' : 'Popular'}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <div 
              id="sort-dropdown"
              className="hidden absolute right-0 top-full mt-2 w-56 bg-background border border-border shadow-lg z-50"
            >
              {[
                { value: 'featured', label: 'Featured' },
                { value: 'newest', label: 'Newest' },
                { value: 'popular', label: 'Popular' },
                { value: 'price-low', label: 'Price: Low to High' },
                { value: 'price-high', label: 'Price: High to Low' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortBy(option.value as SortOption);
                    const dropdown = document.getElementById('sort-dropdown');
                    if (dropdown) {
                      dropdown.classList.add('hidden');
                    }
                  }}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-secondary transition-colors ${
                    sortBy === option.value ? 'bg-secondary' : ''
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-64 shrink-0 space-y-8 hidden lg:block"
              >
                {/* Active Filters */}
                {activeFiltersCount > 0 && (
                  <div className="pb-6 border-b border-border">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold tracking-wide">ACTIVE FILTERS</h3>
                      <button
                        onClick={clearAllFilters}
                        className="text-sm text-muted-foreground hover:text-destructive underline underline-offset-2 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCategories.map(cat => (
                        <motion.span 
                          key={cat} 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="px-3 py-2 bg-foreground text-background text-xs flex items-center gap-2 rounded-sm"
                        >
                          {cat}
                          <button onClick={() => toggleCategory(cat)} className="hover:opacity-70">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.span>
                      ))}
                      {selectedColors.map(color => (
                        <motion.span 
                          key={color} 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="px-3 py-2 bg-foreground text-background text-xs flex items-center gap-2 rounded-sm"
                        >
                          {color}
                          <button onClick={() => toggleColor(color)} className="hover:opacity-70">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.span>
                      ))}
                      {selectedSizes.map(size => (
                        <motion.span 
                          key={size} 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="px-3 py-2 bg-foreground text-background text-xs flex items-center gap-2 rounded-sm"
                        >
                          {size}
                          <button onClick={() => toggleSize(size)} className="hover:opacity-70">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categories */}
                <div>
                  <h3 className="text-sm font-semibold mb-4 tracking-wide">CATEGORY</h3>
                  <div className="space-y-3.5">
                    {categories.map((category) => (
                      <label key={category} className="flex items-center gap-3 cursor-pointer group active:scale-95 transition-transform">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category)}
                            onChange={() => toggleCategory(category)}
                            className="w-5 h-5 border-2 border-border rounded appearance-none checked:bg-foreground checked:border-foreground cursor-pointer transition-all"
                          />
                          {selectedCategories.includes(category) && (
                            <svg className="w-3 h-3 absolute left-1 top-1 text-background pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm group-hover:text-muted-foreground transition-colors">
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="pb-6 border-b border-border">
                  <h3 className="text-sm font-semibold mb-4 tracking-wide">COLOR</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {colors.map((color) => (
                      <motion.button
                        key={color.name}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleColor(color.name)}
                        className={`w-full aspect-square rounded-md border-2 transition-all relative ${
                          selectedColors.includes(color.name)
                            ? 'border-foreground ring-2 ring-offset-2 ring-foreground'
                            : 'border-border hover:border-muted-foreground'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {selectedColors.includes(color.name) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <div className="w-2 h-2 bg-foreground rounded-full shadow-lg" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    {selectedColors.length > 0 ? selectedColors.join(', ') : 'Select colors'}
                  </p>
                </div>

                {/* Sizes */}
                <div className="pb-6 border-b border-border">
                  <h3 className="text-sm font-semibold mb-4 tracking-wide">SIZE</h3>
                  <div className="grid grid-cols-3 gap-2.5">
                    {sizes.map((size) => (
                      <motion.button
                        key={size}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleSize(size)}
                        className={`py-4 text-sm font-medium border-2 transition-all rounded-sm ${
                          selectedSizes.includes(size)
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border hover:border-foreground'
                        }`}
                      >
                        {size}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="pb-8">
                  <h3 className="text-sm font-semibold mb-4 tracking-wide">PRICE RANGE</h3>
                  <div className="space-y-4">
                    {/* Dual Range Slider */}
                    <div className="px-2 py-2">
                      <Slider
                        min={0}
                        max={50000}
                        step={1000}
                        value={[priceRange[0], priceRange[1]]}
                        onValueChange={(value) => {
                          setPriceRange([value[0], value[1]]);
                          setMinInputValue(value[0].toString());
                          setMaxInputValue(value[1].toString());
                        }}
                        className="w-full"
                      />
                    </div>
                    
                    {/* Editable Price Inputs */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground mb-1.5 block">Min</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground z-10 pointer-events-none">₹</span>
                          <Input
                            type="number"
                            value={minInputValue}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => {
                              const val = e.target.value;
                              setMinInputValue(val);
                              
                              // Update slider if valid number
                              if (val !== '' && val !== '-') {
                                const num = Number(val);
                                if (!isNaN(num) && num >= 0 && num < priceRange[1] && num <= 50000) {
                                  setPriceRange([num, priceRange[1]]);
                                }
                              }
                            }}
                            onBlur={() => {
                              const num = Number(minInputValue);
                              if (minInputValue === '' || isNaN(num) || num < 0 || num >= priceRange[1]) {
                                setMinInputValue(priceRange[0].toString());
                              } else {
                                setPriceRange([num, priceRange[1]]);
                                setMinInputValue(num.toString());
                              }
                            }}
                            className="pl-7 bg-muted [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>
                      <div className="text-muted-foreground pt-6">—</div>
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground mb-1.5 block">Max</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground z-10 pointer-events-none">₹</span>
                          <Input
                            type="number"
                            value={maxInputValue}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => {
                              const val = e.target.value;
                              setMaxInputValue(val);
                              
                              // Update slider if valid number
                              if (val !== '' && val !== '-') {
                                const num = Number(val);
                                if (!isNaN(num) && num > priceRange[0] && num <= 50000) {
                                  setPriceRange([priceRange[0], num]);
                                }
                              }
                            }}
                            onBlur={() => {
                              const num = Number(maxInputValue);
                              if (maxInputValue === '' || isNaN(num) || num <= priceRange[0] || num > 50000) {
                                setMaxInputValue(priceRange[1].toString());
                              } else {
                                setPriceRange([priceRange[0], num]);
                                setMaxInputValue(num.toString());
                              }
                            }}
                            className="pl-7 bg-muted [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="flex-1">
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 md:gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredAndSortedProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProductCard
                      {...product}
                      onProductClick={(id) => onNavigate('product', id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredAndSortedProducts.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <p className="text-muted-foreground mb-4">No products found matching your filters.</p>
                <button
                  onClick={clearAllFilters}
                  className="text-sm underline hover:text-foreground"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
