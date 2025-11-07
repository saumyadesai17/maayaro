'use client';

import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ProductCard } from './ProductCard';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HomePageProps {
  onNavigate: (page: string, productId?: number) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=90',
      title: 'Winter Collection 2025',
      subtitle: 'Discover timeless elegance',
      cta: "Women's Collection",
      link: 'women',
    },
    {
      image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1920&q=90',
      title: 'Premium Menswear',
      subtitle: 'Refined essentials for the modern gentleman',
      cta: "Men's Collection",
      link: 'men',
    },
    {
      image: 'https://plus.unsplash.com/premium_photo-1673356302067-aac3b545a362?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687',
      title: 'Artisan Collection',
      subtitle: 'Handcrafted with precision',
      cta: 'Explore Collection',
      link: 'collection',
    },
  ];

  const categories = [
    {
      id: 1,
      name: 'Women',
      slug: 'women',
      description: 'Elegant & Contemporary',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=85',
    },
    {
      id: 2,
      name: 'Men',
      slug: 'men',
      description: 'Refined & Classic',
      image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800&q=85',
    },
    {
      id: 3,
      name: 'Accessories',
      slug: 'collection',
      description: 'Complete Your Look',
      image: 'https://images.unsplash.com/photo-1590874315260-4c2ce7d3f869?w=800&q=85',
    },
    {
      id: 4,
      name: 'Traditional',
      slug: 'traditional',
      description: 'Heritage Meets Modern',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=85',
    },
  ];

  const featuredProducts = [
    {
      id: 1,
      name: 'Silk Blend Kurta Set',
      price: 4999,
      original_price: 7999,
      sku: 'MAAY-WOM-KUR-001',
      image: 'https://images.unsplash.com/photo-1610030469956-f0c75c6eabd8?w=600&q=85',
      hoverImage: 'https://images.unsplash.com/photo-1583391733981-30b9d59e6f8a?w=600&q=85',
      brand: 'MAAYARO',
      colors: 4,
      is_featured: true,
    },
    {
      id: 2,
      name: 'Cotton Linen Blazer',
      price: 8999,
      original_price: null,
      sku: 'MAAY-MEN-BLZ-001',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=85',
      hoverImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=85',
      brand: 'MAAYARO',
      colors: 3,
      is_featured: true,
    },
    {
      id: 3,
      name: 'Handwoven Silk Saree',
      price: 15999,
      original_price: 22999,
      sku: 'MAAY-WOM-SAR-001',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=85',
      hoverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=85',
      brand: 'MAAYARO',
      colors: 6,
      is_featured: true,
    },
    {
      id: 4,
      name: 'Premium Oxford Shirt',
      price: 3499,
      original_price: null,
      sku: 'MAAY-MEN-SHT-001',
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=85',
      hoverImage: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=85',
      brand: 'MAAYARO',
      colors: 5,
      is_featured: true,
    },
    {
      id: 5,
      name: 'Designer Lehenga Set',
      price: 24999,
      original_price: 34999,
      sku: 'MAAY-WOM-LEH-001',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=85',
      hoverImage: 'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=600&q=85',
      brand: 'MAAYARO',
      colors: 3,
      is_featured: true,
    },
    {
      id: 6,
      name: 'Wool Blend Overcoat',
      price: 12999,
      original_price: null,
      sku: 'MAAY-MEN-COT-001',
      image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=85',
      hoverImage: 'https://images.unsplash.com/photo-1548126032-079fd5b10327?w=600&q=85',
      brand: 'MAAYARO',
      colors: 2,
      is_featured: true,
    },
    {
      id: 7,
      name: 'Embroidered Anarkali',
      price: 6999,
      original_price: 9999,
      sku: 'MAAY-WOM-ANK-001',
      image: 'https://images.unsplash.com/photo-1617623682246-f428d82afb05?w=600&q=85',
      hoverImage: 'https://images.unsplash.com/photo-1617623962025-b82c4ecb6962?w=600&q=85',
      brand: 'MAAYARO',
      colors: 5,
      is_featured: true,
    },
    {
      id: 8,
      name: 'Tailored Chinos',
      price: 2999,
      original_price: null,
      sku: 'MAAY-MEN-CHI-001',
      image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=85',
      hoverImage: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=85',
      brand: 'MAAYARO',
      colors: 6,
      is_featured: true,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div className="pt-16">
      {/* Hero Carousel */}
      <section className="relative h-[85vh] overflow-hidden bg-muted">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <ImageWithFallback
              src={heroSlides[currentSlide].image}
              alt={heroSlides[currentSlide].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />
            
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="max-w-xl"
                >
                  <h1 className="text-5xl md:text-6xl lg:text-7xl text-white mb-4 tracking-tight">
                    {heroSlides[currentSlide].title}
                  </h1>
                  <p className="text-lg md:text-xl text-white/90 mb-8">
                    {heroSlides[currentSlide].subtitle}
                  </p>
                  <button
                    onClick={() => onNavigate(heroSlides[currentSlide].link)}
                    className="group px-8 py-4 bg-white text-foreground inline-flex items-center gap-3 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  >
                    <span>{heroSlides[currentSlide].cta}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1 transition-all ${
                index === currentSlide ? 'w-8 bg-white' : 'w-6 bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl mb-3">Shop by Category</h2>
          <p className="text-muted-foreground text-lg">Curated collections for every occasion</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              onClick={() => onNavigate(category.slug)}
              className="group relative overflow-hidden aspect-[3/4] bg-muted"
            >
              <ImageWithFallback
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl mb-1">{category.name}</h3>
                <p className="text-sm text-white/80">{category.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-secondary">
        <div className="px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl md:text-4xl mb-2">Featured Collection</h2>
              <p className="text-muted-foreground">Handpicked pieces for discerning tastes</p>
            </div>
            <button
              onClick={() => onNavigate('collection')}
              className="hidden md:flex items-center gap-2 text-sm hover:gap-3 transition-all"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
              >
                <ProductCard
                  {...product}
                  price={`₹${product.price.toLocaleString('en-IN')}`}
                  category={product.original_price ? 'Sale' : undefined}
                  onProductClick={(id) => onNavigate('product', id)}
                />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12 md:hidden">
            <button
              onClick={() => onNavigate('collection')}
              className="inline-flex items-center gap-2 px-8 py-3 border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="relative h-[70vh] overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=90"
          alt="Craftsmanship"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative h-full flex items-center justify-center text-white text-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <h2 className="text-4xl md:text-5xl mb-4">Crafted with Precision</h2>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Every piece tells a story of artisanal excellence and timeless design
            </p>
            <button
              onClick={() => onNavigate('collection')}
              className="px-8 py-4 bg-white text-foreground hover:bg-primary hover:text-primary-foreground transition-all inline-flex items-center gap-3 group"
            >
              <span>Discover Our Craft</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-secondary mx-auto mb-6 flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl mb-3">Premium Quality</h3>
            <p className="text-muted-foreground">
              Meticulously sourced materials and exceptional craftsmanship in every piece
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-secondary mx-auto mb-6 flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl mb-3">Timeless Design</h3>
            <p className="text-muted-foreground">
              Classic aesthetics that transcend seasonal trends and stand the test of time
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-secondary mx-auto mb-6 flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-xl mb-3">Secure Payments</h3>
            <p className="text-muted-foreground">
              Shop with confidence using our encrypted and secure payment gateway
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
