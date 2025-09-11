import React, { useMemo, useState, Fragment, useEffect } from 'react';
import { Card, CardContent } from './ui/Card';
import { downloadPdfFromElement } from '../services/pdfService';
import type { Transaction } from '../types';
import type { GroupingType } from './Reports';

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
    startDate?: string;
    endDate?: string;
    groupingType?: GroupingType;
}

const PdfIcon = () => <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const ExcelIcon = () => <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;

const PaginationControls: React.FC<{
    currentPage: number;
    pageCount: number;
    itemsPerPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (value: number) => void;
}> = ({ currentPage, pageCount, itemsPerPage, totalItems, onPageChange, onItemsPerPageChange }) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 px-6 pb-4 text-sm text-gray-600 dark:text-gray-400 gap-4">
            <div className="flex items-center gap-2">
                <span>Itens por página:</span>
                <select 
                    value={itemsPerPage} 
                    onChange={e => onItemsPerPageChange(Number(e.target.value))}
                    className="bg-slate-100 dark:bg-slate-800 rounded-md py-1 px-2 border border-slate-300 dark:border-slate-700"
                >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
                <span className="hidden sm:inline-block pl-2">
                    Mostrando {startItem}–{endItem} de {totalItems}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 disabled:opacity-50"
                >
                    Anterior
                </button>
                <span>Página {currentPage} de {pageCount}</span>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === pageCount}
                    className="px-3 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 disabled:opacity-50"
                >
                    Próxima
                </button>
            </div>
        </div>
    );
};


