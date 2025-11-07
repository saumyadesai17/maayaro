'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, FileText, TrendingUp } from 'lucide-react';
import { mockData } from '../../data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';

export function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);

  const posts = mockData.blog_posts;

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'published' && post.is_published) ||
      (filterStatus === 'draft' && !post.is_published);
    
    return matchesSearch && matchesFilter;
  });

  const publishedPosts = posts.filter(p => p.is_published).length;
  const draftPosts = posts.filter(p => !p.is_published).length;
  const totalViews = posts.reduce((sum, p) => sum + p.view_count, 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDialogOpen(false);
    setEditingPost(null);
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
          <h1 className="text-3xl mb-2">Blog Posts</h1>
          <p className="text-muted-foreground">Create and manage blog content</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button 
              className="px-6 py-3 bg-foreground text-background hover:bg-primary transition-colors rounded-lg flex items-center justify-center gap-2"
              onClick={() => setEditingPost(null)}
            >
              <Plus className="w-5 h-5" />
              <span>New Post</span>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" placeholder="Post title..." defaultValue={editingPost?.title} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input id="slug" placeholder="post-slug" defaultValue={editingPost?.slug} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea id="excerpt" placeholder="Brief description..." rows={2} defaultValue={editingPost?.excerpt} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea id="content" placeholder="Write your post content..." rows={10} defaultValue={editingPost?.content} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="featured_image">Featured Image URL</Label>
                <Input id="featured_image" type="url" placeholder="https://..." defaultValue={editingPost?.featured_image} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" placeholder="e.g., Fashion Tips" defaultValue={editingPost?.category} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input id="tags" placeholder="tag1, tag2, tag3" defaultValue={editingPost?.tags?.join(', ')} />
                </div>
              </div>

              <div className="space-y-4 p-4 border border-border rounded-lg">
                <h4 className="text-sm">SEO Settings</h4>
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input id="meta_title" placeholder="SEO title..." defaultValue={editingPost?.meta_title} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea id="meta_description" placeholder="SEO description..." rows={2} defaultValue={editingPost?.meta_description} />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <Label htmlFor="published">Publish Status</Label>
                  <p className="text-sm text-muted-foreground">Make this post visible on the website</p>
                </div>
                <Switch id="published" defaultChecked={editingPost?.is_published ?? false} />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2.5 bg-foreground text-background hover:bg-primary transition-colors rounded-lg">
                  {editingPost ? 'Update Post' : 'Create Post'}
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
              placeholder="Search posts..."
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
            <option value="all">All Posts</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Posts</p>
          <p className="text-2xl">{posts.length}</p>
        </div>
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Published</p>
          <p className="text-2xl text-green-600">{publishedPosts}</p>
        </div>
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Drafts</p>
          <p className="text-2xl text-orange-600">{draftPosts}</p>
        </div>
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Views</p>
          <p className="text-2xl">{totalViews.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map(post => (
          <div key={post.id} className="bg-white border border-border rounded-lg p-6 hover:shadow-sm transition-shadow">
            <div className="flex gap-4">
              {/* Thumbnail */}
              {post.featured_image && (
                <div className="w-32 h-24 bg-muted rounded overflow-hidden flex-shrink-0 hidden sm:block">
                  <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-1 line-clamp-1">{post.title}</h3>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{post.excerpt}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {post.is_published ? (
                      <span className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-full whitespace-nowrap">
                        Published
                      </span>
                    ) : (
                      <span className="text-xs px-3 py-1 bg-gray-50 text-gray-700 rounded-full whitespace-nowrap">
                        Draft
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                  {post.category && (
                    <>
                      <span className="px-2 py-0.5 bg-secondary rounded text-xs">{post.category}</span>
                      <span>•</span>
                    </>
                  )}
                  {post.published_at && (
                    <>
                      <span>{formatDate(post.published_at)}</span>
                      <span>•</span>
                    </>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {post.view_count} views
                  </span>
                  {post.tags && post.tags.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="truncate">{post.tags.slice(0, 2).join(', ')}</span>
                    </>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingPost(post);
                      setIsDialogOpen(true);
                    }}
                    className="px-4 py-2 border border-border hover:bg-secondary rounded-lg transition-colors flex items-center gap-2 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button className="px-4 py-2 border border-border hover:bg-secondary rounded-lg transition-colors text-sm">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="px-4 py-2 border border-destructive/20 text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-sm">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <div className="bg-white border border-border rounded-lg p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg mb-2">No blog posts found</h3>
          <p className="text-muted-foreground mb-6">Start creating engaging content for your readers</p>
          <button 
            onClick={() => setIsDialogOpen(true)}
            className="px-6 py-3 bg-foreground text-background hover:bg-primary transition-colors rounded-lg inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Post
          </button>
        </div>
      )}
    </div>
  );
}
