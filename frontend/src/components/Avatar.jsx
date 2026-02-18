import React from 'react';

const Avatar = ({
  src,
  alt = '',
  size = 'md',
  fallback,
  className = '',
  ...props
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={`relative rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg ${sizes[size]} ${className}`}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-gray-600 dark:text-gray-300 font-medium text-sm">
          {fallback ? getInitials(fallback) : '?'}
        </span>
      )}
    </div>
  );
};

export default Avatar;