
import React from 'react';

interface DIconProps {
  className?: string;
}

export const DIcon = ({ className = "w-4 h-4" }: DIconProps) => {
  return (
    <div 
      className={`${className} bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs`}
      style={{ minWidth: '16px', minHeight: '16px' }}
    >
      D
    </div>
  );
};
