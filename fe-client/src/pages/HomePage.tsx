import React, { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import BookCard from '@/components/BookCard';
import { bookwormApi } from '@/services/bookwormApi';
import Autoplay from "embla-carousel-autoplay"

import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';

export function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [onSaleBooks, setOnSaleBooks] = useState<any[]>([]);
  const [recommendedBooks, setRecommendedBooks] = useState<any[]>([]);
  const [popularBooks, setPopularBooks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'recommended' | 'popular'>('recommended');

  useEffect(() => {
    
    async function fetchBooks() {
      setIsLoading(true);
      try {
        const discountedBooks = await bookwormApi.getTopDiscountedBooks();
        const recommendedBooksData = await bookwormApi.getFeaturedBooks('recommended');
        const popularBooksData = await bookwormApi.getFeaturedBooks('popular');
        
        setOnSaleBooks(discountedBooks);
        setRecommendedBooks(recommendedBooksData);
        setPopularBooks(popularBooksData);
      } catch (error) {
        console.error('Failed to fetch books:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBooks();
  }, []);

  const mapBookToBookCard = (book: any) => ({
    id: book.id,
    title: book.book_title,
    authorName: book.author_name,
    imageUrl: bookwormApi.getImageUrl(book),
    originalPrice: book.book_price,
    discountPrice: book.discount_price,
  });
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-200 h-80 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
            <Carousel className="w-full"
            opts={{ align: "start", loop: true, }}
              plugins={[
            Autoplay({
              delay: 2000,
            }),
          ]}>
            <CarouselContent>
              {onSaleBooks.map((book) => (
                <CarouselItem key={book.id} className="lg:basis-1/4 sm:basis-1/2">
                  <BookCard
                    id={book.id}
                    {...mapBookToBookCard(book)}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        )}
         {/* Featured Books Section */}
        <h2 className="text-2xl font-bold mb-6">Featured Books</h2>
        {/* Closing tag added here */}
        <div className="border-gray-200 mb-6">
          <div className="flex space-x-8 justify-center">
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
                {...mapBookToBookCard(book)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}