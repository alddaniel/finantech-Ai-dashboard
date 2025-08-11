
import React, { useMemo } from 'react';
import { Card, CardContent } from './ui/Card';
import type { Transaction } from '../types';

// Helper functions
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
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3 && parts[2].length === 4) {
            date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        }
    } else if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3 && parts[0].length === 4) {
           date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        }
    }
    if (date && !isNaN(date.getTime())) {
        return date;
    }
    return new Date(NaN);
};

const KPICard: React.FC<{title: string, value: string, colorClass: string}> = ({ title, value, colorClass }) => (
    <Card>
        <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <p className={`text-3xl font-bold ${colorClass} mt-1`}>{value}</p>
        </CardContent>
    </Card>
);

interface CashFlowRecordsProps {
    payables: Transaction[];
    receivables: Transaction[];
    selectedCompany: string;
}

export const CashFlowRecords: React.FC<CashFlowRecordsProps> = ({ payables, receivables, selectedCompany }) => {
    
    const paidTransactions = useMemo(() => {
        const companyTransactions = [
            ...payables.filter(t => t.company === selectedCompany && t.status === 'Pago' && t.paymentDate),
            ...receivables.filter(t => t.company === selectedCompany && t.status === 'Pago' && t.paymentDate)
        ];

        // Sort by paymentDate, most recent first
        return companyTransactions.sort((a, b) => {
            const dateA = a.paymentDate ? parseDate(a.paymentDate) : new Date(0);
            const dateB = b.paymentDate ? parseDate(b.paymentDate) : new Date(0);
            if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
            return dateB.getTime() - dateA.getTime();
        });
    }, [payables, receivables, selectedCompany]);

    const totals = useMemo(() => {
        const totalIncome = paidTransactions
            .filter(t => t.type === 'receita')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = paidTransactions
            .filter(t => t.type === 'despesa')
            .reduce((sum, t) => sum + t.amount, 0);

        const netBalance = totalIncome - totalExpenses;

        return { totalIncome, totalExpenses, netBalance };
    }, [paidTransactions]);


    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Registros do Fluxo de Caixa (Realizado)</h1>
                 <p className="text-lg text-gray-600 dark:text-gray-400">
                    Histórico de todas as movimentações financeiras efetivamente pagas para a empresa <span className="font-semibold text-indigo-500">{selectedCompany}</span>.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title="Total de Receitas (Pagas)" value={formatCurrency(totals.totalIncome)} colorClass="text-green-500" />
                <KPICard title="Total de Despesas (Pagas)" value={formatCurrency(totals.totalExpenses)} colorClass="text-red-500" />
                <KPICard title="Saldo Realizado" value={formatCurrency(totals.netBalance)} colorClass={totals.netBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-500'} />
            </div>

            <Card className="!p-0">
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Descrição</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data de Pagamento</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900">
                                {paidTransactions.map((transaction) => (
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {paidTransactions.length === 0 && <p className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum registro de caixa encontrado para esta empresa.</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
