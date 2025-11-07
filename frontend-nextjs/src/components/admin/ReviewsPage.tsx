'use client';

import { useState } from 'react';
import { Search, Star, Check, X, Eye, ThumbsUp, MessageSquare } from 'lucide-react';
import { mockData } from '../../data/mockData';

export function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const reviews = mockData.reviews.map(review => {
    const product = mockData.products.find(p => p.id === review.product_id);
    const user = mockData.profiles.find(u => u.id === review.user_id);
    return { ...review, product_name: product?.name, user_name: user?.full_name };
  });

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'approved' && review.is_approved) ||
      (filterStatus === 'pending' && !review.is_approved);
    
    return matchesSearch && matchesFilter;
  });

  const totalReviews = reviews.length;
  const approvedReviews = reviews.filter(r => r.is_approved).length;
  const pendingReviews = reviews.filter(r => !r.is_approved).length;
  const verifiedPurchases = reviews.filter(r => r.is_verified_purchase).length;
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
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
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Reviews</h1>
        <p className="text-muted-foreground">Manage product reviews and ratings</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reviews..."
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
            <option value="all">All Reviews</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Approval</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Reviews</p>
          <p className="text-2xl">{totalReviews}</p>
        </div>
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Approved</p>
          <p className="text-2xl text-green-600">{approvedReviews}</p>
        </div>
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Pending</p>
          <p className="text-2xl text-orange-600">{pendingReviews}</p>
        </div>
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Verified</p>
          <p className="text-2xl">{verifiedPurchases}</p>
        </div>
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Avg. Rating</p>
          <p className="text-2xl">{avgRating.toFixed(1)}</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map(review => (
          <div key={review.id} className="bg-white border border-border rounded-lg p-6 hover:shadow-sm transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
              {/* Review Content */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating)}
                      {review.is_verified_purchase && (
                        <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    {review.title && <h4 className="mb-2">{review.title}</h4>}
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span>{review.user_name}</span>
                  <span>•</span>
                  <span>{formatDate(review.created_at)}</span>
                  <span>•</span>
                  <span className="truncate">{review.product_name}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex lg:flex-col gap-2 flex-shrink-0">
                {!review.is_approved ? (
                  <>
                    <button className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button className="px-4 py-2 border border-destructive/20 text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex items-center gap-2 text-sm">
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                ) : (
                  <>
                    <button className="px-4 py-2 border border-border hover:bg-secondary rounded-lg transition-colors flex items-center gap-2 text-sm">
                      <Eye className="w-4 h-4" />
                      View Product
                    </button>
                    <button className="px-4 py-2 border border-destructive/20 text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex items-center gap-2 text-sm">
                      <X className="w-4 h-4" />
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Status Badge */}
            {review.is_approved && (
              <div className="mt-4 pt-4 border-t border-border">
                <span className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-full">
                  Published on Website
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredReviews.length === 0 && (
        <div className="bg-white border border-border rounded-lg p-12 text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg mb-2">No reviews found</h3>
          <p className="text-muted-foreground">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Customer reviews will appear here'}
          </p>
        </div>
      )}
    </div>
  );
}
