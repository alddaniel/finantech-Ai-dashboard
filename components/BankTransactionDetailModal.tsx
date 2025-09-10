
import React from 'react';
import type { BankTransaction, BankAccount } from '../types';
import { Badge } from './ui/Badge';

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="font-semibold text-gray-800 dark:text-gray-200">{value}</p>
    </div>
);

interface BankTransactionDetailModalProps {
    transaction: BankTransaction;
    account: BankAccount;
    onClose: () => void;
}

export const BankTransactionDetailModal: React.FC<BankTransactionDetailModalProps> = ({ transaction, account, onClose }) => {
    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-lg my-8"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
                    <h2 id="modal-title" className="text-xl font-bold text-gray-900 dark:text-white">Detalhes da Transação Bancária</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="pb-4 border-b border-gray-200/50 dark:border-gray-800/50">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Descrição no Extrato</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{transaction.description}</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <DetailItem 
                            label="Valor" 
                            value={
                                <span className={transaction.type === 'credit' ? 'text-green-500' : 'text-red-500'}>
                                    {transaction.type === 'credit' ? '+' : '-'} {formatCurrency(transaction.amount)}
                                </span>
                            } 
                        />
                        <DetailItem label="Data" value={formatDate(transaction.date)} />
                        <DetailItem label="Tipo" value={<span className="capitalize">{transaction.type === 'credit' ? 'Crédito' : 'Débito'}</span>} />
                        <DetailItem label="Conta Bancária" value={`${account.name} (Ag: ${account.agency} / Cc: ${account.account})`} />
                    </div>
                </div>
                <div className="px-6 py-3 flex justify-end border-t border-slate-200 dark:border-slate-800">
                    <button
                        onClick={onClose}
                        className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};