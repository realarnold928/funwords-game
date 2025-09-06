import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  className = '',
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  ...props
}) => {
  const variantClass = variant === 'primary' ? 'btn-primary' : 
                      variant === 'secondary' ? 'btn-secondary' : 'btn-danger';
  const sizeClass = size === 'sm' ? 'btn-sm' : 
                    size === 'lg' ? 'btn-lg' : 'btn-md';

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Button clicked:', children);
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};