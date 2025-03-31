// 공통 컴포넌트: Card.tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  footer?: React.ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  className = '',
  footer,
  onClick,
  hoverable = false
}) => {
  const hoverClass = hoverable ? 'hover:shadow-lg transition-shadow cursor-pointer' : '';
  const clickProps = onClick ? { onClick } : {};
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden ${hoverClass} ${className}`}
      {...clickProps}
    >
      {title && (
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
