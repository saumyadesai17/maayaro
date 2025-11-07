"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { ShoppingBag, Plus, Minus } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";

interface ProductColor {
  id: string;
  name: string;
  hex_code: string;
}

interface ProductSize {
  id: string;
  name: string;
  value: string;
  in_stock: boolean;
}

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: number;
    name: string;
    price: string | number;
    original_price?: number | null;
    image: string;
    brand?: string;
    sku?: string;
  };
}

export default function QuickAddModal({ open, onOpenChange, product }: QuickAddModalProps) {
  const { addToCart } = useStore();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [qty, setQty] = useState(1);

  // Mock data matching product detail page
  const productSizes: ProductSize[] = [
    { id: 'size-1', name: 'XS', value: '32', in_stock: true },
    { id: 'size-2', name: 'S', value: '34', in_stock: true },
    { id: 'size-3', name: 'M', value: '36', in_stock: true },
    { id: 'size-4', name: 'L', value: '38', in_stock: true },
    { id: 'size-5', name: 'XL', value: '40', in_stock: false },
    { id: 'size-6', name: 'XXL', value: '42', in_stock: true },
  ];

  const productColors: ProductColor[] = [
    { id: 'col-1', name: 'Ivory', hex_code: '#FFFFF0' },
    { id: 'col-2', name: 'Blush Pink', hex_code: '#FFB6C1' },
    { id: 'col-3', name: 'Sage Green', hex_code: '#9CAF88' },
    { id: 'col-4', name: 'Navy Blue', hex_code: '#000080' },
  ];

  const handleAdd = () => {
    if (!selectedSize || !selectedColor) {
      return; // optionally show validation
    }
    
    const numericPrice = typeof product.price === 'number' ? product.price : parseFloat(String(product.price).replace(/[^\d.]/g, ''));
    
    // Get the actual color and size names
    const color = productColors.find(c => c.id === selectedColor);
    const size = productSizes.find(s => s.id === selectedSize);
    
    // Add to cart multiple times based on quantity
    for (let i = 0; i < qty; i++) {
      addToCart({
        product_id: product.id,
        name: product.name,
        sku: product.sku || `MAAY-${product.id}`,
        price: numericPrice,
        image: product.image,
        color: color?.name || '',
        size: size?.name || '',
        available_sizes: productSizes.filter(s => s.in_stock).map(s => s.name),
        max_quantity: 10,
      }, size?.name || '');
    }
    
    onOpenChange(false);
  };

  const displayPrice = typeof product.price === 'string' ? product.price : `₹${product.price.toLocaleString('en-IN')}`;
  const hasDiscount = product.original_price && product.original_price > 0;
  const discount = hasDiscount && product.original_price ? Math.round(((product.original_price - (typeof product.price === 'number' ? product.price : parseFloat(String(product.price).replace(/[^\d.]/g, '')))) / product.original_price) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[95vw] sm:max-w-[600px] md:max-w-[750px] lg:max-w-[900px] max-h-[90vh] overflow-y-auto p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Quick Add</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-[45%_1fr] gap-6 lg:gap-8 pt-2">
          {/* Product Image */}
          <div className="w-full flex items-start">
            <div className="w-full aspect-3/4 bg-muted overflow-hidden relative">
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Info & Options */}
          <div className="space-y-5">
            {/* Brand & Title */}
            <div>
              {product.brand && (
                <div className="text-xs tracking-widest text-muted-foreground mb-2">{product.brand}</div>
              )}
              <h2 className="text-xl md:text-2xl leading-tight">{product.name}</h2>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 pb-5 border-b border-border">
              <span className="text-2xl font-medium">{displayPrice}</span>
              {hasDiscount && product.original_price && (
                <>
                  <span className="text-base text-muted-foreground line-through">
                    ₹{product.original_price.toLocaleString('en-IN')}
                  </span>
                  <span className="px-2 py-0.5 bg-destructive text-white text-xs">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Product Description */}
            <div className="text-sm text-muted-foreground leading-relaxed">
              <p>Premium quality fabric with excellent craftsmanship. Perfect for any occasion.</p>
            </div>

            {/* Color Selection */}
            <div>
              <div className="mb-3">
                <label className="text-sm font-medium tracking-wide">
                  COLOUR: <span className="text-muted-foreground font-normal">{productColors.find((c) => c.id === selectedColor)?.name || 'Select'}</span>
                </label>
              </div>
              <div className="flex gap-2">
                {productColors.map((color) => (
                  <motion.button
                    key={color.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedColor(color.id);
                    }}
                    className={`relative w-12 h-12 border-2 transition-all ${
                      selectedColor === color.id ? 'border-foreground' : 'border-border hover:border-muted-foreground'
                    }`}
                    style={{ backgroundColor: color.hex_code }}
                    aria-label={color.name}
                    aria-pressed={selectedColor === color.id}
                  >
                    {selectedColor === color.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-2.5 h-2.5 bg-foreground rounded-full" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <div className="mb-3">
                <label className="text-sm font-medium tracking-wide">SELECT SIZE</label>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {productSizes.map((size) => (
                  <motion.button
                    key={size.id}
                    whileHover={size.in_stock ? { scale: 1.05 } : {}}
                    whileTap={size.in_stock ? { scale: 0.95 } : {}}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (size.in_stock) setSelectedSize(size.id);
                    }}
                    disabled={!size.in_stock}
                    className={`py-3 text-sm border-2 transition-all relative ${
                      !size.in_stock
                        ? 'border-border text-muted-foreground cursor-not-allowed'
                        : selectedSize === size.id
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border hover:border-foreground'
                    }`}
                  >
                    {size.name}
                    {!size.in_stock && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-px bg-muted-foreground rotate-45" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-sm font-medium tracking-wide mb-3 block">QUANTITY</label>
              <div className="flex items-center border-2 border-border w-fit">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQty(Math.max(1, qty - 1));
                  }}
                  className="w-11 h-11 hover:bg-secondary transition-colors flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-14 text-center font-medium">{qty}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQty(qty + 1);
                  }}
                  className="w-11 h-11 hover:bg-secondary transition-colors flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAdd();
                }}
                disabled={!selectedSize || !selectedColor}
                className="w-full py-3.5 bg-foreground text-background hover:bg-primary transition-all flex items-center justify-center gap-2.5 tracking-wide text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>ADD TO BAG</span>
              </motion.button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
