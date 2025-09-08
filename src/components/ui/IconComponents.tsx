import React from 'react';

// --- Professional Photo Avatars for Contacts ---
export const IconDisplay: React.FC<{ iconName?: string; className?: string; shape?: 'circle' | 'square' }> = ({ iconName, className, shape = 'circle' }) => {
    const isUrl = iconName && (iconName.startsWith('http') || iconName.startsWith('data:image'));
    const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg';
    
    if (isUrl) {
        return <img src={iconName} alt="Avatar" className={`${className} object-cover ${shapeClass}`} />;
    }

    // Fallback for missing icon.
    return (
        <div className={`${className} bg-slate-200 dark:bg-slate-700 ${shapeClass} flex items-center justify-center`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4/6 h-4/6 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
    );
};

export const AlertTriangleIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6 text-red-600" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);