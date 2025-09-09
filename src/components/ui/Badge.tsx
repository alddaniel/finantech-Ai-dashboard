
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color: 'green' | 'yellow' | 'red' | 'indigo' | 'purple' | 'blue';
}

export const Badge: React.FC<BadgeProps> = ({ children, color }) => {
  const colorClasses = {
    green: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400',
    red: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  };

  return (
    <span
      className={`px-2.5 py-1 text-[11px] font-semibold rounded-full ${colorClasses[color]}`}
    >
      {children}
    </span>
  );
};