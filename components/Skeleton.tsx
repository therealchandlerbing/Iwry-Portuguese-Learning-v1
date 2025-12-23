import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'text' }) => {
  const baseClass = 'animate-pulse bg-slate-200 rounded';
  const variantClass = {
    text: 'h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-xl'
  };

  return (
    <div
      className={`${baseClass} ${variantClass[variant]} ${className}`}
      role="status"
      aria-label="Carregando..."
    />
  );
};

export default Skeleton;
