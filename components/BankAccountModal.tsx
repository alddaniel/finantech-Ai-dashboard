
import React, { useState, useEffect } from 'react';
import type { BankAccount } from '../types';
import { MOCK_BANKS } from '../constants';

interface BankAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (account: BankAccount) => void;
    accountToEdit: BankAccount | null;
    selectedCompany: string;
}

const defaultAccount: Omit<BankAccount, 'id' | 'company' | 'logoUrl'> = {
    name: '',
    agency: '',
    account: '',
    balance: 0,
};

const inputStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";
const selectStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 pl-3 pr-10 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";


export const BankAccountModal: React.FC<BankAccountModalProps> = ({ isOpen, onClose, onSave, accountToEdit, selectedCompany }) => {
    const [formData, setFormData] = useState<Omit<BankAccount, 'id' | 'company' | 'logoUrl'> & { id?: string }>(defaultAccount);

    useEffect(() => {
        if (accountToEdit) {
            setFormData(accountToEdit);
        } else {
            setFormData(defaultAccount);
        }
    }, [accountToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? parseFloat(value) || 0 : value 
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const logoName = formData.name.split(' ')[0].toLowerCase().replace('.', '')
        const bankData: BankAccount = {
            id: formData.id || '',
            name: formData.name,
            agency: formData.agency,
            account: formData.account,
            balance: formData.balance,
            logoUrl: `https://logo.clearbit.com/${logoName}.com.br`,
            company: selectedCompany,
        };
        onSave(bankData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {accountToEdit ? 'Editar Conta Bancária' : 'Adicionar Nova Conta'}
                        </h2>
                    </div>
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome do Banco</label>
                            <select name="name" id="name" value={formData.name} onChange={handleChange} required className={selectStyle}>
                                <option value="">Selecione um banco</option>
                                {MOCK_BANKS.map(bank => <option key={bank} value={bank}>{bank}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="agency" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Agência</label>
                                <input type="text" name="agency" id="agency" value={formData.agency} onChange={handleChange} required className={inputStyle} />
                            </div>
                            <div>
                                <label htmlFor="account" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Número da Conta</label>
                                <input type="text" name="account" id="account" value={formData.account} onChange={handleChange} required className={inputStyle} />
                            </div>
                        </div>
                         <div>
                            <label htmlFor="balance" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Saldo Inicial</label>
                            <input type="number" step="0.01" name="balance" id="balance" value={formData.balance} onChange={handleChange} required className={inputStyle} />
                        </div>
                    </div>
                    <div className="px-6 py-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                        <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
                            Salvar Conta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
