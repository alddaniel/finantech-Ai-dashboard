import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import type { Transaction, Contact } from '../types';
import { MOCK_PAYMENT_CATEGORIES } from '../constants';
import { ExpenseDetailModal } from './ExpenseDetailModal';
import { downloadPdfFromElement } from '../services/pdfService';

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

const SelectField: React.FC<{label: string, id: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode}> = ({ label, id, name, value, onChange, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-500 dark:text-gray-400">{label}</label>
        <select id={id} name={id} value={value} onChange={onChange} className="mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 pl-3 pr-10 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm">
            {children}
        </select>
    </div>
);

const DateField: React.FC<{label: string, id: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ label, id, name, value, onChange }) => (
     <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-500 dark:text-gray-400">{label}</label>
        <input type="date" id={id} name={name} value={value} onChange={onChange} className="mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" />
    </div>
);

const KPICard: React.FC<{title: string, value: string | number, subvalue?: string}> = ({ title, value, subvalue }) => (
    <Card className="text-center">
        <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            {subvalue && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subvalue}</p>}
        </CardContent>
    </Card>
);

interface ReportsProps {
    selectedCompany: string;
    payables: Transaction[];
    contacts: Contact[];
}

export const Reports: React.FC<ReportsProps> = ({ selectedCompany, payables, contacts }) => {
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        category: 'all',
        supplier: 'all',
        costCenter: 'all',
        status: 'all',
    });
    const [selectedExpense, setSelectedExpense] = useState<Transaction | null>(null);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const companyPayables = useMemo(() => payables.filter(p => p.company === selectedCompany), [payables, selectedCompany]);

    const { uniqueSuppliers, uniqueCostCenters } = useMemo(() => {
        const costCenters = new Set<string>();
        const supplierIds = new Set<string>();

        companyPayables.forEach(p => {
            costCenters.add(p.costCenter);
            if (p.contactId) {
                supplierIds.add(p.contactId);
            }
        });
        
        const suppliers = contacts.filter(c => c.type === 'Fornecedor' && supplierIds.has(c.id));
        
        return {
            uniqueSuppliers: suppliers,
            uniqueCostCenters: Array.from(costCenters).sort(),
        }
    }, [companyPayables, contacts]);

    const filteredPayables = useMemo(() => {
        return companyPayables.filter(p => {
            const dueDate = p.dueDate ? parseDate(p.dueDate) : null;
            if (!dueDate || isNaN(dueDate.getTime())) {
                return false; // Ignore transactions with invalid dates
            }

            const startDate = filters.startDate ? parseDate(filters.startDate) : null;
            const endDate = filters.endDate ? parseDate(filters.endDate) : null;

            // Make the end date inclusive by setting it to the end of the day.
            if (endDate) {
                endDate.setHours(23, 59, 59, 999);
            }

            const isAfterStartDate = !startDate || (dueDate >= startDate);
            const isBeforeEndDate = !endDate || (dueDate <= endDate);

            return isAfterStartDate
                && isBeforeEndDate
                && (filters.category === 'all' || p.category === filters.category)
                && (filters.status === 'all' || p.status === filters.status)
                && (filters.costCenter === 'all' || p.costCenter === filters.costCenter)
                && (filters.supplier === 'all' || p.contactId === filters.supplier);
        });
    }, [filters, companyPayables]);
    
    const indicators = useMemo(() => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const totalPaidThisMonth = companyPayables
            .filter(p => {
                if (p.status !== 'Pago' || !p.paymentDate) {
                    return false;
                }
                const paymentDate = parseDate(p.paymentDate);
                return !isNaN(paymentDate.getTime()) && paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
            })
            .reduce((sum, item) => sum + item.amount, 0);

        const overdueCount = companyPayables.filter(p => p.status === 'Vencido').length;
        
        const fixedExpenses = filteredPayables.reduce((sum, p) => p.fixedOrVariable === 'fixa' ? sum + p.amount : sum, 0);
        const variableExpenses = filteredPayables.reduce((sum, p) => p.fixedOrVariable === 'variável' ? sum + p.amount : sum, 0);
        const totalExpenses = fixedExpenses + variableExpenses;
        const fixedPercentage = totalExpenses > 0 ? (fixedExpenses / totalExpenses) * 100 : 0;
        const variablePercentage = totalExpenses > 0 ? (variableExpenses / totalExpenses) * 100 : 0;


        return { totalPaidThisMonth, overdueCount, fixedPercentage, variablePercentage, fixedExpenses, variableExpenses };
    }, [companyPayables, filteredPayables]);

    const categoryChartData = useMemo(() => {
        const data = filteredPayables.reduce((acc, p) => {
            acc[p.category] = (acc[p.category] || 0) + p.amount;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(data).map(([name, value]) => ({ name, value }));
    }, [filteredPayables]);

    const handleExportCsv = () => {
        const headers = ['Descrição', 'Categoria', 'Fornecedor', 'Centro de Custo', 'Data de Vencimento', 'Valor', 'Status'];
        const rows = filteredPayables.map(p => {
            const supplierName = contacts.find(c => c.id === p.contactId)?.name || 'N/A';
            return [
                p.description,
                p.category,
                supplierName,
                p.costCenter,
                p.dueDate,
                p.amount.toFixed(2).replace('.', ','),
                p.status,
            ];
        });

        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"
            + headers.join(";") + "\n" 
            + rows.map(e => e.join(";")).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `relatorio_pagamentos_${selectedCompany.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 print-hide">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Relatórios e Indicadores de Pagamentos</h1>
                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => downloadPdfFromElement('report-printable-area', `relatorio_pagamentos_${selectedCompany.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`)} className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center text-sm">
                        <PdfIcon /> <span className="ml-2">Salvar como PDF</span>
                    </button>
                    <button onClick={handleExportCsv} className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center text-sm">
                        <ExcelIcon /> <span className="ml-2">Exportar CSV (Excel/Sheets)</span>
                    </button>
                </div>
            </div>

            <Card className="print-hide">
                 <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-6">
                    <DateField label="Data Início" id="startDate" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                    <DateField label="Data Fim" id="endDate" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                    <SelectField label="Categoria" id="category" name="category" value={filters.category} onChange={handleFilterChange}><option value="all">Todas</option>{MOCK_PAYMENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</SelectField>
                    <SelectField label="Fornecedor" id="supplier" name="supplier" value={filters.supplier} onChange={handleFilterChange}><option value="all">Todos</option>{uniqueSuppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</SelectField>
                    <SelectField label="Centro de Custo" id="costCenter" name="costCenter" value={filters.costCenter} onChange={handleFilterChange}><option value="all">Todos</option>{uniqueCostCenters.map(cc => <option key={cc} value={cc}>{cc}</option>)}</SelectField>
                    <SelectField label="Situação" id="status" name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="all">Todas</option>
                        <option value="Pendente">Pendente</option>
                        <option value="Pago">Pago</option>
                        <option value="Vencido">Vencido</option>
                        <option value="Agendado">Agendado</option>
                    </SelectField>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title="Total Pago no Mês" value={formatCurrency(indicators.totalPaidThisMonth)} />
                <KPICard title="Contas Atrasadas" value={indicators.overdueCount} />
                <KPICard title="Fixas vs. Variáveis (Filtro)" value={`${indicators.fixedPercentage.toFixed(0)}% / ${indicators.variablePercentage.toFixed(0)}%`} subvalue={`${formatCurrency(indicators.fixedExpenses)} / ${formatCurrency(indicators.variableExpenses)}`} />
            </div>

            <div id="report-printable-area" className="printable-area">
                 <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                     <Card className="lg:col-span-2">
                        <CardHeader><h2 className="text-xl font-semibold text-gray-900 dark:text-white dark:print:text-black">Despesas por Categoria</h2></CardHeader>
                        <CardContent className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categoryChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                        {categoryChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-3 !p-0">
                        <CardHeader className="p-6"><h2 className="text-xl font-semibold text-gray-900 dark:text-white dark:print:text-black">Tabela de Pagamentos Filtrada</h2></CardHeader>
                        <CardContent className="overflow-x-auto">
                           <table className="min-w-full">
                                <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900">
                                    {filteredPayables.map(p => (
                                        <tr 
                                            key={p.id} 
                                            className="even:bg-gray-50 dark:even:bg-gray-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer"
                                            onClick={() => setSelectedExpense(p)}
                                        >
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{p.description}</td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{p.category}</td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{formatCurrency(p.amount)}</td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{p.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredPayables.length === 0 && <p className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum pagamento encontrado para os filtros selecionados.</p>}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {selectedExpense && (
                <ExpenseDetailModal
                    transaction={selectedExpense}
                    contacts={contacts}
                    onClose={() => setSelectedExpense(null)}
                />
            )}
        </div>
    );
};

const PdfIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const ExcelIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;