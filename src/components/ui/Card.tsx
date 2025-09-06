import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ className = '', children, ...props }) => {
  return (
    <div
      className={`card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`pb-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<CardProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`pt-4 flex gap-2 ${className}`} {...props}>
      {children}
    </div>
  );
};