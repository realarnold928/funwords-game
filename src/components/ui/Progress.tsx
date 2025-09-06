import React from 'react';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max: number;
  color?: 'primary' | 'danger';
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max,
  color = 'primary',
  className = '',
  ...props
}) => {
  const percentage = Math.min(100, (value / max) * 100);
  
  const colorClass = color === 'primary' ? 'bg-primary' : 'bg-error';

  return (
    <div
      className={`w-full bg-gray-700 border-2 border-gray-600 h-4 ${className}`}
      {...props}
    >
      <div
        className={`h-4 transition-all duration-300 ${colorClass}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};