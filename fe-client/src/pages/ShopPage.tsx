import { useState, useEffect } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import BookCard from '@/components/BookCard';
import Pagination from '@/components/Pagination';
import { api } from '@/services/api';
import RatingStars from '@/components/RatingStars';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import type { ShopSearch } from '@/routes/shop';

interface SortOption {
  label: string;
  value: 'price-asc' | 'price-desc' | 'rating' | 'popularity';
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
    category: categoryFilter, 
    author: authorFilter, 
    minRating: minRatingFilter 
  } = search;

  const sortOptions: SortOption[] = [
    { label: 'Popularity', value: 'popularity' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Rating', value: 'rating' },
  ];

  const limitOptions: LimitOption[] = [
    { label: '5', value: 5 },
    { label: '15', value: 15 },
    { label: '20', value: 20 },
    { label: '25', value: 25 },
  ];

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const result = await api.getBooks({
          page,
          limit,
          category: categoryFilter,
          author: authorFilter,
          minRating: minRatingFilter,
          sort,
          onSale
        });
        
        setBooks(result.books);
        setTotalBooks(result.total);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error('Failed to fetch books:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [page, limit, categoryFilter, authorFilter, minRatingFilter, sort, onSale]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [categoriesData, authorsData] = await Promise.all([
          api.getCategories(),
          api.getAuthors()
        ]);
        
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
        if (value === undefined) {
          delete newSearch[filterType];
        } else {
          (newSearch as any)[filterType] = value;
        }
        return newSearch;
      }
    });
  };

  const isFilterActive = () => {
    return categoryFilter || authorFilter || minRatingFilter || onSale;
  };

  const getFilterDescription = () => {
    const activeFilters = [];
    
    if (categoryFilter) {
      const category = categories.find(c => c.id === categoryFilter);
      if (category) activeFilters.push(category.name);
    }
    
    if (authorFilter) {
      const author = authors.find(a => a.id === authorFilter);
      if (author) activeFilters.push(author.name);
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
      
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-64 flex-shrink-0">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Filters</h2>
            
            <div className="mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="onSale"
                  checked={!!onSale}
                  onChange={(e) => applyFilter('onSale', e.target.checked ? true : undefined)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="onSale" className="ml-2 text-sm font-medium text-gray-900">
                  On Sale
                </label>
              </div>
            </div>
            
            <Accordion type="multiple" defaultValue={["categories", "authors", "rating"]} className="space-y-4">
              <AccordionItem value="categories" className="border rounded-md px-3">
                <AccordionTrigger className="text-base font-medium py-2">Categories</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between">
                        <button
                          onClick={() => applyFilter('category', categoryFilter === category.id ? undefined : category.id)}
                          className={`text-sm hover:text-blue-700 ${categoryFilter === category.id ? 'text-blue-700 font-semibold' : 'text-gray-700'}`}
                        >
                          {category.name}
                        </button>
                        <span className="text-xs text-gray-500">{category.count}</span>
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
                          onClick={() => applyFilter('author', authorFilter === author.id ? undefined : author.id)}
                          className={`text-sm hover:text-blue-700 ${authorFilter === author.id ? 'text-blue-700 font-semibold' : 'text-gray-700'}`}
                        >
                          {author.name}
                        </button>
                        <span className="text-xs text-gray-500">{author.count}</span>
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
                          <RatingStars rating={rating} size="sm" showText={false} />
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
              Showing {totalBooks} results
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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