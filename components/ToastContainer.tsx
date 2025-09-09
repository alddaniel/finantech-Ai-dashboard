
import React, { useEffect } from 'react';
import type { ToastMessage } from '../types';

interface ToastContainerProps {
    toasts: ToastMessage[];
    onDismiss: (id: number) => void;
}

const Toast: React.FC<{ toast: ToastMessage; onDismiss: (id: number) => void }> = ({ toast, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(toast.id);
        }, 5000); // Auto-dismiss after 5 seconds

        return () => {
            clearTimeout(timer);
        };
    }, [toast.id, onDismiss]);

    const iconColor = {
        info: 'text-blue-500',
        success: 'text-green-500',
        warning: 'text-yellow-500',
    };

    const Icon = () => {
        switch (toast.type) {
            case 'info':
                return <svg className={`w-6 h-6 ${iconColor[toast.type]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
            case 'success':
                return <svg className={`w-6 h-6 ${iconColor[toast.type]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
            case 'warning':
                return <svg className={`w-6 h-6 ${iconColor[toast.type]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>;
            default:
                return null;
        }
    };

    return (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl w-full max-w-sm rounded-xl shadow-lg ring-1 ring-slate-900/5 dark:ring-white/10 overflow-hidden m-2 animate-fade-in-up">
            <div className="flex p-4">
                <div className="flex-shrink-0">
                    <Icon />
                </div>
                <div className="ml-3 w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{toast.title}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{toast.description}</p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                    <button
                        onClick={() => onDismiss(toast.id)}
                        className="inline-flex rounded-md text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};


export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
    return (
        <div
            aria-live="assertive"
            className="fixed inset-0 flex items-end justify-end px-4 py-6 pointer-events-none sm:p-6 z-[100]"
        >
            <div className="w-full flex flex-col items-center sm:items-end">
                {toasts.map((toast) => (
                    <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
                ))}
            </div>
            <style>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
