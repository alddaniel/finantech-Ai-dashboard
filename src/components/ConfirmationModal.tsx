import React from 'react';
import { AlertTriangleIcon } from './ui/IconComponents';
import { Spinner } from './ui/Spinner';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
    isConfirming?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, children, isConfirming = false }) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        // The parent component is now responsible for closing the modal
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                            <AlertTriangleIcon />
                        </div>
                        <div className="mt-0 text-left flex-1">
                            <h3 className="text-lg leading-6 font-bold text-slate-900 dark:text-white" id="modal-title">
                                {title}
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {children}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isConfirming}
                        className="w-full sm:w-auto bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isConfirming}
                        className="w-full sm:w-auto bg-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-red-700 transition-colors flex items-center justify-center disabled:bg-red-400"
                    >
                        {isConfirming ? <Spinner className="w-5 h-5" /> : 'Excluir'}
                    </button>
                </div>
            </div>
        </div>
    );
};