'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2, GripVertical, HelpCircle } from 'lucide-react';
import { mockData } from '../../data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';

export function FAQsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<any>(null);

  const faqs = mockData.faqs;

  const categories = Array.from(new Set(faqs.map(faq => faq.category).filter(Boolean))) as string[];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => a.sort_order - b.sort_order);

  const activeFAQs = faqs.filter(f => f.is_active).length;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDialogOpen(false);
    setEditingFAQ(null);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl mb-2">FAQs</h1>
          <p className="text-muted-foreground">Manage frequently asked questions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button 
              className="px-6 py-3 bg-foreground text-background hover:bg-primary transition-colors rounded-lg flex items-center justify-center gap-2"
              onClick={() => setEditingFAQ(null)}
            >
              <Plus className="w-5 h-5" />
              <span>Add FAQ</span>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="question">Question *</Label>
                <Input id="question" placeholder="e.g., What is your return policy?" defaultValue={editingFAQ?.question} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer">Answer *</Label>
                <Textarea id="answer" placeholder="Provide a detailed answer..." rows={5} defaultValue={editingFAQ?.answer} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" placeholder="e.g., Shipping" defaultValue={editingFAQ?.category} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort">Sort Order</Label>
                  <Input id="sort" type="number" defaultValue={editingFAQ?.sort_order || 0} />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <Label htmlFor="active">Active Status</Label>
                  <p className="text-sm text-muted-foreground">Show this FAQ on the website</p>
                </div>
                <Switch id="active" defaultChecked={editingFAQ?.is_active ?? true} />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2.5 bg-foreground text-background hover:bg-primary transition-colors rounded-lg">
                  {editingFAQ ? 'Update FAQ' : 'Create FAQ'}
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
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors appearance-none bg-white"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Total FAQs</p>
          <p className="text-2xl">{faqs.length}</p>
        </div>
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Active FAQs</p>
          <p className="text-2xl">{activeFAQs}</p>
        </div>
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Categories</p>
          <p className="text-2xl">{categories.length}</p>
        </div>
      </div>

      {/* FAQs List by Category */}
      <div className="space-y-6">
        {categories.map(category => {
          const categoryFAQs = filteredFAQs.filter(faq => faq.category === category);
          
          if (selectedCategory !== 'all' && selectedCategory !== category) return null;
          if (categoryFAQs.length === 0) return null;

          return (
            <div key={category} className="bg-white border border-border rounded-lg overflow-hidden">
              <div className="p-6 border-b border-border bg-secondary/30">
                <h3 className="text-lg">{category}</h3>
                <p className="text-sm text-muted-foreground">{categoryFAQs.length} questions</p>
              </div>
              <div className="divide-y divide-border">
                {categoryFAQs.map(faq => (
                  <div key={faq.id} className="p-6 hover:bg-secondary/30 transition-colors">
                    <div className="flex gap-4">
                      {/* Drag Handle */}
                      <div className="flex-shrink-0 cursor-move">
                        <GripVertical className="w-5 h-5 text-muted-foreground" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="mb-2 pr-4">{faq.question}</h4>
                            <p className="text-sm text-muted-foreground">{faq.answer}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!faq.is_active && (
                              <span className="text-xs px-2 py-1 bg-gray-50 text-gray-700 rounded">Inactive</span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingFAQ(faq);
                              setIsDialogOpen(true);
                            }}
                            className="px-3 py-1.5 border border-border hover:bg-secondary rounded-lg transition-colors flex items-center gap-2 text-sm"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button className="px-3 py-1.5 border border-destructive/20 text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex items-center gap-2 text-sm">
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Uncategorized FAQs */}
      {filteredFAQs.filter(faq => !faq.category).length > 0 && (
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <div className="p-6 border-b border-border bg-secondary/30">
            <h3 className="text-lg">Uncategorized</h3>
          </div>
          <div className="divide-y divide-border">
            {filteredFAQs.filter(faq => !faq.category).map(faq => (
              <div key={faq.id} className="p-6 hover:bg-secondary/30 transition-colors">
                <div className="flex gap-4">
                  <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0 cursor-move" />
                  <div className="flex-1 min-w-0">
                    <h4 className="mb-2">{faq.question}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{faq.answer}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingFAQ(faq);
                          setIsDialogOpen(true);
                        }}
                        className="px-3 py-1.5 border border-border hover:bg-secondary rounded-lg transition-colors flex items-center gap-2 text-sm"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button className="px-3 py-1.5 border border-destructive/20 text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex items-center gap-2 text-sm">
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredFAQs.length === 0 && (
        <div className="bg-white border border-border rounded-lg p-12 text-center">
          <HelpCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg mb-2">No FAQs found</h3>
          <p className="text-muted-foreground mb-6">Add frequently asked questions to help your customers</p>
          <button 
            onClick={() => setIsDialogOpen(true)}
            className="px-6 py-3 bg-foreground text-background hover:bg-primary transition-colors rounded-lg inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add FAQ
          </button>
        </div>
      )}
    </div>
  );
}
