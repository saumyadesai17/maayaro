'use client';

import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ProductCard } from './ProductCard';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useState, useMemo } from 'react';
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

export function CollectionPage({ 
  title, 
  description, 
  heroImage, 
  categoryType,
  onNavigate 
}: CollectionPageProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [minInputValue, setMinInputValue] = useState<string>('0');
  const [maxInputValue, setMaxInputValue] = useState<string>('50000');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // Category-specific data
  const getCategoryData = () => {
    switch (categoryType) {
      case 'women':
        return {
          categories: ['Kurta Sets', 'Sarees', 'Lehenga', 'Anarkali', 'Suits', 'Dupattas'],
          products: [
            {
              id: 1,
              name: 'Silk Blend Embroidered Kurta Set',
              price: 4999,
              original_price: 7999,
              sku: 'MAAY-WOM-KUR-001',
              image: 'https://images.unsplash.com/photo-1610030469956-f0c75c6eabd8?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1583391733981-30b9d59e6f8a?w=600&q=85',
              colors: 4,
              category: 'Kurta Sets',
            },
            {
              id: 3,
              name: 'Handwoven Banarasi Silk Saree',
              price: 15999,
              original_price: 22999,
              sku: 'MAAY-WOM-SAR-001',
              image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=85',
              colors: 6,
              category: 'Sarees',
            },
            {
              id: 5,
              name: 'Designer Bridal Lehenga Set',
              price: 24999,
              original_price: 34999,
              sku: 'MAAY-WOM-LEH-001',
              image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=600&q=85',
              colors: 3,
              category: 'Lehenga',
            },
            {
              id: 7,
              name: 'Embroidered Anarkali Gown',
              price: 6999,
              original_price: 9999,
              sku: 'MAAY-WOM-ANK-001',
              image: 'https://images.unsplash.com/photo-1617623682246-f428d82afb05?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1617623962025-b82c4ecb6962?w=600&q=85',
              colors: 5,
              category: 'Anarkali',
            },
            {
              id: 21,
              name: 'Cotton Printed Kurta Set',
              price: 2999,
              original_price: null,
              sku: 'MAAY-WOM-KUR-002',
              image: 'https://images.unsplash.com/photo-1583391733981-30b9d59e6f8a?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1610030469956-f0c75c6eabd8?w=600&q=85',
              colors: 6,
              category: 'Kurta Sets',
            },
            {
              id: 22,
              name: 'Designer Palazzo Suit',
              price: 5499,
              original_price: null,
              sku: 'MAAY-WOM-SUI-001',
              image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=85',
              colors: 4,
              category: 'Suits',
            },
            {
              id: 23,
              name: 'Silk Embroidered Dupatta',
              price: 2499,
              original_price: 3499,
              sku: 'MAAY-WOM-DUP-001',
              image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=600&q=85',
              colors: 8,
              category: 'Dupattas',
            },
            {
              id: 24,
              name: 'Premium Georgette Saree',
              price: 8999,
              original_price: null,
              sku: 'MAAY-WOM-SAR-002',
              image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=85',
              colors: 5,
              category: 'Sarees',
            },
          ],
        };
      case 'men':
        return {
          categories: ['Shirts', 'Kurtas', 'Blazers', 'Trousers', 'Sherwanis', 'Accessories'],
          products: [
            {
              id: 2,
              name: 'Premium Cotton Linen Blazer',
              price: 8999,
              original_price: null,
              sku: 'MAAY-MEN-BLZ-001',
              image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=85',
              colors: 3,
              category: 'Blazers',
            },
            {
              id: 4,
              name: 'Classic Oxford Dress Shirt',
              price: 3499,
              original_price: null,
              sku: 'MAAY-MEN-SHT-001',
              image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=85',
              colors: 5,
              category: 'Shirts',
            },
            {
              id: 6,
              name: 'Wool Blend Winter Overcoat',
              price: 12999,
              original_price: null,
              sku: 'MAAY-MEN-COT-001',
              image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1548126032-079fd5b10327?w=600&q=85',
              colors: 2,
              category: 'Blazers',
            },
            {
              id: 8,
              name: 'Tailored Formal Chinos',
              price: 2999,
              original_price: null,
              sku: 'MAAY-MEN-CHI-001',
              image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=85',
              colors: 6,
              category: 'Trousers',
            },
            {
              id: 31,
              name: 'Silk Blend Kurta Pajama',
              price: 5999,
              original_price: 7999,
              sku: 'MAAY-MEN-KUR-001',
              image: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=600&q=85',
              colors: 4,
              category: 'Kurtas',
            },
            {
              id: 32,
              name: 'Embroidered Wedding Sherwani',
              price: 18999,
              original_price: 24999,
              sku: 'MAAY-MEN-SHE-001',
              image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1622445272461-c6580cab8755?w=600&q=85',
              colors: 3,
              category: 'Sherwanis',
            },
            {
              id: 33,
              name: 'Linen Casual Shirt',
              price: 2499,
              original_price: null,
              sku: 'MAAY-MEN-SHT-002',
              image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=85',
              colors: 7,
              category: 'Shirts',
            },
            {
              id: 34,
              name: 'Slim Fit Dress Trousers',
              price: 3499,
              original_price: 4499,
              sku: 'MAAY-MEN-TRO-001',
              image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=85',
              colors: 4,
              category: 'Trousers',
            },
          ],
        };
      case 'traditional':
        return {
          categories: ['Festive', 'Wedding', 'Casual Ethnic', 'Accessories'],
          products: [
            {
              id: 41,
              name: 'Banarasi Silk Wedding Saree',
              price: 19999,
              original_price: 27999,
              sku: 'MAAY-TRA-SAR-001',
              image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=85',
              colors: 4,
              category: 'Wedding',
            },
            {
              id: 42,
              name: 'Royal Velvet Sherwani',
              price: 22999,
              original_price: null,
              sku: 'MAAY-TRA-SHE-001',
              image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1622445272461-c6580cab8755?w=600&q=85',
              colors: 3,
              category: 'Wedding',
            },
            {
              id: 43,
              name: 'Festive Embroidered Kurta',
              price: 4499,
              original_price: 5999,
              sku: 'MAAY-TRA-KUR-001',
              image: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=600&q=85',
              colors: 6,
              category: 'Festive',
            },
            {
              id: 44,
              name: 'Designer Bridal Lehenga',
              price: 35999,
              original_price: 49999,
              sku: 'MAAY-TRA-LEH-001',
              image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=600&q=85',
              colors: 5,
              category: 'Wedding',
            },
            {
              id: 45,
              name: 'Casual Cotton Kurta Set',
              price: 2999,
              original_price: null,
              sku: 'MAAY-TRA-KUR-002',
              image: 'https://images.unsplash.com/photo-1583391733981-30b9d59e6f8a?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1610030469956-f0c75c6eabd8?w=600&q=85',
              colors: 8,
              category: 'Casual Ethnic',
            },
            {
              id: 46,
              name: 'Silk Embroidered Stole',
              price: 1999,
              original_price: 2999,
              sku: 'MAAY-TRA-ACC-001',
              image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=85',
              colors: 10,
              category: 'Accessories',
            },
          ],
        };
      default:
        return {
          categories: ['New Arrivals', 'Best Sellers', 'Sale', 'Exclusive'],
          products: [
            {
              id: 1,
              name: 'Silk Blend Embroidered Kurta Set',
              price: 4999,
              original_price: 7999,
              sku: 'MAAY-WOM-KUR-001',
              image: 'https://images.unsplash.com/photo-1610030469956-f0c75c6eabd8?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1583391733981-30b9d59e6f8a?w=600&q=85',
              colors: 4,
              category: 'Sale',
            },
            {
              id: 2,
              name: 'Premium Cotton Linen Blazer',
              price: 8999,
              original_price: null,
              sku: 'MAAY-MEN-BLZ-001',
              image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=85',
              colors: 3,
              category: 'Best Sellers',
            },
            {
              id: 3,
              name: 'Handwoven Banarasi Silk Saree',
              price: 15999,
              original_price: 22999,
              sku: 'MAAY-WOM-SAR-001',
              image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=85',
              colors: 6,
              category: 'Exclusive',
            },
            {
              id: 5,
              name: 'Designer Bridal Lehenga Set',
              price: 24999,
              original_price: 34999,
              sku: 'MAAY-WOM-LEH-001',
              image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=600&q=85',
              colors: 3,
              category: 'New Arrivals',
            },
            {
              id: 6,
              name: 'Wool Blend Winter Overcoat',
              price: 12999,
              original_price: null,
              sku: 'MAAY-MEN-COT-001',
              image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1548126032-079fd5b10327?w=600&q=85',
              colors: 2,
              category: 'New Arrivals',
            },
            {
              id: 7,
              name: 'Embroidered Anarkali Gown',
              price: 6999,
              original_price: 9999,
              sku: 'MAAY-WOM-ANK-001',
              image: 'https://images.unsplash.com/photo-1617623682246-f428d82afb05?w=600&q=85',
              hoverImage: 'https://images.unsplash.com/photo-1617623962025-b82c4ecb6962?w=600&q=85',
              colors: 5,
              category: 'Sale',
            },
          ],
        };
    }
  };

  const { categories, products: allProducts } = getCategoryData();

  const colors = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Beige', hex: '#F5F5DC' },
    { name: 'Navy', hex: '#000080' },
    { name: 'Burgundy', hex: '#800020' },
    { name: 'Green', hex: '#2F4F4F' },
    { name: 'Pink', hex: '#FFB6C1' },
    { name: 'Blue', hex: '#4682B4' },
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }

    // Apply price filter
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
          return b.id - a.id;
        case 'popular':
          return (b.colors || 0) - (a.colors || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allProducts, selectedCategories, priceRange, sortBy]);

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
