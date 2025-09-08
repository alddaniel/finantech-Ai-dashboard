import React, { useState, useEffect } from 'react';
import type { CostCenter } from '../types';

interface CostCenterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { name: string; description: string; budget?: number; }) => void;
    centerToEdit: CostCenter | null;
}

const inputStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";
const textareaStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";

// --- Currency Formatting Utilities ---
const formatCurrencyOnInput = (value: string): string => {
  if (!value) return '';
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly.length === 0) return '';
  const numberValue = parseFloat(digitsOnly) / 100;
  return numberValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const parseFormattedCurrency = (value: string): number => {
    if (typeof value !== 'string' || !value) return 0;
    const cleanedValue = value.replace(/R\$\s?/, '').replace(/\./g, '');
    const numericString = cleanedValue.replace(',', '.');
    return parseFloat(numericString) || 0;
};
// --- End Currency Formatting Utilities ---

export const CostCenterModal: React.FC<CostCenterModalProps> = ({ isOpen, onClose, onSave, centerToEdit }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [budgetString, setBudgetString] = useState('');

    useEffect(() => {
        if (centerToEdit) {
            setName(centerToEdit.name);
            setDescription(centerToEdit.description || '');
            setBudgetString(centerToEdit.budget ? centerToEdit.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '');
        } else {
            setName('');
            setDescription('');
            setBudgetString('');
        }
    }, [centerToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ 
            name,
            description,
            budget: parseFormattedCurrency(budgetString) || undefined
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {centerToEdit ? 'Editar Centro de Custo' : 'Adicionar Centro de Custo'}
                        </h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome do Centro de Custo</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className={inputStyle}
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Descrição</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                rows={3}
                                className={textareaStyle}
                            />
                        </div>
                        <div>
                            <label htmlFor="budget" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Orçamento Mensal (Valor)</label>
                             <input
                                type="text"
                                inputMode="decimal"
                                id="budget"
                                value={budgetString}
                                onChange={(e) => setBudgetString(formatCurrencyOnInput(e.target.value))}
                                className={inputStyle}
                                placeholder="0,00"
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