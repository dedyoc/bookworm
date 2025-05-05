import { AspectRatio } from '@radix-ui/react-aspect-ratio';
import { Link } from '@tanstack/react-router';
import defaultImage from '@/assets/default-cover.jpg';
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
}: BookCardProps) => {
  return (
    <Link
      to={`/product/${id}`}
      params={{ id: String(id) }}
      className="group flex flex-col h-full shadow-sm bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <AspectRatio ratio={2 / 3} className="w-full">
        <img
          src={imageUrl || defaultImage}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
      </AspectRatio>
      <div className="flex flex-col flex-grow">
        <div className="p-4 flex-grow">
          <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-blue-700 transition-colors">
            {title}
          </h3>
          <p className="text-gray-600 mt-1 text-sm line-clamp-1">by {authorName}</p>
        </div>

        <div className="flex items-center bg-gray-100 p-2 rounded-b-lg border-t border-gray-200">
          {discountPrice ? (
            <>
              <span className="text-gray-500 line-through text-sm mr-2">
                ${parseFloat(originalPrice.toString()).toFixed(2)}
              </span>
              <span className="text-red-600 font-bold">
                ${parseFloat(discountPrice.toString()).toFixed(2)}
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
