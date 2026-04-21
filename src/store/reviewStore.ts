import { create } from 'zustand';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number; // 1–5
  comment: string;
  createdAt: string;
}

export interface ReviewSummary {
  productId: string;
  averageRating: number;
  totalReviews: number;
  showRating: boolean;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

interface ReviewState {
  reviews: Review[];
  isLoading: boolean;
  
  /** Fetch reviews for a specific product from API */
  fetchReviews: (productId: string) => Promise<void>;
  
  /** Add a new review via API */
  addReview: (productId: string, rating: number, comment: string) => Promise<boolean>;
  
  /** Get filtered reviews (rating 4-5) for display */
  getProductReviews: () => Review[];
  
  /** Calculate summary from current review list */
  getProductSummary: (productId: string) => ReviewSummary;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  isLoading: false,

  fetchReviews: async (productId) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      if (!res.ok) throw new Error('Không thể tải đánh giá');
      const data = await res.json();
      set({ reviews: data.reviews, isLoading: false });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },

  addReview: async (productId, rating, comment) => {
    try {
      const token = localStorage.getItem('auth_token'); // Or from authStore
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ productId, rating, comment }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Không thể gửi đánh giá');
      }
      
      const { review } = await res.json();
      set((s) => ({ reviews: [review, ...s.reviews] }));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  getProductReviews: () => {
    const all = get().reviews;
    // Only show high ratings per current business logic
    return all
      .filter((r) => r.rating >= 4)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getProductSummary: (productId) => {
    const all = get().reviews;
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
    let total = 0;
    
    for (const r of all) {
      dist[r.rating as 1 | 2 | 3 | 4 | 5]++;
      total += r.rating;
    }
    
    const avg = all.length > 0 ? Math.round((total / all.length) * 10) / 10 : 0;
    const hasHighRating = all.some((r) => r.rating >= 4);
    
    return {
      productId,
      averageRating: avg,
      totalReviews: all.length,
      showRating: hasHighRating,
      distribution: dist,
    };
  },
}));
