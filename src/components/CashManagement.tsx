import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { CashFlowChart } from './CashFlowChart';
import type { Transaction, CashFlowData } from '../types';
import { MonthDetailModal } from './MonthDetailModal';

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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

const KPICard: React.FC<{title: string, value: string, helpText?: string}> = ({ title, value, helpText }) => (
    <Card>
        <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            {helpText && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">{helpText}</p>}
        </CardContent>
    </Card>
);


interface CashManagementProps {
    selectedCompany: string;
    payables: Transaction[];
    receivables: Transaction[];
}

export const CashManagement: React.FC<CashManagementProps> = ({ selectedCompany, payables, receivables }) => {
    
    const [viewingMonth, setViewingMonth] = useState<{key: string; label: string;} | null>(null);

    const companyTransactions = useMemo(() => {
        return [
            ...payables.filter(t => t.company === selectedCompany && t.status === 'Pago' && t.paymentDate),
            ...receivables.filter(t => t.company === selectedCompany && t.status === 'Pago' && t.paymentDate)
        ];
    }, [payables, receivables, selectedCompany]);

    const transactionsByMonth = useMemo(() => {
        const monthYearFormatter = new Intl.DateTimeFormat('fr-CA', { year: 'numeric', month: '2-digit' });
        
        return companyTransactions.reduce((acc, transaction) => {
            const paymentDate = parseDate(transaction.paymentDate!);
            if (isNaN(paymentDate.getTime())) return acc;

            const key = monthYearFormatter.format(paymentDate);
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(transaction);
            return acc;
        }, {} as Record<string, Transaction[]>);
    }, [companyTransactions]);

    const sortedMonthKeys = useMemo(() => {
        return Object.keys(transactionsByMonth).sort().reverse();
    }, [transactionsByMonth]);
    
    const cashFlowData = useMemo((): CashFlowData[] => {
        const last6Months: { year: number; month: number; label: string }[] = [];
        const today = new Date();
        today.setDate(1); // Start from the beginning of the current month

        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            last6Months.push({
                year: date.getFullYear(),
                month: date.getMonth(),
                label: date.toLocaleString('pt-BR', { month: 'short' }).replace('.', '').toLocaleUpperCase(),
            });
        }
        
        let runningBalance = 0;

        const data = last6Months.map(monthInfo => {
            const monthlyReceitas = companyTransactions
                .filter(t => {
                    const paymentDate = parseDate(t.paymentDate!);
                    return t.type === 'receita' && paymentDate.getFullYear() === monthInfo.year && paymentDate.getMonth() === monthInfo.month;
                })
                .reduce((sum, t) => sum + t.amount, 0);

            const monthlyDespesas = companyTransactions
                .filter(t => {
                    const paymentDate = parseDate(t.paymentDate!);
                    return t.type === 'despesa' && paymentDate.getFullYear() === monthInfo.year && paymentDate.getMonth() === monthInfo.month;
                })
                .reduce((sum, t) => sum + t.amount, 0);
            
            runningBalance += monthlyReceitas - monthlyDespesas;

            return {
                month: monthInfo.label,
                receitas: monthlyReceitas,
                despesas: monthlyDespesas,
                saldo: runningBalance,
            };
        });

        const hasActivity = data.some(d => d.receitas > 0 || d.despesas > 0);
        return hasActivity ? data : [];

    }, [companyTransactions]);


    const kpiData = useMemo(() => {
        if (sortedMonthKeys.length === 0) {
            return { totalIncome: 0, totalExpenses: 0, netFlow: 0, kpiMonthLabel: 'Nenhum dado' };
        }

        const latestMonthKey = sortedMonthKeys[0];
        const [year, month] = latestMonthKey.split('-').map(Number);
        const kpiMonthLabel = new Date(year, month - 1).toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric',
        });

        const latestMonthTxs = transactionsByMonth[latestMonthKey];
        const totalIncome = latestMonthTxs.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = latestMonthTxs.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);
        const netFlow = totalIncome - totalExpenses;

        return { totalIncome, totalExpenses, netFlow, kpiMonthLabel };
    }, [sortedMonthKeys, transactionsByMonth]);
    
    const handleMonthClick = (monthKey: string) => {
        const [year, month] = monthKey.split('-').map(Number);
        const monthLabel = new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        setViewingMonth({ key: monthKey, label: monthLabel });
    };

    return (
        <>
            <div className="space-y-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestão de Caixa</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Acompanhe o fluxo de entradas e saídas realizadas para ter uma visão clara da sua saúde financeira.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KPICard title="Entradas" value={formatCurrency(kpiData.totalIncome)} helpText={`Mês de ${kpiData.kpiMonthLabel}`} />
                    <KPICard title="Saídas" value={formatCurrency(kpiData.totalExpenses)} helpText={`Mês de ${kpiData.kpiMonthLabel}`} />
                    <KPICard title="Saldo" value={formatCurrency(kpiData.netFlow)} helpText={`Resultado para ${kpiData.kpiMonthLabel}`} />
                </div>
                
                <Card>
                    <CardHeader><h2 className="text-xl font-semibold text-gray-900 dark:text-white">Fluxo de Caixa Realizado (Últimos 6 Meses)</h2></CardHeader>
                    <CardContent>
                        {cashFlowData.length > 0 ? (
                             <div className="h-96 pt-4">
                                <CashFlowChart data={cashFlowData} />
                            </div>
                        ) : (
                             <div className="h-96 flex flex-col items-center justify-center text-center">
                                <div className="bg-gray-100 dark:bg-gray-800/50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                                    <ChartIcon />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Nenhum dado de fluxo de caixa</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">Quando você registrar pagamentos de receitas e despesas, o gráfico aparecerá aqui.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="!p-0">
                    <CardHeader className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Histórico de Lançamentos do Caixa</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Clique em um mês para ver os detalhes.</p>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mês</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Entradas</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Saídas</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Saldo do Mês</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900">
                                {sortedMonthKeys.map(monthKey => {
                                    const monthTxs = transactionsByMonth[monthKey];
                                    const income = monthTxs.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
                                    const expense = monthTxs.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);
                                    const balance = income - expense;
                                    const [year, month] = monthKey.split('-').map(Number);
                                    const monthLabel = new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                                    
                                    return (
                                        <tr key={monthKey} className="even:bg-gray-50 dark:even:bg-gray-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer transition-colors" onClick={() => handleMonthClick(monthKey)}>
                                            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white capitalize">{monthLabel}</td>
                                            <td className="px-6 py-4 font-medium text-green-600">{formatCurrency(income)}</td>
                                            <td className="px-6 py-4 font-medium text-red-600">{formatCurrency(expense)}</td>
                                            <td className={`px-6 py-4 font-bold ${balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-500'}`}>{formatCurrency(balance)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                         {sortedMonthKeys.length === 0 && <p className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum lançamento de caixa encontrado para esta empresa.</p>}
                    </CardContent>
                </Card>
            </div>
            {viewingMonth && (
                <MonthDetailModal
                    monthKey={viewingMonth.key}
                    monthLabel={viewingMonth.label}
                    payables={payables}
                    receivables={receivables}
                    selectedCompany={selectedCompany}
                    onClose={() => setViewingMonth(null)}
                />
            )}
        </>
    );
};

const ChartIcon = () => <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v17h17"></path></svg>;
