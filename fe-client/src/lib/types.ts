// Shared types used across the application

export interface CartItemType {
  id: string | number;
  title: string;
  authorName: string;
  imageUrl?: string;
  price: number;
  quantity: number;
}

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

export interface CategoryType {
  id: string | number;
  name: string;
}


export enum SortMode {
  POPULARITY = 'popularity',
  RATING = 'rating',
  PRICE_ASC = 'price_low_to_high',
  PRICE_DESC = 'price_high_to_low',
  NEWEST = 'newest',
  ON_SALE = 'on_sale',
}

export interface PageResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// --- API Response Types ---

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
  category_name?: string;
}

export interface DiscountedBookTuple {
  0: {
    id: number;
    book_title: string;
    book_price: string;
    book_summary: string | null;
    book_cover_photo: string | null;
    category_id: number;
    author_id: number;
    updated_at?: string;
  };
  1: string;
}

// --- Order Types ---

export interface OrderItemCreate {
  book_id: number;
  quantity: number;
}

export interface OrderCreate {
  items: OrderItemCreate[];
}

export interface OrderItemResponse {
  id: number;
  order_id: number;
  book_id: number;
  quantity: number;
  price: string;
}

export interface OrderResponse {
  id: number;
  user_id: number;
  order_date: string;
  order_amount: string;
  items: OrderItemResponse[];
}

export interface Token {
  access_token: string;
  token_type: string;
}
