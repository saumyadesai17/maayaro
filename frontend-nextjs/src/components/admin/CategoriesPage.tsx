'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, ChevronDown, X, FolderTree } from 'lucide-react';
import { mockData } from '../../data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';

export function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const categories = mockData.categories;

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const parentCategories = filteredCategories.filter(c => !c.parent_id);
  const getChildren = (parentId: string) => filteredCategories.filter(c => c.parent_id === parentId);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDialogOpen(false);
    setEditingCategory(null);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl mb-2">Categories</h1>
          <p className="text-muted-foreground">Organize your product catalog</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button 
              className="px-6 py-3 bg-foreground text-background hover:bg-primary transition-colors rounded-lg flex items-center justify-center gap-2"
              onClick={() => setEditingCategory(null)}
            >
              <Plus className="w-5 h-5" />
              <span>Add Category</span>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name *</Label>
                  <Input id="name" placeholder="e.g., Women" defaultValue={editingCategory?.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input id="slug" placeholder="e.g., women" defaultValue={editingCategory?.slug} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Category description..." rows={3} defaultValue={editingCategory?.description} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent">Parent Category</Label>
                <select id="parent" className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors">
                  <option value="">None (Top Level)</option>
                  {parentCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input id="image" type="url" placeholder="https://..." defaultValue={editingCategory?.image_url} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sort">Sort Order</Label>
                  <Input id="sort" type="number" defaultValue={editingCategory?.sort_order || 0} />
                </div>
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <Label htmlFor="active">Active</Label>
                  <Switch id="active" defaultChecked={editingCategory?.is_active ?? true} />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2.5 bg-foreground text-background hover:bg-primary transition-colors rounded-lg">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsDialogOpen(false)}
                  className="px-6 py-2.5 border border-border hover:bg-secondary transition-colors rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="bg-white border border-border rounded-lg p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Categories</p>
          <p className="text-2xl">{categories.length}</p>
        </div>
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Parent Categories</p>
          <p className="text-2xl">{parentCategories.length}</p>
        </div>
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Active Categories</p>
          <p className="text-2xl">{categories.filter(c => c.is_active).length}</p>
        </div>
      </div>

      {/* Categories Tree */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg flex items-center gap-2">
            <FolderTree className="w-5 h-5" />
            Category Hierarchy
          </h3>
        </div>
        <div className="divide-y divide-border">
          {parentCategories.map(parent => (
            <div key={parent.id}>
              {/* Parent Category */}
              <div className="p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {parent.image_url && (
                      <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                        <img src={parent.image_url} alt={parent.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <h4 className="mb-1">{parent.name}</h4>
                      <p className="text-sm text-muted-foreground">{parent.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {parent.is_active ? (
                      <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">Active</span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-gray-50 text-gray-700 rounded">Inactive</span>
                    )}
                    <button
                      onClick={() => {
                        setEditingCategory(parent);
                        setIsDialogOpen(true);
                      }}
                      className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Child Categories */}
              {getChildren(parent.id).map(child => (
                <div key={child.id} className="p-4 pl-16 hover:bg-secondary/30 transition-colors border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {child.image_url && (
                        <div className="w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                          <img src={child.image_url} alt={child.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <h5 className="text-sm mb-1">{child.name}</h5>
                        <p className="text-xs text-muted-foreground">{child.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {child.is_active ? (
                        <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">Active</span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-gray-50 text-gray-700 rounded">Inactive</span>
                      )}
                      <button
                        onClick={() => {
                          setEditingCategory(child);
                          setIsDialogOpen(true);
                        }}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      >
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
          ))}
        </div>
      </div>
    </div>
  );
}
