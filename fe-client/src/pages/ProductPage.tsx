import { useParams } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Separator } from '@/components/ui/separator';
import Pagination from '@/components/Pagination';
import QuantityInput from '@/components/QuantityInput';
import { useCart } from '@/contexts/CartContext';
import type { BookResponse, ReviewResponse, ReviewCreate, BookRatingStatsResponse, ReviewDateSort } from '@/lib/types';
import { bookwormApi } from '@/services/bookwormApi';
import { useAuth } from '@/contexts/AuthContext';
import defaultImage from '@/assets/default-cover.jpg';

export const ProductPage = () => {
  const { id } = useParams({ from: '/product/$id' });
  const numericId = Number(id);
  const { addItem, getItemQuantity } = useCart();
  const { token, isAuthenticated } = useAuth();

  const [book, setBook] = useState<BookResponse | null>(null);
  const [isBookLoading, setIsBookLoading] = useState(true);
  const [bookError, setBookError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewLimit, setReviewLimit] = useState(5);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalReviewPages, setTotalReviewPages] = useState(1);
  const [reviewSort, setReviewSort] = useState<'newest' | 'oldest' | 'rating-high' | 'rating-low'>('newest');
  const [isReviewLoading, setIsReviewLoading] = useState(true);
  const [starFilter, setStarFilter] = useState<number | null>(null);

  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewDetails, setReviewDetails] = useState('');
  const [reviewRating, setReviewRating] = useState<number | undefined>(undefined);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [submitReviewSuccess, setSubmitReviewSuccess] = useState<string | null>(null);
  const [submitReviewError, setSubmitReviewError] = useState<string | null>(null);

  const [ratingStats, setRatingStats] = useState<BookRatingStatsResponse | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      if (!numericId) return;
      setIsBookLoading(true);
      setBookError(null);
      try {
        const fetchedBook = await bookwormApi.getBook(numericId);
        setBook(fetchedBook);
      } catch (error) {
        console.error("Failed to fetch book:", error);
        setBookError("Failed to load book details.");
      } finally {
        setIsBookLoading(false);
      }
    };
    fetchBook();
  }, [numericId]);

  useEffect(() => {
    const fetchRatingStats = async () => {
      if (!numericId) return;
      setIsStatsLoading(true);
      try {
        const stats = await bookwormApi.getBookRatingStats(numericId);
        setRatingStats(stats);
      } catch (error) {
        console.error("Failed to fetch rating stats:", error);
      } finally {
        setIsStatsLoading(false);
      }
    };
    fetchRatingStats();
  }, [numericId]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!numericId) return;
      setIsReviewLoading(true);
      try {
        // Map frontend sort state to backend API parameters
        let sortParams: { 
          sort_by_rating_asc?: boolean | null; 
          sort_by_date?: ReviewDateSort | null 
        } = {};

        switch (reviewSort) {
          case 'newest':
            sortParams.sort_by_date = 'newest';
            break;
          case 'oldest':
            sortParams.sort_by_date = 'oldest';
            break;
          case 'rating-high':
            sortParams.sort_by_rating_asc = false; // Descending
            break;
          case 'rating-low':
            sortParams.sort_by_rating_asc = true; // Ascending
            break;
          default:
            sortParams.sort_by_date = 'newest'; // Default sort
        }

        const result = await bookwormApi.getReviews({ 
          book_id: numericId,
          page: reviewPage, 
          page_size: reviewLimit,
          rating_star: starFilter,
          ...sortParams // Spread the determined sort parameters
        });
        setReviews(result.items);
        setTotalReviews(result.total);
        setTotalReviewPages(result.pages);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setIsReviewLoading(false);
      }
    };
    fetchReviews();
  }, [numericId, reviewPage, reviewLimit, reviewSort, starFilter]);

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (!book) return;

    const currentQuantityInCart = getItemQuantity(book.id);
    const potentialTotalQuantity = currentQuantityInCart + quantity;

    if (potentialTotalQuantity > 8) {
      alert(`You already have ${currentQuantityInCart} of this book in your cart. You cannot add more than 8 total.`);
      return; 
    }

    addItem({
      id: book.id,
      title: book.book_title,
      authorName: book.author_name,
      imageUrl: bookwormApi.getImageUrl(book),
      price: Number(book.book_price),
      discountPrice: book.discount_price ? Number(book.discount_price) : undefined,
    }, quantity);
    console.log(`Added ${quantity} of ${book.book_title} to cart.`);
  };

  const handleReviewPageChange = (newPage: number) => {
    setReviewPage(newPage);
  };

  const handleReviewLimitChange = (newLimit: string) => {
    setReviewLimit(Number(newLimit));
    setReviewPage(1);
  };
  
  const handleReviewSortChange = (newSort: 'newest' | 'oldest' | 'rating-high' | 'rating-low') => {
    setReviewSort(newSort);
    setReviewPage(1);
  };

  const handleStarFilterChange = (rating: number | null) => {
    setStarFilter(rating);
    setReviewPage(1);
  };

  const handleSubmitReview = async () => {
    if (isNaN(numericId)) {
      setSubmitReviewError("Invalid Book ID.");
      return;
    }
    
    if (!numericId || reviewRating === undefined || !reviewTitle) { 
      setSubmitReviewError("Please select a rating and add a title.");
      return;
    }

    setIsSubmittingReview(true); 
    setSubmitReviewError(null); 
    setSubmitReviewSuccess(null); 

    const reviewData: ReviewCreate = {
      book_id: numericId,
      rating: reviewRating,
      review_title: reviewTitle,
      review_details: reviewDetails.trim() === '' ? null : reviewDetails,
    };

    console.log("Submitting review data:", JSON.stringify(reviewData, null, 2)); 

    try {
      await bookwormApi.createReview(reviewData, token); 
      setSubmitReviewSuccess("Review submitted successfully!");
      setReviewTitle('');
      setReviewDetails('');
      setReviewRating(undefined);
      setReviewPage(1); 
      setStarFilter(null); 
    } catch (error: any) {
      console.error("Failed to submit review:", error);
      let errorDetailString = "Failed to submit review. Please try again."; 

      if (error.response) {
        error.response.json().then((body: any) => {
          console.error("API Error Response Body:", body);
        }).catch((e: any) => {
          console.error("Failed to parse error response body as JSON:", e);
        });
      }

      if (error.response && typeof error.response.json === 'function') {
        try {
          const errorBody = await error.response.json();
          
          if (typeof errorBody.detail === 'string') {
            errorDetailString = errorBody.detail === "User has already reviewed this book" 
              ? "You have already submitted a review for this book." 
              : errorBody.detail;
          } 
          else if (Array.isArray(errorBody.detail)) {
            const firstError = errorBody.detail[0];
            if (firstError && typeof firstError.msg === 'string') {
              const field = firstError.loc && Array.isArray(firstError.loc) ? firstError.loc.slice(-1)[0] : 'field';
              errorDetailString = `Input error for '${field}': ${firstError.msg}`; 
            } else if (firstError && typeof firstError === 'string') {
              errorDetailString = firstError;
            }
          } 
          else if (typeof errorBody.message === 'string') {
             errorDetailString = errorBody.message;
          }

        } catch (parseError) {
          console.error("Failed to parse error response body:", parseError);
        }
      }
      
      setSubmitReviewError(errorDetailString); 
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const startReviewItem = totalReviews > 0 ? (reviewPage - 1) * reviewLimit + 1 : 0;
  const endReviewItem = Math.min(reviewPage * reviewLimit, totalReviews);

  if (isBookLoading || isStatsLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading book details...</div>;
  }
  if (bookError) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-600">{bookError}</div>;
  }
  if (!book) {
    return <div className="container mx-auto px-4 py-8 text-center">Book not found.</div>;
  }

  const averageRating = ratingStats ? ratingStats.average_rating.toFixed(1) : 'N/A';
  const reviewCount = ratingStats ? ratingStats.total_reviews : 0;
  const starCounts = ratingStats ? {
    5: ratingStats.five_stars,
    4: ratingStats.four_stars,
    3: ratingStats.three_stars,
    2: ratingStats.two_stars,
    1: ratingStats.one_star,
  } : { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl text-gray-600 mb-4">
        {book.category_name}
      </h1>
      <Separator className="mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-x-12 gap-y-8">
        
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4 h-fit">
          <div className="space-y-4">
            <AspectRatio ratio={2 / 3} className="bg-muted rounded-lg overflow-hidden max-w-sm mx-auto md:mx-0">
              {book.book_cover_photo ? (
                <img
                  src={book.book_cover_photo}
                  alt={book.book_title}
                  onError={(e) => {
                    e.currentTarget.onerror = null; // prevents looping
                    e.currentTarget.src = defaultImage; // fallback image
                  }
                  }
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No Image Available
                </div>
              )}
            </AspectRatio>
            <p className="text-lg text-gray-700 text-right"><span className='text-lg text-bold'>By</span> {book.author_name}</p>
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold">{book.book_title}</h1>

            <p className="text-gray-700 leading-relaxed">
              {book.book_summary}
            </p>
          </div>
        </div>

        <div className="md:col-span-2 rounded-lg border bg-card text-card-foreground shadow-sm space-y-4 h-fit">
          <div className="flex items-baseline gap-4 p-8 bg-gray-100">
            {book.discount_price ? (
              <>
                <span className="text-gray-500 line-through text-xl">${parseFloat(book.book_price).toFixed(2)}</span>
                <span className="text-3xl font-bold text-red-600">
                  ${parseFloat(book.discount_price).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-gray-600">
                ${parseFloat(book.book_price).toFixed(2)}
              </span>
            )}
          </div>
          <div className="py-15 px-8 space-y-4">
            <h2 className="text-3xl font-semibold leading-none tracking-tight">
              Quantity
            </h2>
            <QuantityInput
                initialValue={quantity}
                min={1}
                max={8}
                onChange={handleQuantityChange}
              />
            <Button variant="outline" className="w-full my-4 text-2xl p-10" onClick={handleAddToCart}>
              Add to cart
            </Button>
          </div>
        </div>

        <div className="md:col-span-3 space-y-8 pt-8 rounded-lg border bg-card text-card-foreground shadow-sm p-6 h-fit">
          <h2 className="text-2xl font-bold">
            Customer Reviews 
            {starFilter !== null && <span className="text-sm text-gray-500 font-normal ml-2">(Filtered by {starFilter} star)</span>}
          </h2>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{averageRating} Star</span>
            </div>
          </div>

          <div className="flex flex-wrap mb-4 items-center">
            <button 
              onClick={() => handleStarFilterChange(null)}
              className={`text-sm py-1.5 mx-5 rounded font-medium ${
                starFilter === null 
                  ? 'text-blue-700 font-bold border-b-2 border-blue-700' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              ({reviewCount})
            </button>

            {[5, 4, 3, 2, 1].map((stars, index) => (
              <button 
                key={stars}
                onClick={() => handleStarFilterChange(stars)}
                className={`flex text-sm py-1.5 rounded transition-colors ${
                  starFilter === stars 
                    ? 'text-blue-700 font-bold border-blue-700' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {stars} stars ({starCounts[stars as keyof typeof starCounts]}) 
                {index < 4 && <span className="mx-2 text-gray-300">|</span>}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-sm text-gray-600">
              {totalReviews > 0 ? `Showing ${startReviewItem}–${endReviewItem} of ${totalReviews} reviews` : 'No reviews yet'}
            </span>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                    Sort by: {reviewSort.replace('-', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase())}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleReviewSortChange('newest')}>Newest to Oldest</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleReviewSortChange('oldest')}>Oldest to Newest</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleReviewSortChange('rating-high')}>Rating: High to Low</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleReviewSortChange('rating-low')}>Rating: Low to High</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Select value={String(reviewLimit)} onValueChange={handleReviewLimitChange}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Show" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Show 5</SelectItem>
                  <SelectItem value="15">Show 15</SelectItem>
                  <SelectItem value="20">Show 20</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6 min-h-[200px]">
            {isReviewLoading ? (
              <div className="text-center py-10">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                {starFilter !== null 
                  ? `No ${starFilter}-star reviews found.` 
                  : 'Be the first to review this book!'}
              </div>
            ) : (
              reviews.map((review, index) => (
                <div key={review.id}>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{review.review_title}</h3>
                    <span className="text-sm text-gray-500">| {review.rating} star{review.rating !== 1 ? 's' : ''}</span>
                  </div>
                  <p className="text-gray-700 mb-2">{review.review_details}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(review.review_date).toLocaleDateString("en-US", {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  {index < reviews.length - 1 && <Separator className="mt-6" />}
                </div>
              ))
            )}
          </div>

          {totalReviewPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={reviewPage}
                totalPages={totalReviewPages}
                itemsPerPage={reviewLimit}
                totalItems={totalReviews}
                onPageChange={handleReviewPageChange}
              />
            </div>
          )}
        </div>

        <div className="md:col-span-2 rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4 h-fit">
          <h3 className="text-lg font-semibold leading-none tracking-tight mb-4">Write a Review</h3>
          
          {submitReviewSuccess && <p className="text-green-600">{submitReviewSuccess}</p>}
          {submitReviewError && <p className="text-red-600">{submitReviewError}</p>}
          
          <div className="grid gap-2">
            <label htmlFor="review-title" className="text-sm font-medium">Add a title</label>
            <Input 
              id="review-title" 
              placeholder="What's most important to know?" 
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              disabled={isSubmittingReview}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="review-details" className="text-sm font-medium">Details please!</label>
            <Textarea 
              id="review-details" 
              placeholder="What did you like or dislike?" 
              value={reviewDetails}
              onChange={(e) => setReviewDetails(e.target.value)}
              disabled={isSubmittingReview}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="review-rating" className="text-sm font-medium">Select a rating</label>
            <Select 
              value={reviewRating !== undefined ? String(reviewRating) : ""} 
              onValueChange={(value) => setReviewRating(value ? Number(value) : undefined)}
              disabled={isSubmittingReview}
            >
              <SelectTrigger id="review-rating" className="w-[180px]">
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Star</SelectItem>
                <SelectItem value="4">4 Star</SelectItem>
                <SelectItem value="3">3 Star</SelectItem>
                <SelectItem value="2">2 Star</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSubmitReview} disabled={isSubmittingReview}>
            {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>

      </div>
    </div>
  );
};
