import React from 'react';

// --- Professional Photo Avatars for Contacts ---
export const CONTACT_AVATARS: string[] = [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1619895862022-09114b41f16f?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=400&auto=format&fit=crop',
];

// --- Professional Photo Avatars for Companies ---
export const COMPANY_AVATARS: string[] = [
    'https://images.unsplash.com/photo-1484417894907-623942c8ee29?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1496247749665-49cf5b1022e5?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1554672408-730436b60dde?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1559526324-593bc0a63dae?q=80&w=400&auto=format&fit=crop',
];

// --- Photo-based "Avatars" for Properties ---
export const PROPERTY_AVATARS: string[] = [
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=400&auto=format&fit=crop', // Modern House
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=400&auto=format&fit=crop', // House with Pool
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=400&auto=format&fit=crop', // Large Modern House
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=400&auto=format&fit=crop', // White Suburban House
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop', // House with Front Yard
    'https://images.unsplash.com/photo-1598228723793-52759bba239c?q=80&w=400&auto=format&fit=crop', // Modern Apartment Building
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=400&auto=format&fit=crop', // Apartment Interior
    'https://images.unsplash.com/photo-1494203484021-3c454daf695d?q=80&w=400&auto=format&fit=crop', // City Apartment Buildings
    'https://images.unsplash.com/photo-1542314831-068cd1dbb563?q=80&w=400&auto=format&fit=crop', // Commercial Building/Hotel
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=400&auto=format&fit=crop', // Large Estate House
];


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