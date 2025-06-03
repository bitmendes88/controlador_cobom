
import React from 'react';

interface DjIconProps {
  className?: string;
}

export const DjIcon = ({ className = "w-4 h-4" }: DjIconProps) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" r="3" />
      <circle cx="16" cy="8" r="3" />
      <path d="M4 12h16v8H4z" />
      <path d="M8 16h8v2H8z" />
      <text x="12" y="18" fontSize="6" textAnchor="middle" fill="white" fontWeight="bold">DJ</text>
    </svg>
  );
};
