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
import { StarIcon } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { api } from '@/services/api';
import QuantityInput from '@/components/QuantityInput';
import { useCart } from '@/contexts/CartContext';
import type { BookType, ReviewType } from '@/lib/types';


export const ProductPage = () => {
  const { id } = useParams({ from: '/product/$id' });
  const { addItem } = useCart();

  const [book, setBook] = useState<BookType | null>(null);
  const [isBookLoading, setIsBookLoading] = useState(true);
  const [bookError, setBookError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewLimit, setReviewLimit] = useState(5);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalReviewPages, setTotalReviewPages] = useState(1);
  const [reviewSort, setReviewSort] = useState<'newest' | 'oldest' | 'rating-high' | 'rating-low'>('newest');
  const [isReviewLoading, setIsReviewLoading] = useState(true);

  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewDetails, setReviewDetails] = useState('');
  const [reviewRating, setReviewRating] = useState<number | undefined>(undefined);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [submitReviewSuccess, setSubmitReviewSuccess] = useState<string | null>(null);
  const [submitReviewError, setSubmitReviewError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;
      setIsBookLoading(true);
      setBookError(null);
      try {
        const fetchedBook = await api.getBookById(id);
        setBook(fetchedBook);
      } catch (error) {
        console.error("Failed to fetch book:", error);
        setBookError("Failed to load book details.");
      } finally {
        setIsBookLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      setIsReviewLoading(true);
      try {
        const result = await api.getReviewsByBookId(id, { 
          page: reviewPage, 
          limit: reviewLimit,
          sort: reviewSort 
        });
        setReviews(result.reviews);
        setTotalReviews(result.total);
        setTotalReviewPages(result.totalPages);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setIsReviewLoading(false);
      }
    };
    fetchReviews();
  }, [id, reviewPage, reviewLimit, reviewSort]);

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (!book) return;
    addItem({
      id: book.id,
      title: book.title,
      authorName: book.author.name,
      imageUrl: book.imageUrl,
      price: book.discountPrice ?? book.price,
    }, quantity);
    console.log(`Added ${quantity} of ${book.title} to cart.`);
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

  const handleSubmitReview = async () => {
    if (!id || !reviewRating || !reviewTitle || !reviewDetails) {
      setSubmitReviewError("Please fill in all fields and select a rating.");
      return;
    }
    setIsSubmittingReview(true);
    setSubmitReviewError(null);
    setSubmitReviewSuccess(null);
    try {
      await api.addReview(id, {
        rating: reviewRating,
        title: reviewTitle,
        content: reviewDetails,
      });
      setSubmitReviewSuccess("Review submitted successfully!");
      setReviewTitle('');
      setReviewDetails('');
      setReviewRating(undefined);
      setReviewPage(1); 
      setReviewSort('newest'); 
    } catch (error) {
      console.error("Failed to submit review:", error);
      setSubmitReviewError("Failed to submit review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const startReviewItem = totalReviews > 0 ? (reviewPage - 1) * reviewLimit + 1 : 0;
  const endReviewItem = Math.min(reviewPage * reviewLimit, totalReviews);

  if (isBookLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading book details...</div>;
  }
  if (bookError) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-600">{bookError}</div>;
  }
  if (!book) {
    return <div className="container mx-auto px-4 py-8 text-center">Book not found.</div>;
  }

  const averageRating = book.rating?.toFixed(1) ?? 'N/A';
  const reviewCount = book.reviewCount ?? totalReviews;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl text-gray-600 mb-4">
        {book.category.name}
      </h1>
      <Separator className="mb-8" />

      {/* Grid cols 5 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-x-12 gap-y-8">
        
        {/* Book Info col3 */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4 h-fit">
          <div className="space-y-4">
            <AspectRatio ratio={2 / 3} className="bg-muted rounded-lg overflow-hidden max-w-sm mx-auto md:mx-0">
              {book.imageUrl ? (
          <img
            src={book.imageUrl}
            alt={book.title}
            className="object-cover w-full h-full"
          />
              ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No Image Available
          </div>
              )}
            </AspectRatio>
            <p className="text-lg text-gray-700">By {book.author.name}</p>
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold">{book.title}</h1>

            <p className="text-gray-700 leading-relaxed">
              {book.description}
            </p>
          </div>
        </div>

        {/* Add to Cart */}
        <div className="md:col-span-2 rounded-lg border bg-card text-card-foreground shadow-sm space-y-4 h-fit">
          <div className="flex items-baseline gap-4 p-8 bg-gray-100">
            {book.discountPrice ? (
              <>
                <span className="text-gray-500 line-through text-xl">${book.price.toFixed(2)}</span>
                <span className="text-3xl font-bold text-red-600">
                  ${(book.discountPrice).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-gray-600">
                ${book.price.toFixed(2)}
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

        {/* Customer Reviews cols /3 */}
        <div className="md:col-span-3 space-y-8 pt-8 md:pt-0 rounded-lg border bg-card text-card-foreground shadow-sm p-6 h-fit">
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{averageRating}</span>
              {typeof book.rating === 'number' && book.rating > 0 && <StarIcon className="w-6 h-6 text-yellow-500 fill-current" />}
              <span className="text-gray-600">({reviewCount} Reviews)</span>
            </div>
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
                  <SelectItem value="10">Show 10</SelectItem>
                  <SelectItem value="20">Show 20</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6 min-h-[200px]">
            {isReviewLoading ? (
              <div className="text-center py-10">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-10 text-gray-500">Be the first to review this book!</div>
            ) : (
              reviews.map((review, index) => (
                <div key={review.id}>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{review.title}</h3>
                    <span className="text-gray-500">|</span>
                    <div className="flex">
                      {review.rating} stars
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2">{review.content}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(review.date).toLocaleDateString()}
                  </p>
                  {index < reviews.length - 1 && <Separator className="mt-6" />}
                </div>
              ))
            )}
          </div>

          {totalReviewPages > 1 && (
            <Pagination
              currentPage={reviewPage}
              totalPages={totalReviewPages}
              itemsPerPage={reviewLimit}
              totalItems={totalReviews}
              onPageChange={handleReviewPageChange}
            />
          )}
        </div>

        {/* Write a Review - Added md:col-span-2 */}
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

      </div> {/* End Grid */}
    </div>
  );
};