export const CashFlowRecords: React.FC<CashFlowRecordsProps> = ({ payables, receivables, selectedCompany, startDate, endDate, groupingType = 'none' }) => {
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    const allPaidTransactions = useMemo(() => {
        return [
            ...payables.filter(t => t.company === selectedCompany && t.status === 'Pago' && t.paymentDate),
            ...receivables.filter(t => t.company === selectedCompany && t.status === 'Pago' && t.paymentDate)
        ];
    }, [payables, receivables, selectedCompany]);

    const availableYears = useMemo(() => {
        const years = new Set<number>();
        allPaidTransactions.forEach(t => {
            const paymentDate = parseDate(t.paymentDate!);
            if (!isNaN(paymentDate.getTime())) {
                years.add(paymentDate.getFullYear());
            }
        });
        return Array.from(years).sort((a, b) => b - a);
    }, [allPaidTransactions]);

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const year = e.target.value;
        setSelectedYear(year);
        if (!year) {
            setSelectedMonth('');
        }
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSelectedYear('');
        setSelectedMonth('');
        setCurrentPage(1);
    };

    const paidTransactions = useMemo(() => {
        let companyTransactions = allPaidTransactions;

        if (selectedYear) {
            const year = parseInt(selectedYear, 10);
            companyTransactions = companyTransactions.filter(t => {
                const paymentDate = parseDate(t.paymentDate!);
                return !isNaN(paymentDate.getTime()) && paymentDate.getFullYear() === year;
            });

            if (selectedMonth) {
                const month = parseInt(selectedMonth, 10) - 1;
                companyTransactions = companyTransactions.filter(t => {
                    const paymentDate = parseDate(t.paymentDate!);
                    return !isNaN(paymentDate.getTime()) && paymentDate.getMonth() === month;
                });
            }
        } else if (startDate && endDate) {
            const start = parseDate(startDate);
            const end = parseDate(endDate);
            end.setHours(23, 59, 59, 999);

            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                companyTransactions = companyTransactions.filter(t => {
                    const paymentDate = parseDate(t.paymentDate!);
                    if (isNaN(paymentDate.getTime())) return false;
                    return paymentDate >= start && paymentDate <= end;
                });
            }
        }

        return companyTransactions.sort((a, b) => {
            const dateA = a.paymentDate ? parseDate(a.paymentDate) : new Date(0);
            const dateB = b.paymentDate ? parseDate(b.paymentDate) : new Date(0);
            if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
            return dateB.getTime() - dateA.getTime();
        });
    }, [allPaidTransactions, startDate, endDate, selectedMonth, selectedYear]);

    const canPaginate = groupingType === 'none';
    const pageCount = canPaginate ? Math.ceil(paidTransactions.length / itemsPerPage) : 1;
    
    useEffect(() => {
        if (currentPage > pageCount && pageCount > 0) {
            setCurrentPage(pageCount);
        }
    }, [currentPage, pageCount]);

    const groupedTransactions = useMemo(() => {
        const transactionsToGroup = canPaginate 
            ? paidTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            : paidTransactions;

        if (groupingType === 'none') {
            return { 'all': transactionsToGroup };
        }

        const groupKey = groupingType === 'type' ? 'type' : 'costCenter';

        return paidTransactions.reduce((acc, tx) => {
            let key = (tx[groupKey] || 'Não categorizado') as string;
            if(groupKey === 'type') {
                key = key === 'receita' ? 'Receitas' : 'Despesas';
            }
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(tx);
            return acc;
        }, {} as Record<string, Transaction[]>);

    }, [paidTransactions, groupingType, currentPage, itemsPerPage, canPaginate]);

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
    
    const handleExportCsv = () => {
        const headers = ['Descrição', 'Data de Pagamento', 'Tipo', 'Valor'];
        let rows: string[] = [];

        Object.entries(groupedTransactions).forEach(([groupName, transactions]) => {
            if (groupingType !== 'none') {
                rows.push(`"${groupName}";;;`);
            }
            
            transactions.forEach(t => {
                rows.push([
                    `"${t.description.replace(/"/g, '""')}"`,
                    formatDate(t.paymentDate),
                    t.type === 'receita' ? 'Receita' : 'Despesa',
                    t.amount.toFixed(2).replace('.', ',')
                ].join(';'));
            });

            if (groupingType !== 'none') {
                 const subtotal = transactions.reduce((sum, t) => sum + (t.type === 'receita' ? t.amount : -t.amount), 0);
                 rows.push(`"Subtotal";;;${subtotal.toFixed(2).replace('.', ',')}`);
                 rows.push('');
            }
        });

        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"
            + headers.join(";") + "\n"
            + rows.join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `extrato_caixa_${selectedCompany}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const months = [
        { value: '1', label: 'Janeiro' }, { value: '2', label: 'Fevereiro' },
        { value: '3', label: 'Março' }, { value: '4', label: 'Abril' },
        { value: '5', label: 'Maio' }, { value: '6', label: 'Junho' },
        { value: '7', label: 'Julho' }, { value: '8', label: 'Agosto' },
        { value: '9', label: 'Setembro' }, { value: '10', label: 'Outubro' },
        { value: '11', label: 'Novembro' }, { value: '12', label: 'Dezembro' }
    ];

    const showMonthYearFilters = !startDate && !endDate;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Histórico de todas as movimentações financeiras efetivamente pagas.
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                    <button 
                        onClick={handleExportCsv}
                        className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm"
                    >
                        <ExcelIcon /> Exportar CSV
                    </button>
                    <button 
                        onClick={() => downloadPdfFromElement('cashflow-records-printable-area', `extrato_caixa_${selectedCompany}.pdf`)}
                        className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm"
                    >
                        <PdfIcon /> Salvar PDF
                    </button>
                </div>
            </div>

            {showMonthYearFilters && (
                <Card>
                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label htmlFor="year-filter" className="block text-sm font-medium text-gray-500 dark:text-gray-400">Filtrar por Ano</label>
                            <select id="year-filter" value={selectedYear} onChange={handleYearChange} className="mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 pl-3 pr-10 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm">
                                <option value="">Todos os Anos</option>
                                {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="month-filter" className="block text-sm font-medium text-gray-500 dark:text-gray-400">Filtrar por Mês</label>
                            <select id="month-filter" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} disabled={!selectedYear} className="mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 pl-3 pr-10 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                <option value="">Todos os Meses</option>
                                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </div>
                        <button onClick={clearFilters} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-sm">
                            Limpar Filtros
                        </button>
                    </CardContent>
                </Card>
            )}
            
            <div id="cashflow-records-printable-area" className="printable-area space-y-6">
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
                                    {Object.entries(groupedTransactions).map(([groupName, transactions]) => {
                                         const subtotal = transactions.reduce((sum, t) => sum + (t.type === 'receita' ? t.amount : -t.amount), 0);
                                         return (
                                            <Fragment key={groupName}>
                                                {groupingType !== 'none' && (
                                                    <tr className="bg-slate-100 dark:bg-slate-800">
                                                        <th colSpan={4} className="px-6 py-2 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                            {groupingType === 'type' ? `Tipo: ${groupName}` : `Centro de Custo: ${groupName}`}
                                                        </th>
                                                    </tr>
                                                )}
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
                                                    </tr>
                                                ))}
                                                {groupingType !== 'none' && (
                                                     <tr className="bg-slate-50 dark:bg-slate-800/50 font-semibold">
                                                        <td colSpan={3} className="px-6 py-2 text-right text-slate-600 dark:text-slate-300">Subtotal do Grupo:</td>
                                                        <td className={`px-6 py-2 text-left ${subtotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(subtotal)}</td>
                                                    </tr>
                                                 )}
                                            </Fragment>
                                         )
                                    })}
                                </tbody>
                            </table>
                            {paidTransactions.length === 0 && <p className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum registro de caixa encontrado para os filtros selecionados.</p>}
                        </div>
                    </CardContent>
                    {canPaginate && (
                        <PaginationControls 
                            currentPage={currentPage}
                            pageCount={pageCount}
                            itemsPerPage={itemsPerPage}
                            totalItems={paidTransactions.length}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={(value) => {
                                setItemsPerPage(value);
                                setCurrentPage(1);
                            }}
                        />
                    )}
                </Card>
            </div>
        </div>
    );
};