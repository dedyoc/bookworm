import { useParams } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import RatingStars from '@/components/RatingStars';
import QuantityInput from '@/components/QuantityInput';
import { useCart } from '@/contexts/CartContext';

export const ProductPage = () => {
  const { id } = useParams({ from: '/product/$id' });
  const [book, setBook] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCart();
  
  useEffect(() => {
    const fetchBook = async () => {
      setIsLoading(true);
      try {
        const bookData = await api.getBookById(id);
        setBook(bookData);
      } catch (error) {
        console.error('Failed to fetch book details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBook();
  }, [id]);
  
  const handleAddToCart = () => {
    if (book) {
      addItem({
        id: book.id,
        title: book.title,
        authorName: book.author.name,
        imageUrl: book.imageUrl,
        price: book.discountPrice || book.price
      }, quantity);
      
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3 bg-gray-200 h-96 animate-pulse rounded-lg"></div>
          <div className="md:w-2/3 space-y-4">
            <div className="h-8 bg-gray-200 animate-pulse rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-10 bg-gray-200 animate-pulse rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!book) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700">Book not found</h1>
          <p className="mt-2 text-gray-600">The book you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Book Image */}
        <div className="md:w-1/3">
          <img 
            src={book.imageUrl} 
            alt={book.title}
            className="w-full h-auto rounded-lg shadow-md object-cover"
          />
        </div>
        
        {/* Book Details */}
        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold">{book.title}</h1>
          
          <div className="mt-2">
            by <span className="text-blue-700 hover:underline cursor-pointer">{book.author.name}</span>
          </div>
          
          <div className="mt-4">
            <RatingStars rating={book.rating} reviewCount={book.reviewCount} size="lg" />
          </div>
          
          <div className="mt-2 text-sm">
            Category: <span className="text-blue-700 hover:underline cursor-pointer">{book.category.name}</span>
          </div>
          
          {/* Price Section */}
          <div className="mt-6">
            {book.discountPrice ? (
              <div className="flex items-center">
                <span className="text-3xl font-bold text-red-600">${book.discountPrice}</span>
                <span className="ml-3 text-lg text-gray-500 line-through">${book.price}</span>
              </div>
            ) : (
              <span className="text-3xl font-bold">${book.price}</span>
            )}
          </div>
          
          {/* Add to Cart Section */}
          <div className="mt-6 flex items-center">
            <QuantityInput 
              initialValue={quantity} 
              min={1} 
              max={8} 
              onChange={setQuantity} 
            />
            <button 
              onClick={handleAddToCart}
              className="ml-4 px-6 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors"
            >
              Add to Cart
            </button>
          </div>
          
          {/* Added to Cart Message */}
          {addedToCart && (
            <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">
              Added to cart successfully!
            </div>
          )}
          
          {/* Description */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{book.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
