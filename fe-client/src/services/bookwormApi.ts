import ky from 'ky';
import type { 
  BookResponse, 
  Token, 
  PageResponse, 
  SortMode,
  OrderCreate,
  OrderResponse,
  ReviewResponse,
  ReviewCreate,
  BookRatingStatsResponse,
} from '@/lib/types'; 

const API_BASE_URL = 'http://localhost:8000';

export const bookwormApi = {
  getTopDiscountedBooks: async (): Promise<BookResponse[]> => {
    try {
      const data = await ky.get(`${API_BASE_URL}/books/top-discounted`).json<any[]>();
      console.log('Discounted books response:', data);
      return data.map((item: any): BookResponse => ({
        id: item.id,
        book_title: item.book_title || item.title,
        book_summary: item.book_summary || item.summary,
        book_price: item.book_price || item.price,
        book_cover_photo: item.book_cover_photo || item.cover_photo,
        category_id: item.category_id,
        author_id: item.author_id,
        author_name: item.author_name,
        category_name: item.category_name,
        discount_price: item.discount_price,
      }));
    } catch (error) {
      console.error('Failed to fetch discounted books:', error);
      throw error;
    }
  },

  getPopularBooks: async (): Promise<BookResponse[]> => {
    try {
      const data = await ky.get(`${API_BASE_URL}/books/popular`).json<BookResponse[]>();
      console.log('Popular books response:', data);
      return data;
    } catch (error) {
      console.error('Failed to fetch popular books:', error);
      throw error;
    }
  },

  /**
   * Fetches a paginated list of books with optional filtering and sorting.
   */
  getBooks: async (params?: {
    page?: number;
    page_size?: number;
    category_id?: number | null;
    author_id?: number | null;
    min_rating?: number | null;
    sort_mode?: SortMode | null;
  }): Promise<PageResponse<BookResponse>> => {
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.page !== undefined) searchParams.append('page', params.page.toString());
      if (params?.page_size !== undefined) searchParams.append('page_size', params.page_size.toString());
      if (params?.category_id !== undefined && params.category_id !== null) searchParams.append('category_id', params.category_id.toString());
      if (params?.author_id !== undefined && params.author_id !== null) searchParams.append('author_id', params.author_id.toString());
      if (params?.min_rating !== undefined && params.min_rating !== null) searchParams.append('min_rating', params.min_rating.toString());
      if (params?.sort_mode !== undefined && params.sort_mode !== null) searchParams.append('sort_mode', params.sort_mode);
      
      const data = await ky.get(`${API_BASE_URL}/books/`, { searchParams }).json<PageResponse<BookResponse>>();
      return data;
    } catch (error) {
      console.error('Failed to fetch books:', error);
      throw error;
    }
  },
  getBook: async (bookId: number): Promise<BookResponse> => {
    try {
      const data = await ky.get(`${API_BASE_URL}/books/${bookId}`).json<BookResponse>();
      return data;
    } catch (error) {
      console.error('Failed to fetch book:', error);
      throw error;
    }
  },

  /**
   * Fetches rating statistics for a specific book.
   */
  getBookRatingStats: async (bookId: number): Promise<BookRatingStatsResponse> => {
    try {
      const data = await ky.get(`${API_BASE_URL}/reviews/stats/${bookId}`).json<BookRatingStatsResponse>();
      return data;
    } catch (error) {
      console.error(`Failed to fetch rating stats for book ID ${bookId}:`, error);
      throw error;
    }
  },

  getRecommendedBooks: async (): Promise<BookResponse[]> => {
    try {
      const data = await ky.get(`${API_BASE_URL}/books/recommended`).json<BookResponse[]>();
      return data;
    } catch (error) {
      console.error('Failed to fetch recommended books:', error);
      throw error;
    }
  },

  /**
   * Get an image URL or return a placeholder
   */
  getImageUrl: (book: BookResponse): string => {
    if (book.book_cover_photo) {
      if (book.book_cover_photo.startsWith('/')) {
        return `${API_BASE_URL}${book.book_cover_photo}`;
      }
      return book.book_cover_photo;
    }
    return `https://picsum.photos/id/${book.id % 30}/200/300`;
  },

  getCategories: async (): Promise<any[]> => {
    try {
      const data = await ky.get(`${API_BASE_URL}/categories/all`).json<any[]>();
      console.log('Categories response:', data);
      return data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  },

  getAuthors: async (): Promise<any[]> => {
    try {
      const data = await ky.get(`${API_BASE_URL}/authors/all`).json<any[]>();
      return data;
    } catch (error) {
      console.error('Failed to fetch authors:', error);
      throw error;
    }
  },

  /**
   * Fetches reviews with pagination and filtering.
   */
  getReviews: async (params: {
    book_id?: number;
    user_id?: number;
    page?: number;
    page_size?: number;
    rating_star?: number | null; 
    sort_by_rating_asc?: boolean | null; 
    sort_by_date?: any | null; // TODO: Define a more specific type for sort_by_date
  }): Promise<PageResponse<ReviewResponse>> => {
    try {
      const searchParams = new URLSearchParams();
      if (params.book_id !== undefined) searchParams.append('book_id', params.book_id.toString());
      if (params.user_id !== undefined) searchParams.append('user_id', params.user_id.toString());
      if (params.page !== undefined) searchParams.append('page', params.page.toString());
      if (params.page_size !== undefined) searchParams.append('page_size', params.page_size.toString());
      if (params.rating_star !== undefined && params.rating_star !== null) searchParams.append('rating_star', params.rating_star.toString());
      
      if (params.sort_by_rating_asc !== undefined && params.sort_by_rating_asc !== null) {
        searchParams.append('sort_by_rating_asc', params.sort_by_rating_asc.toString());
      } else if (params.sort_by_date !== undefined && params.sort_by_date !== null) {
        // Only add sort_by_date if sort_by_rating is not used, as rating takes precedence
        searchParams.append('sort_by_date', params.sort_by_date);
      }
      
      const data = await ky.get(`${API_BASE_URL}/reviews/`, { searchParams }).json<PageResponse<ReviewResponse>>();
      return data;
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      throw error;
    }
  },

  /**
   * Creates a new review. Requires authentication token.
   */
  createReview: async (reviewData: ReviewCreate): Promise<ReviewResponse> => {
    try {
      const data = await ky.post(`${API_BASE_URL}/reviews/`, {
        json: reviewData,
      }).json<ReviewResponse>();
      return data;
    } catch (error) {
      console.error('Failed to create review:', error);
      throw error;
    }
  },

  createOrder: async (orderData: OrderCreate, token: string): Promise<OrderResponse> => {
    try {
      const data = await ky.post(`${API_BASE_URL}/orders/`, {
        json: orderData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }).json<OrderResponse>();
      return data;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error; 
    }
  },

  logout: async (token: string): Promise<void> => {
    try {
      await ky.post(`${API_BASE_URL}/auth/logout`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },

  refreshToken: async (refreshToken: string): Promise<Token> => {
    try {
      const data = await ky.post(`${API_BASE_URL}/auth/refresh`, {
        json: { refresh_token: refreshToken },
      }).json<Token>();
      return data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }
};
