// Base API client for Bookworm backend

export interface BookResponse {
  id: number;
  book_title: string;
  book_summary: string | null;
  book_price: string;
  book_cover_photo: string | null;
  category_id: number;
  author_id: number; 
  discount_price: string | null;
  // Fields from related data that might be included
  author_name?: string;
  category_name?: string;
}

// Interface for discounted book response which might be in a different format
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
  1: string; // This appears to be the discount price
}

export type FeaturedBookType = 'recommended' | 'popular';

// API base URL - replace with your actual API URL
const API_BASE_URL = 'http://localhost:8000';

export const bookwormApi = {
  // TODO: Add more API methods as needed
  getTopDiscountedBooks: async (): Promise<BookResponse[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/top-discounted`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Handle the tuple format response
      const data = await response.json();
      console.log('Discounted books response:', data);
      // using a random object mapping
      return data.map((item: any) => ({
        id: item.id,
        book_title: item.book_title || item.title,
        book_summary: item.book_summary || item.summary,
        book_price: item.book_price || item.price,
        book_cover_photo: item.book_cover_photo || item.cover_photo,
        category_id: item.category_id,
        author_id: item.author_id,
        author_name: item.author_name,
        discount_price: item.discount_price,
      }));
    } catch (error) {
      console.error('Failed to fetch discounted books:', error);
      throw error;
    }
  },
  
  getFeaturedBooks: async (type: FeaturedBookType): Promise<BookResponse[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/featured/${type}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch ${type} books:`, error);
      throw error;
    }
  },

  /**
   * Helper function to get an image URL or return a placeholder
   */
  getImageUrl: (book: BookResponse): string => {
    if (book.book_cover_photo) {
      // If the image URL is a relative path, prefix with API URL
      if (book.book_cover_photo.startsWith('/')) {
        return `${API_BASE_URL}${book.book_cover_photo}`;
      }
      return book.book_cover_photo;
    }
    return `https://picsum.photos/id/${book.id % 30}/200/300`;
  }
};
