import React, { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import BookCard from '@/components/BookCard';
import { api } from '@/services/api';
import { BookType } from '@/lib/types';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';

export function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [onSaleBooks, setOnSaleBooks] = useState<BookType[]>([]);
  const [recommendedBooks, setRecommendedBooks] = useState<BookType[]>([]);
  const [popularBooks, setPopularBooks] = useState<BookType[]>([]);
  const [activeTab, setActiveTab] = useState<'recommended' | 'popular'>('recommended');

  useEffect(() => {
    async function fetchBooks() {
      setIsLoading(true);
      try {
        const onSaleResponse = await api.getBooks({ onSale: true, limit: 10 });
        const recommendedResponse = await api.getBooks({ 
          sort: 'rating', 
          limit: 8,
          minRating: 4 
        });
        const popularResponse = await api.getBooks({ 
          sort: 'popularity', 
          limit: 8 
        });
        
        setOnSaleBooks(onSaleResponse.books);
        setRecommendedBooks(recommendedResponse.books);
        setPopularBooks(popularResponse.books);
      } catch (error) {
        console.error('Failed to fetch books:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBooks();
  }, []);

  return (
    <div className="space-y-12">

      {/* On Sale Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">On Sale</h2>
          <Link
            to="/shop"
            search={{ onSale: true }}
            className="text-blue-700 hover:underline"
          >
            View All
          </Link>
        </div>

        {isLoading ? (
          <div className="flex gap-4 overflow-x-auto py-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="min-w-[200px] h-72 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <Carousel className="w-full">
            <CarouselContent>
              {onSaleBooks.map((book) => (
                <CarouselItem key={book.id} className="lg:basis-1/4 sm:basis-1/2">
                  <BookCard
                    id={book.id}
                    title={book.title}
                    authorName={book.author.name}
                    imageUrl={book.imageUrl}
                    originalPrice={book.price}
                    discountPrice={book.discountPrice}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        )}
      </section>

      {/* Featured Books Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Featured Books</h2>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-8">
            <button
              className={`pb-2 font-medium text-lg ${
                activeTab === 'recommended'
                  ? 'border-b-2 border-blue-700 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('recommended')}
            >
              Recommended
            </button>
            <button
              className={`pb-2 font-medium text-lg ${
                activeTab === 'popular'
                  ? 'border-b-2 border-blue-700 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('popular')}
            >
              Popular
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(activeTab === 'recommended' ? recommendedBooks : popularBooks).map((book) => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                authorName={book.author.name}
                imageUrl={book.imageUrl}
                originalPrice={book.price}
                discountPrice={book.discountPrice}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}