
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg rounded-xl shadow-lg dark:shadow-black/40 border border-slate-200 dark:border-slate-800 ${className}`}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
    return <div className={`p-6 pb-4 border-b border-slate-200 dark:border-slate-800 ${className}`}>{children}</div>;
}

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
    return <div className={`p-6 ${className}`}>{children}</div>;
}