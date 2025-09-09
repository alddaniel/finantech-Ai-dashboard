import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import type { Transaction, Contact, Category, CashFlowData, Project, BankAccount, Property, ToastMessage } from '../types';
import { ExpenseDetailModal } from './ExpenseDetailModal';
import { MOCK_CASH_FLOW_DATA } from '../constants';

// Import components to be rendered as reports
import { AccountsPayable } from './AccountsPayable';
import { Receipts } from './Receipts';
import { Projects } from './Projects';
import { CashFlowRecords } from './CashFlowRecords';
import { DREReport } from './DREReport';
import { BalanceteReport } from './BalanceteReport';

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
    setPayables: React.Dispatch<React.SetStateAction<Transaction[]>>;
    receivables: Transaction[];
    setReceivables: React.Dispatch<React.SetStateAction<Transaction[]>>;
    contacts: Contact[];
    setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
    properties: Property[];
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    categories: Category[];
    bankAccounts: BankAccount[];
    onOpenExpenseModal: (expense: Transaction | null) => void;
    onOpenConfirmPaymentModal: (transaction: Transaction) => void;
    onOpenInvoiceModal: (data?: any) => void;
    onOpenProjectModal: (project: Project | null) => void;
    onOpenQRCodeModal: (transaction: Transaction) => void;
    addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

type ReportType = 'overview' | 'payables' | 'receivables' | 'projects' | 'cash_flow_records' | 'dre' | 'balancete';
export type GroupingType = 'none' | 'status' | 'costCenter' | 'type';


const ReportTab: React.FC<{ label: string; reportType: ReportType; activeReport: ReportType; onClick: (type: ReportType) => void; }> = ({ label, reportType, activeReport, onClick }) => (
    <button
        onClick={() => onClick(reportType)}
        className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
            activeReport === reportType
                ? 'text-indigo-600 border-indigo-600'
                : 'text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
    >
        {label}
    </button>
);

