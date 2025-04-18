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

