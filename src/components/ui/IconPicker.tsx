import React from 'react';

interface IconPickerProps {
    value?: string;
    onChange: (iconName: string) => void;
    avatars: string[];
}

export const IconPicker: React.FC<IconPickerProps> = ({ value, onChange, avatars }) => {
    return (
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 p-2 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            {avatars.map((url) => (
                <button
                    key={url}
                    type="button"
                    onClick={() => onChange(url)}
                    className={`flex items-center justify-center p-0.5 rounded-full transition-all duration-200 aspect-square ${
                        value === url
                            ? 'ring-2 ring-offset-2 ring-indigo-500 ring-offset-white dark:ring-offset-slate-900'
                            : 'hover:ring-2 hover:ring-indigo-300'
                    }`}
                    aria-label={`Select avatar`}
                    aria-pressed={value === url}
                >
                    <img src={url} alt="Avatar option" className="w-full h-full object-cover rounded-full" />
                </button>
            ))}
        </div>
    );
};