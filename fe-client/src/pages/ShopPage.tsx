import { useState, useEffect } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import BookCard from '@/components/BookCard';
import Pagination from '@/components/Pagination';
import { api } from '@/services/api';
import { bookwormApi } from '@/services/bookwormApi';
import { SortMode } from '@/lib/types';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import type { ShopSearch } from '@/routes/shop';
import { Separator } from '@radix-ui/react-separator';

interface SortOption {
  label: string;
  value: 'price_low_to_high' | 'price_high_to_low' | 'popularity' | 'on_sale';
}

interface LimitOption {
  label: string;
  value: number;
}

export const ShopPage = () => {
  const search = useSearch({ from: '/shop' }) as ShopSearch;
  const navigate = useNavigate({ from: '/shop' });

  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const { 
    page, 
    limit, 
    sort, 
    onSale, 
    category_id: categoryIdFilter, // Renamed from categoryFilter
    author_id: authorIdFilter,     // Renamed from authorFilter
    minRating: minRatingFilter 
  } = search;

  const sortOptions: SortOption[] = [
    { label: 'Price: Low to High', value: 'price_low_to_high' },
    { label: 'Price: High to Low', value: 'price_high_to_low' },
    { label: 'Popularity', value: 'popularity' },
    { label: 'On Sale', value: 'on_sale' },
  ];

  const limitOptions: LimitOption[] = [
    { label: '5', value: 5 },
    { label: '15', value: 15 },
    { label: '20', value: 20 },
    { label: '25', value: 25 },
  ];
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalBooks);
  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const sortModeMap: Record<string, SortMode> = {
          'price_low_to_high': SortMode.PRICE_ASC,
          'price_high_to_low': SortMode.PRICE_DESC,
          'popularity': SortMode.POPULARITY,
          'on_sale': SortMode.ON_SALE
        };

        const result = await bookwormApi.getBooks({
          page,
          page_size: limit,
          category_id: categoryIdFilter,
          author_id: authorIdFilter,
          min_rating: minRatingFilter,
          sort_mode: sortModeMap[sort]
        });
        
        const mappedBooks = result.items.map(book => ({
          id: book.id,
          title: book.book_title,
          author: { 
            id: book.author_id, 
            name: book.author_name || 'Unknown Author'  // Ensure we have a fallback
          },
          imageUrl: bookwormApi.getImageUrl(book),
          price: parseFloat(book.book_price), // Convert string price to number
          discountPrice: book.discount_price ? parseFloat(book.discount_price) : undefined,
        }));
        
        setBooks(mappedBooks);
        setTotalBooks(result.total);
        setTotalPages(result.pages);
      } catch (error) {
        console.error('Failed to fetch books:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [page, limit, categoryIdFilter, authorIdFilter, minRatingFilter, sort, onSale]); // Update dependencies

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        console.log('Fetching filter options...');
        const [categoriesData, authorsData] = await Promise.all([
          bookwormApi.getCategories(),
          bookwormApi.getAuthors() 
        ]);
        console.log('Fetched categories:', categoriesData);
        setCategories(categoriesData);
        setAuthors(authorsData);
      } catch (error) {
        console.error('Failed to fetch filter options:', error);
      }
    };

    fetchFilters();
  }, []);

  const handlePageChange = (newPage: number) => {
    navigate({ search: (prev) => ({ ...prev, page: newPage }) });
  };

  const handleSortChange = (sortValue: SortOption['value']) => {
    navigate({ 
      search: (prev) => ({ 
        ...prev, 
        sort: sortValue,
        page: 1
      }) 
    });
  };

  const handleLimitChange = (limitValue: number) => {
    navigate({ 
      search: (prev) => ({ 
        ...prev, 
        limit: limitValue,
        page: 1
      }) 
    });
  };

  const applyFilter = (filterType: keyof ShopSearch, value: string | number | boolean | undefined) => {
    navigate({
      search: (prev) => {
        const newSearch = { ...prev, page: 1 };
        // Ensure value is correctly typed if it's an ID
        const finalValue = (filterType === 'category_id' || filterType === 'author_id') && typeof value === 'string' 
                           ? parseInt(value, 10) 
                           : value;

        if (finalValue === undefined || (typeof finalValue === 'number' && isNaN(finalValue))) {
          delete newSearch[filterType];
        } else {
          (newSearch as any)[filterType] = finalValue;
        }
        return newSearch;
      }
    });
  };

  const isFilterActive = () => {
    return categoryIdFilter || authorIdFilter || minRatingFilter || onSale; // Use renamed variables
  };

  const getFilterDescription = () => {
    const activeFilters = [];
    
    if (categoryIdFilter) { // Use renamed variable
      // Assuming categories fetched have 'id' and 'category_name'
      const category = categories.find(c => c.id === categoryIdFilter); 
      if (category) activeFilters.push(category.category_name); // Use category_name
    }
    
    if (authorIdFilter) { // Use renamed variable
      // Assuming authors fetched have 'id' and 'author_name'
      const author = authors.find(a => a.id === authorIdFilter);
      if (author) activeFilters.push(author.author_name); // Use author_name
    }
    
    if (minRatingFilter) {
      activeFilters.push(`${minRatingFilter}+ Stars`);
    }
    
    if (onSale) {
      activeFilters.push('On Sale');
    }
    
    if (activeFilters.length === 0) return '';
    
    return `(Filtered by ${activeFilters.join(', ')})`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Books {isFilterActive() && <span className="text-xl font-normal text-gray-600">{getFilterDescription()}</span>}
      </h1>
      <Separator className="mb-6" />
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-64 flex-shrink-0">
          <div className="bg-white p-4">
            <h2 className="text-xl font-semibold mb-4">Filter By</h2>        
            <Accordion type="multiple" defaultValue={["categories", "authors", "rating"]} className="space-y-4">
              <AccordionItem value="categories" className="border rounded-md px-3">
                <AccordionTrigger className="text-base font-medium py-2">Categories</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between">
                        <button
                          // Pass 'category_id' and the numeric category.id
                          onClick={() => applyFilter('category_id', categoryIdFilter === category.id ? undefined : category.id)}
                          className={`text-sm hover:text-blue-700 ${categoryIdFilter === category.id ? 'text-blue-700 font-semibold' : 'text-gray-700'}`} // Use renamed variable
                        >
                          {category.category_name} {/* Use category_name */}
                        </button>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="authors" className="border rounded-md px-3">
                <AccordionTrigger className="text-base font-medium py-2">Authors</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto pt-2">
                    {authors.map((author) => (
                      <div key={author.id} className="flex items-center justify-between">
                        <button
                          // Pass 'author_id' and the numeric author.id
                          onClick={() => applyFilter('author_id', authorIdFilter === author.id ? undefined : author.id)}
                          className={`text-sm hover:text-blue-700 ${authorIdFilter === author.id ? 'text-blue-700 font-semibold' : 'text-gray-700'}`} // Use renamed variable
                        >
                          {author.author_name} {/* Use author_name */}
                        </button>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="rating" className="border rounded-md px-3">
                <AccordionTrigger className="text-base font-medium py-2">Rating</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => applyFilter('minRating', minRatingFilter === rating ? undefined : rating)}
                        className={`block w-full text-left py-1 ${minRatingFilter === rating ? 'text-blue-700 font-semibold' : 'text-gray-700'}`}
                      >
                        <div className="flex items-center">
                          <span className="ml-2 text-sm">{rating}+ Stars</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            {isFilterActive() && (
              <button
                onClick={() => {
                  navigate({ search: { page: 1, limit: 15, sort: 'popularity' } });
                }}
                className="mt-6 w-full py-2 px-4 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </aside>
        
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">

          <div className="text-sm text-gray-600">
              Showing {startItem}-{endItem} of {totalBooks} items
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 sm:mb-0">
              <div className="flex items-center">
                <label htmlFor="sort" className="mr-2 text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value as SortOption['value'])}
                  className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center">
                <label htmlFor="limit" className="mr-2 text-sm font-medium text-gray-700">Show:</label>
                <select
                  id="limit"
                  value={limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
                >
                  {limitOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            

          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {[...Array(limit)].map((_, index) => (
                <div key={index} className="bg-gray-200 h-80 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-700">No books found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your filters to find more books</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  id={book.id}
                  title={book.title}
                  authorName={book.author.name}
                  imageUrl={book.imageUrl}
                  originalPrice={book.price}
                  discountPrice={book.discountPrice}
                  rating={book.rating}
                  reviewCount={book.reviewCount}
                />
              ))}
            </div>
          )}


          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                itemsPerPage={limit}
                totalItems={totalBooks}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}