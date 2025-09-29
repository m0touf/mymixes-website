interface StarRatingProps {
  rating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

export function StarRating({ rating, size = 'sm', showNumber = true }: StarRatingProps) {
  if (!rating || rating === 0) {
    return (
      <div className="flex items-center gap-1">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star key={i} filled={false} size={size} />
          ))}
        </div>
        {showNumber && (
          <span className="text-xs text-gray-500 ml-1">No rating</span>
        )}
      </div>
    );
  }

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} filled={true} size={size} />
        ))}
        {/* Half star */}
        {hasHalfStar && (
          <Star key="half" filled={true} half={true} size={size} />
        )}
        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} filled={false} size={size} />
        ))}
      </div>
      {showNumber && (
        <span className="text-xs text-gray-400 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

interface StarProps {
  filled: boolean;
  half?: boolean;
  size: 'sm' | 'md' | 'lg';
}

function Star({ filled, half = false, size }: StarProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const baseClasses = `${sizeClasses[size]} transition-colors`;
  
  if (filled && !half) {
    return (
      <svg
        className={`${baseClasses} text-pink-500`}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );
  }

  if (filled && half) {
    return (
      <div className="relative">
        {/* Empty star background */}
        <svg
          className={`${baseClasses} text-gray-600`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        {/* Half filled star overlay */}
        <svg
          className={`${baseClasses} text-pink-500 absolute top-0 left-0 overflow-hidden`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          style={{ clipPath: 'inset(0 50% 0 0)' }}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </div>
    );
  }

  // Empty star
  return (
    <svg
      className={`${baseClasses} text-gray-600`}
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}
