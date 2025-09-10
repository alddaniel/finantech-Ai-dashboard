
import React, { useMemo } from 'react';
import { Card, CardContent } from './ui/Card';
import type { Transaction, Category } from '../types';

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

interface DREReportProps {
    payables: Transaction[];
    receivables: Transaction[];
    categories: Category[];
}

const ReportRow: React.FC<{ label: string; value: number; isTotal?: boolean; isSub?: boolean; isNegative?: boolean }> = ({ label, value, isTotal = false, isSub = false, isNegative = true }) => {
    const valueColor = value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500';
    const sign = isNegative ? '(-)' : '(+)';
    const finalValue = isNegative ? -value : value;

    return (
        <tr className={isTotal ? 'border-t-2 border-slate-300 dark:border-slate-700 font-bold' : ''}>
            <td className={`py-2 px-4 ${isSub ? 'pl-8' : ''}`}>{label}</td>
            <td className={`py-2 px-4 text-right ${isTotal ? valueColor : ''}`}>
                {isSub ? `${sign} ${formatCurrency(finalValue)}` : formatCurrency(value)}
            </td>
        </tr>
    );
};


export const DREReport: React.FC<DREReportProps> = ({ payables, receivables, categories }) => {
    const dreData = useMemo(() => {
        const revenueByCategory = receivables
            .filter(t => t.status === 'Pago')
            .reduce((acc, t) => {
                const key = t.category || 'Outras Receitas';
                acc[key] = (acc[key] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        const totalRevenue = Object.values(revenueByCategory).reduce((sum, val) => sum + val, 0);

        const expenseByCategory = payables
            .filter(t => t.status === 'Pago')
            .reduce((acc, t) => {
                const key = t.category || 'Outras Despesas';
                acc[key] = (acc[key] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);
            
        const totalExpense = Object.values(expenseByCategory).reduce((sum, val) => sum + val, 0);

        const netResult = totalRevenue - totalExpense;

        return {
            revenueByCategory,
            totalRevenue,
            expenseByCategory,
            totalExpense,
            netResult,
        };
    }, [payables, receivables]);

    return (
        <Card>
            <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-center mb-2">Demonstração do Resultado do Exercício (DRE)</h2>
                <p className="text-center text-slate-500 dark:text-slate-400 mb-6">Regime de Caixa (Valores Realizados)</p>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <tbody>
                            <ReportRow label="(=) RECEITA OPERACIONAL BRUTA" value={dreData.totalRevenue} isNegative={false} />
                            {Object.entries(dreData.revenueByCategory).map(([category, value]) => (
                                <ReportRow key={category} label={category} value={value} isSub isNegative={false} />
                            ))}

                            <ReportRow label="(-) DESPESAS OPERACIONAIS" value={-dreData.totalExpense} />
                            {Object.entries(dreData.expenseByCategory).map(([category, value]) => (
                                <ReportRow key={category} label={category} value={value} isSub />
                            ))}
                            
                            <ReportRow label="(=) RESULTADO LÍQUIDO DO EXERCÍCIO" value={dreData.netResult} isTotal />
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};
