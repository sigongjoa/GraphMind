import React, { ReactNode } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  fluid?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  as: Component = 'div',
  fluid = false,
  maxWidth = 'xl',
}) => {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
    none: '',
  };

  const containerClasses = `
    ${fluid ? 'w-full' : 'px-4 sm:px-6 md:px-8'} 
    ${maxWidth !== 'none' ? maxWidthClasses[maxWidth] : ''} 
    mx-auto 
    ${className}
  `;

  return <Component className={containerClasses}>{children}</Component>;
};

export default ResponsiveContainer;