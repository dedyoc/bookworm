// ============================================================================
// Shared TypeScript Types for Bookworm Frontend
// ============================================================================

// ----------------------------------------------------------------------------
// Enums & Constant Types
// ----------------------------------------------------------------------------

/** Sorting modes for book lists (matches backend). */
export enum SortMode {
  POPULARITY = 'popularity',
  RATING = 'rating', // Check backend support
  PRICE_ASC = 'price_low_to_high',
  PRICE_DESC = 'price_high_to_low',
  NEWEST = 'newest', // Check backend support
  ON_SALE = 'on_sale',
}

/** Sorting orders for reviews by date. */
export type ReviewDateSort = 'newest' | 'oldest';

// ----------------------------------------------------------------------------
// Generic API Structures
// ----------------------------------------------------------------------------

/** Standard structure for paginated API responses. */
export interface PageResponse<T> {
  items: T[];
  total: number; // Total items available
  page: number; // Current page
  page_size: number; // Items per page
  pages: number; // Total pages
}

// ----------------------------------------------------------------------------
// API Response Types (Matching Backend Schemas)
// ----------------------------------------------------------------------------

/** API response for a single book. */
export interface BookResponse {
  id: number;
  book_title: string;
  book_summary: string | null;
  book_price: string;
  book_cover_photo: string | null;
  category_id: number;
  author_id: number;
  discount_price: string | null;
  author_name: string;
  category_name?: string; // Optional
}

/** API response for a category (e.g., from /categories/all). */
export interface CategoryResponse {
  id: number;
  name: string;
  // count?: number; // If API includes it
}

/** API response for an author (e.g., from /authors/all). */
export interface AuthorResponse {
  id: number;
  name: string;
  // count?: number; // If API includes it
}

/** API response for book rating statistics (/reviews/stats/{bookId}). */
export interface BookRatingStatsResponse {
  average_rating: number;
  total_reviews: number;
  five_stars: number;
  four_stars: number;
  three_stars: number;
  two_stars: number;
  one_star: number;
}

/** API response for a single review. */
export interface ReviewResponse {
  id: number;
  book_id: number;
  user_id: number;
  rating: number;
  review_title: string;
  review_details?: string | null;
  review_date: string; // ISO 8601
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

/** API response for an item within an order. */
export interface OrderItemResponse {
  id: number;
  order_id: number;
  book_id: number;
  quantity: number;
  price: string; // Price at time of order
}

/** API response for a completed order. */
export interface OrderResponse {
  id: number;
  user_id: number;
  order_date: string; // ISO 8601
  order_amount: string;
  items: OrderItemResponse[];
}

/** API response structure for authentication tokens. */
export interface Token {
  access_token: string;
  token_type: string; // e.g., "Bearer"
}

/** API response structure for discounted books (specific endpoints). */
export interface DiscountedBookTuple {
  0: { // Book details
    id: number;
    book_title: string;
    book_price: string;
    book_summary: string | null;
    book_cover_photo: string | null;
    category_id: number;
    author_id: number;
    updated_at?: string;
  };
  1: string; // Discount price string
}

// ----------------------------------------------------------------------------
// API Creation Payload Types (Data sent TO Backend)
// ----------------------------------------------------------------------------

/** Payload for creating a new review. */
export interface ReviewCreate {
  book_id: number;
  rating: number;
  review_title: string;
  review_details?: string | null;
}

/** Payload for an item within an order creation request. */
export interface OrderItemCreate {
  book_id: number;
  quantity: number;
}

/** Payload for creating a new order. */
export interface OrderCreate {
  items: OrderItemCreate[];
}

// ----------------------------------------------------------------------------
// Internal/UI Types (Potentially Legacy or UI-Specific Adaptations)
// Note: Review if these can be replaced by API types.
// ----------------------------------------------------------------------------

/** Represents an item in the frontend shopping cart state. */
export interface CartItemType {
  id: string | number;
  title: string;
  authorName: string;
  imageUrl?: string;
  price: number; // Consider if this should align with API string price
  quantity: number;
  discountPrice?: number; // Added based on usage in CartPage
}

/** Internal representation of a book (potentially legacy). */
export interface BookType {
  id: string | number;
  title: string;
  author: {
    id: string | number;
    name: string;
  };
  imageUrl?: string;
  description: string;
  price: number;
  discountPrice?: number;
  rating?: number;
  reviewCount?: number;
  category: {
    id: string | number;
    name: string;
  };
}

/** Internal representation of a review (potentially legacy). */
export interface ReviewType {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  date: string;
}

/** Internal representation of a category (potentially legacy). */
export interface CategoryType {
  id: string | number;
  name: string;
}