const OverviewReport: React.FC<Pick<ReportsProps, 'selectedCompany' | 'payables' | 'contacts' | 'categories'>> = ({ selectedCompany, payables, contacts, categories }) => {
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

    const { uniqueSuppliers, uniqueCostCenters, expenseCategories } = useMemo(() => {
        const costCenters = new Set<string>();
        const supplierIds = new Set<string>();

        companyPayables.forEach(p => {
            costCenters.add(p.costCenter);
            if (p.contactId) {
                supplierIds.add(p.contactId);
            }
        });
        
        const suppliers = contacts.filter(c => c.type === 'Fornecedor' && supplierIds.has(c.id));
        const cats = categories.filter(c => c.type === 'despesa');
        
        return {
            uniqueSuppliers: suppliers,
            uniqueCostCenters: Array.from(costCenters).sort(),
            expenseCategories: cats
        }
    }, [companyPayables, contacts, categories]);

    const filteredPayables = useMemo(() => {
        return companyPayables.filter(p => {
            const dueDate = p.dueDate ? parseDate(p.dueDate) : null;
            if (!dueDate || isNaN(dueDate.getTime())) {
                return false;
            }

            const startDate = filters.startDate ? parseDate(filters.startDate) : null;
            const endDate = filters.endDate ? parseDate(filters.endDate) : null;

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
                if (p.status !== 'Pago' || !p.paymentDate) return false;
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
    
    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

    return (
        <div className="space-y-8">
            <Card>
                 <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-6">
                    <DateField label="Data Início" id="startDate" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                    <DateField label="Data Fim" id="endDate" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                    <SelectField label="Categoria" id="category" name="category" value={filters.category} onChange={handleFilterChange}><option value="all">Todas</option>{expenseCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</SelectField>
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

             <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                 <Card className="lg:col-span-2">
                    <CardHeader><h2 className="text-xl font-semibold text-gray-900 dark:text-white">Despesas por Categoria</h2></CardHeader>
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
                    <CardHeader className="p-6"><h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tabela de Pagamentos Filtrada</h2></CardHeader>
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
            
            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Relatório de Fluxo de Caixa Mensal (Últimos 6 Meses)
                        </h2>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mês</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Receitas</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Despesas</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Saldo do Mês</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900">
                                    {MOCK_CASH_FLOW_DATA.map(monthData => (
                                        <tr key={monthData.month} className="even:bg-gray-50 dark:even:bg-gray-800/50">
                                            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{monthData.month}</td>
                                            <td className="px-6 py-4 font-medium text-green-600">{formatCurrency(monthData.receitas)}</td>
                                            <td className="px-6 py-4 font-medium text-red-600">{formatCurrency(monthData.despesas)}</td>
                                            <td className={`px-6 py-4 font-bold ${monthData.saldo >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-500'}`}>{formatCurrency(monthData.saldo)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
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

export const Reports: React.FC<ReportsProps> = (props) => {
    const [activeReport, setActiveReport] = useState<ReportType>('overview');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [groupingType, setGroupingType] = useState<GroupingType>('none');
    
    const { 
        selectedCompany, payables, receivables, contacts, categories,
        setPayables, setReceivables, setContacts, properties, projects,
        setProjects, bankAccounts, onOpenExpenseModal, onOpenConfirmPaymentModal,
        onOpenInvoiceModal, onOpenProjectModal, onOpenQRCodeModal, addToast
    } = props;
    
    const companyPayables = useMemo(() => payables.filter(p => p.company === selectedCompany), [payables, selectedCompany]);
    const companyReceivables = useMemo(() => receivables.filter(r => r.company === selectedCompany), [receivables, selectedCompany]);
    const companyBankAccounts = useMemo(() => bankAccounts.filter(b => b.company === selectedCompany), [bankAccounts, selectedCompany]);
    const companyCategories = useMemo(() => categories.filter(c => c.company === selectedCompany), [categories, selectedCompany]);


    const renderActiveReport = () => {
        const groupingProp = activeReport === 'cash_flow_records' && groupingType === 'status' ? 'type' : groupingType;
        switch (activeReport) {
            case 'payables':
                return <AccountsPayable 
                    selectedCompany={selectedCompany}
                    payables={payables}
                    setPayables={setPayables}
                    contacts={contacts}
                    setContacts={setContacts}
                    properties={properties}
                    onOpenExpenseModal={onOpenExpenseModal}
                    onOpenConfirmPaymentModal={onOpenConfirmPaymentModal}
                    bankAccounts={bankAccounts}
                    startDate={startDate}
                    endDate={endDate}
                    groupingType={groupingType}
                    addToast={addToast}
                />;
            case 'receivables':
                 return <Receipts 
                    selectedCompany={selectedCompany}
                    receivables={receivables}
                    setReceivables={setReceivables}
                    onOpenInvoiceModal={onOpenInvoiceModal}
                    onOpenConfirmPaymentModal={onOpenConfirmPaymentModal}
                    contacts={contacts}
                    properties={properties}
                    bankAccounts={bankAccounts}
                    onOpenQRCodeModal={onOpenQRCodeModal}
                    startDate={startDate}
                    endDate={endDate}
                    groupingType={groupingType}
                    addToast={addToast}
                />;
            case 'projects':
                return <Projects 
                    projects={projects}
                    setProjects={setProjects}
                    contacts={contacts}
                    payables={payables}
                    receivables={receivables}
                    selectedCompany={selectedCompany}
                    onOpenProjectModal={onOpenProjectModal}
                    startDate={startDate}
                    endDate={endDate}
                    groupingType={groupingType}
                    addToast={addToast}
                />;
            case 'cash_flow_records':
                return <CashFlowRecords 
                    payables={payables}
                    receivables={receivables}
                    selectedCompany={selectedCompany}
                    startDate={startDate}
                    endDate={endDate}
                    groupingType={groupingProp}
                />;
            case 'dre':
                return <DREReport 
                    payables={companyPayables}
                    receivables={companyReceivables}
                    categories={companyCategories}
                />;
            case 'balancete':
                return <BalanceteReport 
                     payables={companyPayables}
                     receivables={companyReceivables}
                     bankAccounts={companyBankAccounts}
                />;
            case 'overview':
            default:
                return <OverviewReport 
                    selectedCompany={selectedCompany}
                    payables={payables}
                    contacts={contacts}
                    categories={categories}
                />;
        }
    };

    const showGenericFilters = !['overview', 'dre', 'balancete'].includes(activeReport);

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
        setGroupingType('none');
    }

    return (
        <div className="space-y-6">
             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Central de Relatórios</h1>
             <div className="border-b border-gray-200 dark:border-gray-700">
                {/* FIX: Reconstructed the navigation tabs to fix syntax error and add all report options */}
                <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                    <ReportTab label="Visão Geral (Pagamentos)" reportType="overview" activeReport={activeReport} onClick={setActiveReport} />
                    <ReportTab label="DRE (Resultado)" reportType="dre" activeReport={activeReport} onClick={setActiveReport} />
                    <ReportTab label="Balancete (Simulado)" reportType="balancete" activeReport={activeReport} onClick={setActiveReport} />
                    <ReportTab label="Contas a Pagar" reportType="payables" activeReport={activeReport} onClick={setActiveReport} />
                    <ReportTab label="Contas a Receber" reportType="receivables" activeReport={activeReport} onClick={setActiveReport} />
                    <ReportTab label="Projetos" reportType="projects" activeReport={activeReport} onClick={setActiveReport} />
                    <ReportTab label="Extrato de Caixa" reportType="cash_flow_records" activeReport={activeReport} onClick={setActiveReport} />
                </nav>
            </div>
            {showGenericFilters && (
                 <Card>
                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <DateField label="Data Início" id="startDate" name="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        <DateField label="Data Fim" id="endDate" name="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        <div>
                             <label htmlFor="groupingType" className="block text-sm font-medium text-gray-500 dark:text-gray-400">Agrupar por</label>
                            <select id="groupingType" name="groupingType" value={groupingType} onChange={e => setGroupingType(e.target.value as GroupingType)} className="mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 pl-3 pr-10 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm">
                                <option value="none">Nenhum</option>
                                <option value="status">Status</option>
                                <option value="costCenter">Centro de Custo</option>
                                {activeReport === 'cash_flow_records' && <option value="type">Tipo (Receita/Despesa)</option>}
                            </select>
                        </div>
                         <button onClick={clearFilters} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-sm">
                            Limpar Filtros
                        </button>
                    </CardContent>
                </Card>
            )}
            
            <div className="mt-6">
                {renderActiveReport()}
            </div>
        </div>
    );
};