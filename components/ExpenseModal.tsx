
import React, { useState, useEffect } from 'react';
import type { Transaction, Contact } from '../types';
import { MOCK_PAYMENT_CATEGORIES, MOCK_COST_CENTERS, MOCK_PAYMENT_METHODS, MOCK_BANK_ACCOUNTS } from '../constants';

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (expense: Transaction) => void;
    expenseToEdit: Transaction | null;
    selectedCompany: string;
    contacts: Contact[];
}

const inputStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";
const selectStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 pl-3 pr-10 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";
const checkboxLabelStyle = "flex items-center text-sm font-medium text-slate-700 dark:text-slate-300";
const checkboxStyle = "h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500";


export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, onSave, expenseToEdit, selectedCompany, contacts }) => {
    
    const getInitialState = (): Transaction => {
        const defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + 7);
        const defaultDueDateStr = defaultDueDate.toISOString().split('T')[0];

        if (expenseToEdit) {
            // Data in storage can be YYYY-MM-DD or DD/MM/YYYY. Input needs YYYY-MM-DD.
            const convertToInputDate = (dateStr: string | undefined): string | undefined => {
                if (!dateStr) return undefined;
                if (dateStr.includes('/')) {
                    const [day, month, year] = dateStr.split('/');
                    return `${year}-${month}-${day}`;
                }
                return dateStr; // Assume it's already YYYY-MM-DD
            };
            
            return {
                ...expenseToEdit,
                dueDate: convertToInputDate(expenseToEdit.dueDate) || defaultDueDateStr,
                paymentDate: convertToInputDate(expenseToEdit.paymentDate)
            };
        }

        return {
            id: '',
            description: '',
            category: MOCK_PAYMENT_CATEGORIES[0],
            amount: 0,
            dueDate: defaultDueDateStr,
            status: 'Pendente',
            type: 'despesa',
            company: selectedCompany,
            costCenter: MOCK_COST_CENTERS[0],
            bankAccount: MOCK_BANK_ACCOUNTS.find(a => a.company === selectedCompany)?.id || '',
            paymentMethod: MOCK_PAYMENT_METHODS[0],
            fixedOrVariable: 'variável',
        };
    }
    
    const [formData, setFormData] = useState<Transaction>(getInitialState());
    const [hasRecurrence, setHasRecurrence] = useState(!!expenseToEdit?.recurrence);
    const [hasCharges, setHasCharges] = useState(!!expenseToEdit?.interestRate || !!expenseToEdit?.fineRate);


    useEffect(() => {
        setFormData(getInitialState());
        setHasRecurrence(!!expenseToEdit?.recurrence);
        setHasCharges(!!expenseToEdit?.interestRate || !!expenseToEdit?.fineRate);
    }, [expenseToEdit, isOpen, selectedCompany]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if(type === 'number') {
             setFormData(prev => ({
                ...prev,
                [name]: parseFloat(value) || 0,
            }));
        } else {
             setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleRecurrenceChange = <K extends keyof NonNullable<Transaction['recurrence']>>(
        field: K,
        value: NonNullable<Transaction['recurrence']>[K]
    ) => {
        setFormData(p => ({
            ...p,
            recurrence: {
                ...p.recurrence,
                interval: 'monthly', // default
                [field]: value,
            },
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const finalData = { ...formData };
        if (!hasRecurrence) {
            delete finalData.recurrence;
        }
        if (!hasCharges) {
            delete finalData.interestRate;
            delete finalData.interestType;
            delete finalData.fineRate;
        }
        
        onSave(finalData);
        onClose();
    };

    if (!isOpen) return null;

    const companySuppliers = contacts.filter(c => c.type === 'Fornecedor' && c.company === selectedCompany);
    const companyBankAccounts = MOCK_BANK_ACCOUNTS.filter(a => a.company === selectedCompany);

    return (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {expenseToEdit ? 'Editar Despesa' : 'Adicionar Nova Despesa'}
                        </h2>
                    </div>
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Descrição</label>
                            <input type="text" name="description" id="description" value={formData.description} onChange={handleChange} required className={inputStyle} />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Valor (R$)</label>
                                <input type="number" step="0.01" name="amount" id="amount" value={formData.amount} onChange={handleChange} required className={inputStyle} />
                            </div>
                             <div>
                                <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data de Vencimento</label>
                                <input type="date" name="dueDate" id="dueDate" value={formData.dueDate} onChange={handleChange} required className={inputStyle} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Categoria</label>
                                <select name="category" id="category" value={formData.category} onChange={handleChange} required className={selectStyle}>
                                    {MOCK_PAYMENT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="contactId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fornecedor (Opcional)</label>
                                <select name="contactId" id="contactId" value={formData.contactId} onChange={handleChange} className={selectStyle}>
                                    <option value="">Nenhum</option>
                                    {companySuppliers.map(sup => <option key={sup.id} value={sup.id}>{sup.name}</option>)}
                                </select>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="paymentMethod" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Forma de Pagamento</label>
                                <select name="paymentMethod" id="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className={selectStyle}>
                                     {MOCK_PAYMENT_METHODS.map(pm => <option key={pm} value={pm}>{pm}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="costCenter" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Centro de Custo</label>
                                <select name="costCenter" id="costCenter" value={formData.costCenter} onChange={handleChange} className={selectStyle}>
                                     {MOCK_COST_CENTERS.map(cc => <option key={cc} value={cc}>{cc}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="bankAccount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Conta p/ Débito</label>
                                <select name="bankAccount" id="bankAccount" value={formData.bankAccount} onChange={handleChange} className={selectStyle}>
                                    <option value="">Não especificada</option>
                                    {companyBankAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                                </select>
                            </div>
                        </div>

                         <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tipo de Despesa</label>
                                <div className="flex gap-4">
                                    <label className={checkboxLabelStyle}><input type="radio" name="fixedOrVariable" value="fixa" checked={formData.fixedOrVariable === 'fixa'} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" /> <span className="ml-2">Fixa</span></label>
                                    <label className={checkboxLabelStyle}><input type="radio" name="fixedOrVariable" value="variável" checked={formData.fixedOrVariable === 'variável'} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" /> <span className="ml-2">Variável</span></label>
                                </div>
                            </div>
                            
                            <div className={checkboxLabelStyle}>
                                <input type="checkbox" checked={hasRecurrence} onChange={e => setHasRecurrence(e.target.checked)} className={checkboxStyle} />
                                <span className="ml-2">Esta despesa é recorrente?</span>
                            </div>
                            {hasRecurrence && (
                                <div className="grid grid-cols-2 gap-4 pl-6">
                                     <div>
                                        <label htmlFor="recurrence-interval" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Frequência</label>
                                        <select id="recurrence-interval" value={formData.recurrence?.interval || 'monthly'} onChange={e => handleRecurrenceChange('interval', e.target.value as 'monthly' | 'yearly')} className={selectStyle}>
                                            <option value="monthly">Mensal</option>
                                            <option value="yearly">Anual</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="recurrence-endDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data Final (Opcional)</label>
                                        <input type="date" id="recurrence-endDate" value={formData.recurrence?.endDate || ''} onChange={e => handleRecurrenceChange('endDate', e.target.value)} className={inputStyle} />
                                    </div>
                                </div>
                            )}

                            <div className={checkboxLabelStyle}>
                                <input type="checkbox" checked={hasCharges} onChange={e => setHasCharges(e.target.checked)} className={checkboxStyle} />
                                <span className="ml-2">Possui encargos por atraso (juros/multa)?</span>
                            </div>
                            {hasCharges && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="interestRate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Taxa de Juros (%)</label>
                                            <input type="number" step="0.01" name="interestRate" id="interestRate" value={formData.interestRate || ''} onChange={handleChange} className={inputStyle} />
                                        </div>
                                        <div>
                                            <label htmlFor="interestType" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Juros</label>
                                            <select name="interestType" id="interestType" value={formData.interestType || 'daily'} onChange={handleChange} className={selectStyle}>
                                                <option value="daily">Ao dia</option>
                                                <option value="monthly">Ao mês</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="fineRate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Taxa de Multa (%)</label>
                                        <input type="number" step="0.01" name="fineRate" id="fineRate" value={formData.fineRate || ''} onChange={handleChange} placeholder="Ex: 2" className={inputStyle} />
                                    </div>
                                </div>
                            )}

                         </div>
                    </div>
                    <div className="px-6 py-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                        <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors">
                            Salvar Despesa
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
