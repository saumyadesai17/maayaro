'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';

// Mock data for content pages
const mockPages = [
  {
    id: '1',
    title: 'About Us',
    slug: 'about-us',
    content: 'Learn about our story and mission...',
    meta_title: 'About Us - MAAYARO',
    meta_description: 'Discover the story behind MAAYARO',
    is_published: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content: 'Your privacy is important to us...',
    meta_title: 'Privacy Policy - MAAYARO',
    meta_description: 'Read our privacy policy',
    is_published: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '3',
    title: 'Terms of Service',
    slug: 'terms-of-service',
    content: 'By using our website, you agree to...',
    meta_title: 'Terms of Service - MAAYARO',
    meta_description: 'Read our terms of service',
    is_published: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '4',
    title: 'Shipping Policy',
    slug: 'shipping-policy',
    content: 'We offer shipping across India...',
    meta_title: 'Shipping Policy - MAAYARO',
    meta_description: 'Learn about our shipping policy',
    is_published: false,
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2025-01-20T00:00:00Z'
  }
];

export function ContentPagesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);

  const pages = mockPages;

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'published' && page.is_published) ||
                         (filterStatus === 'draft' && !page.is_published);
    return matchesSearch && matchesStatus;
  });

  const publishedPages = pages.filter(p => p.is_published).length;
  const draftPages = pages.filter(p => !p.is_published).length;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDialogOpen(false);
    setEditingPage(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl mb-2">Content Pages</h1>
          <p className="text-muted-foreground">Manage static pages like About, Privacy, etc.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button 
              className="px-6 py-3 bg-foreground text-background hover:bg-primary transition-colors rounded-lg flex items-center justify-center gap-2"
              onClick={() => setEditingPage(null)}
            >
              <Plus className="w-5 h-5" />
              <span>New Page</span>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPage ? 'Edit Page' : 'Create New Page'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Page Title *</Label>
                <Input id="title" placeholder="e.g., About Us" defaultValue={editingPage?.title} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input id="slug" placeholder="about-us" defaultValue={editingPage?.slug} required />
                <p className="text-xs text-muted-foreground">URL: /pages/{editingPage?.slug || 'slug'}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea 
                  id="content" 
                  placeholder="Write your page content..." 
                  rows={12} 
                  defaultValue={editingPage?.content} 
                  required 
                />
              </div>

              <div className="space-y-4 p-4 border border-border rounded-lg">
                <h4 className="text-sm">SEO Settings</h4>
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input id="meta_title" placeholder="SEO title..." defaultValue={editingPage?.meta_title} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea id="meta_description" placeholder="SEO description..." rows={2} defaultValue={editingPage?.meta_description} />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <Label htmlFor="published">Publish Status</Label>
                  <p className="text-sm text-muted-foreground">Make this page visible on the website</p>
                </div>
                <Switch id="published" defaultChecked={editingPage?.is_published ?? true} />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2.5 bg-foreground text-background hover:bg-primary transition-colors rounded-lg">
                  {editingPage ? 'Update Page' : 'Create Page'}
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

      {/* Filters */}
      <div className="bg-white border border-border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors appearance-none bg-white"
          >
            <option value="all">All Pages</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Pages</p>
          <p className="text-2xl">{pages.length}</p>
        </div>
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Published</p>
          <p className="text-2xl text-green-600">{publishedPages}</p>
        </div>
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Drafts</p>
          <p className="text-2xl text-orange-600">{draftPages}</p>
        </div>
      </div>

      {/* Pages Table - Desktop */}
      <div className="hidden lg:block bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50 border-b border-border">
            <tr>
              <th className="text-left p-4 text-sm">Title</th>
              <th className="text-left p-4 text-sm">Slug</th>
              <th className="text-left p-4 text-sm">Status</th>
              <th className="text-left p-4 text-sm">Last Updated</th>
              <th className="text-left p-4 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredPages.map((page) => (
              <tr key={page.id} className="hover:bg-secondary/30 transition-colors">
                <td className="p-4">
                  <p className="mb-1">{page.title}</p>
                </td>
                <td className="p-4">
                  <code className="text-sm text-muted-foreground">/{page.slug}</code>
                </td>
                <td className="p-4">
                  {page.is_published ? (
                    <span className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-full">Published</span>
                  ) : (
                    <span className="text-xs px-3 py-1 bg-gray-50 text-gray-700 rounded-full">Draft</span>
                  )}
                </td>
                <td className="p-4">
                  <span className="text-sm">{formatDate(page.updated_at)}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingPage(page);
                        setIsDialogOpen(true);
                      }}
                      className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
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

      {/* Pages Grid - Mobile */}
      <div className="lg:hidden grid grid-cols-1 gap-4">
        {filteredPages.map((page) => (
          <div key={page.id} className="bg-white border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="mb-1">{page.title}</h3>
                <code className="text-sm text-muted-foreground">/{page.slug}</code>
              </div>
              {page.is_published ? (
                <span className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-full">Published</span>
              ) : (
                <span className="text-xs px-3 py-1 bg-gray-50 text-gray-700 rounded-full">Draft</span>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Updated {formatDate(page.updated_at)}
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingPage(page);
                  setIsDialogOpen(true);
                }}
                className="flex-1 px-4 py-2 border border-border hover:bg-secondary rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button className="px-4 py-2 border border-border hover:bg-secondary rounded-lg transition-colors">
                <Eye className="w-4 h-4" />
              </button>
              <button className="px-4 py-2 border border-destructive/20 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPages.length === 0 && (
        <div className="bg-white border border-border rounded-lg p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg mb-2">No pages found</h3>
          <p className="text-muted-foreground mb-6">Create your first content page</p>
          <button 
            onClick={() => setIsDialogOpen(true)}
            className="px-6 py-3 bg-foreground text-background hover:bg-primary transition-colors rounded-lg inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Page
          </button>
        </div>
      )}
    </div>
  );
}
