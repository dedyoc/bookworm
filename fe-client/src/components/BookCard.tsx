import { Link } from '@tanstack/react-router';
import RatingStars from './RatingStars';

interface BookCardProps {
  id: string | number;
  imageUrl?: string;
  title: string;
  authorName: string;
  originalPrice: number;
  discountPrice?: number;
  rating?: number;
  reviewCount?: number;
}

const BookCard = ({
  id,
  imageUrl,
  title,
  authorName,
  originalPrice,
  discountPrice,
  rating,
  reviewCount,
}: BookCardProps) => {
  const placeholderImage = 'https://picsum.photos/200/300';
  return (
    <Link
      to={`/product/${id}`}
      params={{ id }}
      className="group block h-299px bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative aspect-[2/3] bg-gray-200">
        <img
          src={imageUrl || placeholderImage}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <div className="p-4">
          <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-blue-700 transition-colors">
            {title}
          </h3>
          <p className="text-gray-600 mt-1">by {authorName}</p>
          
          {rating !== undefined && (
            <div className="mt-2">
              <RatingStars rating={rating} reviewCount={reviewCount} />
            </div>
          )}

        </div>
          
        <div className="mt-auto flex items-center bg-gray-300 p-2 rounded-b-lg">
            {discountPrice ? (
              <>
                <span className="text-gray-400 line-through text-sm mr-2">
                  ${originalPrice}
                </span>
                <span className="text-red-600 font-bold">
                  ${discountPrice}
                </span>
              </>
            ) : (
              <span className="font-bold">${originalPrice}</span>
            )}
          </div>
      </div>
     
    </Link>
  );
};

export default BookCard;
