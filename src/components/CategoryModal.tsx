import React, { useState, useEffect } from 'react';
import type { Category } from '../types';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { name: string; }) => void;
    categoryToEdit: Omit<Category, 'type' | 'company'> | null;
    categoryType: 'receita' | 'despesa';
}

const inputStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSave, categoryToEdit, categoryType }) => {
    const [name, setName] = useState('');

    useEffect(() => {
        if (categoryToEdit) {
            setName(categoryToEdit.name);
        } else {
            setName('');
        }
    }, [categoryToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert("O nome da categoria é obrigatório.");
            return;
        }
        onSave({ name });
        onClose();
    };

    if (!isOpen) return null;
    
    const title = `${categoryToEdit ? 'Editar' : 'Adicionar'} Categoria de ${categoryType === 'receita' ? 'Receita' : 'Despesa'}`;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                           {title}
                        </h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome da Categoria</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className={inputStyle}
                            />
                        </div>
                    </div>
                    <div className="px-6 py-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                        <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors">
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
