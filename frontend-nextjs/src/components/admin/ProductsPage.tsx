'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Filter, Edit, Trash2, Eye, EyeOff, MoreVertical, Package, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { mockData } from '../../data/mockData';

interface ProductsPageProps {
  onNavigate?: (page: string, id?: string) => void;
}

export function ProductsPage({ onNavigate }: ProductsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const products = mockData.products.map(product => {
    const category = mockData.categories.find(c => c.id === product.category_id);
    const variants = mockData.product_variants.filter(v => v.product_id === product.id);
    const primaryImage = mockData.product_images.find(img => img.product_id === product.id && img.is_primary);
    const totalStock = variants.reduce((sum, v) => sum + v.stock_quantity, 0);
    
    return {
      ...product,
      category_name: category?.name || 'Unknown',
      total_variants: variants.length,
      total_stock: totalStock,
      primary_image: primaryImage?.image_url,
    };
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && product.is_active) ||
                         (selectedStatus === 'inactive' && !product.is_active);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = mockData.categories.filter(c => c.parent_id !== null);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl mb-2">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <button className="px-6 py-3 bg-foreground text-background hover:bg-primary transition-colors rounded-lg flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors appearance-none bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {filteredProducts.length} of {products.length} products
      </div>

      {/* Products Table - Desktop */}
      <div className="hidden lg:block bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50 border-b border-border">
            <tr>
              <th className="text-left p-4 text-sm">Product</th>
              <th className="text-left p-4 text-sm">Category</th>
              <th className="text-left p-4 text-sm">Price</th>
              <th className="text-left p-4 text-sm">Stock</th>
              <th className="text-left p-4 text-sm">Variants</th>
              <th className="text-left p-4 text-sm">Status</th>
              <th className="text-left p-4 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-secondary/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                      {product.primary_image ? (
                        <ImageWithFallback
                          src={product.primary_image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-1 mb-1">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm">{product.category_name}</span>
                </td>
                <td className="p-4">
                  <span className="text-sm">₹{product.base_price.toLocaleString('en-IN')}</span>
                </td>
                <td className="p-4">
                  <span className={`text-sm px-2 py-1 rounded ${
                    product.total_stock === 0 
                      ? 'bg-red-50 text-red-700' 
                      : product.total_stock < 20 
                      ? 'bg-orange-50 text-orange-700' 
                      : 'bg-green-50 text-green-700'
                  }`}>
                    {product.total_stock}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-sm">{product.total_variants}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {product.is_active ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={`text-sm ${product.is_active ? 'text-green-700' : 'text-gray-500'}`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Products Grid - Mobile */}
      <div className="lg:hidden grid grid-cols-1 gap-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white border border-border rounded-lg p-4">
            <div className="flex gap-3 mb-3">
              <div className="w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                {product.primary_image ? (
                  <ImageWithFallback
                    src={product.primary_image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="line-clamp-2 mb-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{product.category_name}</p>
                <p className="text-lg">₹{product.base_price.toLocaleString('en-IN')}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-3 text-sm">
                <span className={`px-2 py-1 rounded ${
                  product.total_stock === 0 
                    ? 'bg-red-50 text-red-700' 
                    : product.total_stock < 20 
                    ? 'bg-orange-50 text-orange-700' 
                    : 'bg-green-50 text-green-700'
                }`}>
                  {product.total_stock} in stock
                </span>
                <span className={`flex items-center gap-1 ${product.is_active ? 'text-green-700' : 'text-gray-500'}`}>
                  {product.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {product.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="bg-white border border-border rounded-lg p-12 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg mb-2">No products found</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by adding your first product'}
          </p>
          <button className="px-6 py-3 bg-foreground text-background hover:bg-primary transition-colors rounded-lg">
            Add Product
          </button>
        </div>
      )}
    </div>
  );
}
