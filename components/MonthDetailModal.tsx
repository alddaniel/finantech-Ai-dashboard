
import React, { useMemo } from 'react';
import type { Transaction } from '../types';
import { Badge } from './ui/Badge';

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    // Handles both DD/MM/YYYY and YYYY-MM-DD, returns DD/MM/YYYY
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const parts = dateString.split('-');
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return dateString;
    }
    return dateString;
};

const parseDate = (dateStr: string): Date => {
    let date;
    // Check for DD/MM/YYYY format
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3 && parts[2].length === 4) {
            // new Date(year, monthIndex, day)
            date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        }
    } else if (dateStr.includes('-')) { // Check for YYYY-MM-DD format
        const parts = dateStr.split('-');
        if (parts.length === 3 && parts[0].length === 4) {
           date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        }
    }
    // Return an invalid date if parsing failed or format is unexpected
    if (date && !isNaN(date.getTime())) {
        return date;
    }
    return new Date(NaN);
};

const getStatusColor = (status: Transaction['status']): 'green' | 'yellow' | 'red' | 'blue' => {
    switch (status) {
        case 'Pago': return 'green';
        case 'Pendente': return 'yellow';
        case 'Vencido': return 'red';
        case 'Agendado': return 'blue';
    }
};

interface MonthDetailModalProps {
    monthKey: string; // 'YYYY-MM'
    monthLabel: string;
    payables: Transaction[];
    receivables: Transaction[];
    selectedCompany: string;
    onClose: () => void;
}

export const MonthDetailModal: React.FC<MonthDetailModalProps> = ({ monthKey, monthLabel, payables, receivables, selectedCompany, onClose }) => {
    const transactions = useMemo(() => {
        const allCompanyTxs = [
            ...payables.filter(t => t.company === selectedCompany && t.status === 'Pago'),
            ...receivables.filter(t => t.company === selectedCompany && t.status === 'Pago'),
        ];
        
        return allCompanyTxs.filter(t => {
            if (!t.paymentDate) return false;
            const paymentDate = parseDate(t.paymentDate);
            if(isNaN(paymentDate.getTime())) return false;

            const txMonthKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
            return txMonthKey === monthKey;
        }).sort((a, b) => parseDate(b.paymentDate!).getTime() - parseDate(a.paymentDate!).getTime());
    }, [monthKey, payables, receivables, selectedCompany]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose} role="dialog">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-4xl my-8" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                        Detalhes para {monthLabel}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Descrição</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data Pagto.</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900">
                                {transactions.map((transaction) => (
                                    <tr key={transaction.id} className="even:bg-gray-50 dark:even:bg-gray-800/50">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{transaction.description}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(transaction.paymentDate)}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.type === 'receita' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                                                {transaction.type === 'receita' ? 'Receita' : 'Despesa'}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 font-semibold text-sm ${transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(transaction.amount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge color={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {transactions.length === 0 && <p className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhuma transação paga encontrada para este mês.</p>}
                    </div>
                </div>
                <div className="px-6 py-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};
