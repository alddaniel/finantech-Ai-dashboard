
import React, { useMemo } from 'react';
import { Card, CardContent } from './ui/Card';
import type { Transaction, BankAccount } from '../types';

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

interface BalanceteReportProps {
    payables: Transaction[];
    receivables: Transaction[];
    bankAccounts: BankAccount[];
}

const ReportRow: React.FC<{ account: string; debit?: number; credit?: number; isTotal?: boolean }> = ({ account, debit, credit, isTotal = false }) => (
    <tr className={`border-b border-slate-200 dark:border-slate-800 ${isTotal ? 'font-bold bg-slate-100 dark:bg-slate-800' : ''}`}>
        <td className="py-2 px-4">{account}</td>
        <td className="py-2 px-4 text-right">{debit ? formatCurrency(debit) : '-'}</td>
        <td className="py-2 px-4 text-right">{credit ? formatCurrency(credit) : '-'}</td>
    </tr>
);

export const BalanceteReport: React.FC<BalanceteReportProps> = ({ payables, receivables, bankAccounts }) => {
    const balanceteData = useMemo(() => {
        // ATIVOS (Débito)
        const totalBankBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
        const totalReceivables = receivables.filter(t => t.status === 'Pendente' || t.status === 'Vencido').reduce((sum, t) => sum + t.amount, 0);
        
        // PASSIVOS (Crédito)
        const totalPayables = payables.filter(t => t.status === 'Pendente' || t.status === 'Vencido').reduce((sum, t) => sum + t.amount, 0);

        // PATRIMÔNIO LÍQUIDO (Crédito)
        const totalRevenueRealized = receivables.filter(t => t.status === 'Pago').reduce((sum, t) => sum + t.amount, 0);
        const totalExpenseRealized = payables.filter(t => t.status === 'Pago').reduce((sum, t) => sum + t.amount, 0);
        const netResult = totalRevenueRealized - totalExpenseRealized;
        
        // Ajuste para fechar o balanço. A diferença é o capital social/lucros retidos.
        const capitalSocial = (totalBankBalance + totalReceivables) - (totalPayables + netResult);

        const debits = [
            { account: 'Caixa e Equivalentes', value: totalBankBalance },
            { account: 'Contas a Receber', value: totalReceivables },
        ];
        
        const credits = [
            { account: 'Contas a Pagar', value: totalPayables },
            { account: 'Resultado do Período', value: netResult },
            { account: 'Capital Social / Lucros Retidos', value: capitalSocial },
        ];

        const totalDebits = debits.reduce((sum, item) => sum + item.value, 0);
        const totalCredits = credits.reduce((sum, item) => sum + item.value, 0);
        
        // Simple balance adjustment if totals do not match
        if (totalDebits !== totalCredits) {
            const difference = totalDebits - totalCredits;
            const capitalItem = credits.find(c => c.account === 'Capital Social / Lucros Retidos');
            if(capitalItem) {
                capitalItem.value += difference;
            }
        }

        return {
            debits,
            credits,
            totalDebits: credits.reduce((sum, item) => sum + item.value, 0), // Use final credit total for balance
            totalCredits: credits.reduce((sum, item) => sum + item.value, 0),
        };
    }, [payables, receivables, bankAccounts]);

    return (
        <Card>
            <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-center mb-2">Balancete de Verificação (Simulado)</h2>
                <p className="text-center text-slate-500 dark:text-slate-400 mb-6">Balanço baseado em contas a pagar/receber e saldos bancários.</p>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="py-2 px-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">Conta</th>
                                <th className="py-2 px-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">Débito</th>
                                <th className="py-2 px-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">Crédito</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colSpan={3} className="py-2 px-4 font-bold bg-slate-100 dark:bg-slate-800">Ativos</td></tr>
                            {balanceteData.debits.map(item => <ReportRow key={item.account} account={item.account} debit={item.value} />)}
                            
                            <tr><td colSpan={3} className="py-2 px-4 font-bold bg-slate-100 dark:bg-slate-800">Passivos e Patrimônio Líquido</td></tr>
                            {balanceteData.credits.map(item => <ReportRow key={item.account} account={item.account} credit={item.value} />)}
                            
                            <ReportRow account="TOTAIS" debit={balanceteData.totalDebits} credit={balanceteData.totalCredits} isTotal />
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};
