'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Image as ImageIcon, Monitor, Smartphone } from 'lucide-react';
import { mockData } from '../../data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';

export function BannersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);

  const banners = mockData.banners;

  const filteredBanners = banners.filter(banner =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeBanners = banners.filter(b => b.is_active);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDialogOpen(false);
    setEditingBanner(null);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl mb-2">Banners</h1>
          <p className="text-muted-foreground">Manage hero and promotional banners</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button 
              className="px-6 py-3 bg-foreground text-background hover:bg-primary transition-colors rounded-lg flex items-center justify-center gap-2"
              onClick={() => setEditingBanner(null)}
            >
              <Plus className="w-5 h-5" />
              <span>Add Banner</span>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Banner Title *</Label>
                <Input id="title" placeholder="e.g., Summer Collection 2025" defaultValue={editingBanner?.title} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Banner Type *</Label>
                  <select 
                    id="type" 
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors"
                    defaultValue={editingBanner?.type || 'hero'}
                  >
                    <option value="hero">Hero Banner</option>
                    <option value="promotional">Promotional</option>
                    <option value="category">Category Banner</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <select 
                    id="position" 
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors"
                    defaultValue={editingBanner?.position || 'home_main'}
                  >
                    <option value="home_main">Home - Main</option>
                    <option value="home_secondary">Home - Secondary</option>
                    <option value="category_top">Category - Top</option>
                    <option value="product_sidebar">Product - Sidebar</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desktop_image">Desktop Image URL *</Label>
                <Input id="desktop_image" type="url" placeholder="https://..." defaultValue={editingBanner?.image_url} required />
                <p className="text-xs text-muted-foreground">Recommended: 1920x600px</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile_image">Mobile Image URL</Label>
                <Input id="mobile_image" type="url" placeholder="https://..." defaultValue={editingBanner?.mobile_image_url} />
                <p className="text-xs text-muted-foreground">Recommended: 800x1000px (Optional, will use desktop if empty)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="link_url">Link URL</Label>
                  <Input id="link_url" placeholder="/collection" defaultValue={editingBanner?.link_url} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link_text">Button Text</Label>
                  <Input id="link_text" placeholder="Shop Now" defaultValue={editingBanner?.link_text} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input id="start_date" type="date" defaultValue={editingBanner?.start_date?.split('T')[0]} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input id="end_date" type="date" defaultValue={editingBanner?.end_date?.split('T')[0]} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort">Sort Order</Label>
                <Input id="sort" type="number" defaultValue={editingBanner?.sort_order || 0} />
                <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <Label htmlFor="active">Active Status</Label>
                  <p className="text-sm text-muted-foreground">Show this banner on the website</p>
                </div>
                <Switch id="active" defaultChecked={editingBanner?.is_active ?? true} />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2.5 bg-foreground text-background hover:bg-primary transition-colors rounded-lg">
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
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
            placeholder="Search banners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Banners</p>
          <p className="text-2xl">{banners.length}</p>
        </div>
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Active Banners</p>
          <p className="text-2xl">{activeBanners.length}</p>
        </div>
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Scheduled</p>
          <p className="text-2xl">
            {banners.filter(b => {
              const now = new Date();
              const start = b.start_date ? new Date(b.start_date) : null;
              const end = b.end_date ? new Date(b.end_date) : null;
              return start && start > now || (end && end < now);
            }).length}
          </p>
        </div>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBanners.map(banner => {
          const now = new Date();
          const isScheduled = banner.start_date && new Date(banner.start_date) > now;
          const isExpired = banner.end_date && new Date(banner.end_date) < now;

          return (
            <div key={banner.id} className="bg-white border border-border rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
              {/* Preview */}
              <div className="aspect-[16/6] bg-muted relative group">
                <img 
                  src={banner.image_url} 
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Monitor className="w-6 h-6 text-white" />
                  {banner.mobile_image_url && <Smartphone className="w-6 h-6 text-white" />}
                </div>
                {!banner.is_active && (
                  <div className="absolute top-3 right-3">
                    <span className="text-xs px-3 py-1.5 bg-gray-900/80 text-white rounded-full backdrop-blur">
                      Inactive
                    </span>
                  </div>
                )}
                {isScheduled && (
                  <div className="absolute top-3 right-3">
                    <span className="text-xs px-3 py-1.5 bg-blue-500/80 text-white rounded-full backdrop-blur">
                      Scheduled
                    </span>
                  </div>
                )}
                {isExpired && (
                  <div className="absolute top-3 right-3">
                    <span className="text-xs px-3 py-1.5 bg-red-500/80 text-white rounded-full backdrop-blur">
                      Expired
                    </span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-1 line-clamp-1">{banner.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="px-2 py-0.5 bg-secondary rounded text-xs">{banner.type}</span>
                      <span>•</span>
                      <span>{banner.position.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                </div>

                {banner.link_url && (
                  <div className="mb-3 text-sm">
                    <p className="text-muted-foreground mb-1">Link:</p>
                    <p className="truncate">{banner.link_url}</p>
                  </div>
                )}

                {(banner.start_date || banner.end_date) && (
                  <div className="mb-4 text-sm">
                    <p className="text-muted-foreground mb-1">Schedule:</p>
                    <p>
                      {banner.start_date && new Date(banner.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {banner.start_date && banner.end_date && ' - '}
                      {banner.end_date && new Date(banner.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-border">
                  <button
                    onClick={() => {
                      setEditingBanner(banner);
                      setIsDialogOpen(true);
                    }}
                    className="flex-1 px-4 py-2 border border-border hover:bg-secondary rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button className="flex-1 px-4 py-2 border border-destructive/20 text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredBanners.length === 0 && (
        <div className="bg-white border border-border rounded-lg p-12 text-center">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg mb-2">No banners found</h3>
          <p className="text-muted-foreground mb-6">Create your first banner to showcase on the website</p>
          <button 
            onClick={() => setIsDialogOpen(true)}
            className="px-6 py-3 bg-foreground text-background hover:bg-primary transition-colors rounded-lg inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Banner
          </button>
        </div>
      )}
    </div>
  );
}
