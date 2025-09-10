import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { CashFlowChart } from './CashFlowChart';
import { DashboardSettingsModal } from './DashboardSettingsModal';
import * as apiService from '../services/apiService';
import type { View, Transaction, AccountantRequest, User, BankAccount, BankTransaction, DashboardSettings } from '../types';
import { VIEWS, MOCK_CASH_FLOW_DATA } from '../constants';
import { getDashboardInsight } from '../services/geminiService';
import { Spinner } from './ui/Spinner';

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDate = (dateString: string | undefined): string => {
    if (!dateString) {
        return '-';
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return dateString;
    }
    const parts = dateString.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
};

const isToday = (dateString: string | undefined) => {
    if (!dateString) return false;
    const today = new Date();
    const date = new Date(dateString + 'T00:00:00'); // Use local timezone
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
};


interface DashboardProps {
  setActiveView: (view: View) => void;
  selectedCompany: string;
  payables: Transaction[];
  receivables: Transaction[];
  accountantRequests: AccountantRequest[];
  setAccountantRequests: React.Dispatch<React.SetStateAction<AccountantRequest[]>>;
  currentUser: User;
  isAccountantModuleEnabled: boolean;
  bankAccounts: BankAccount[];
  bankTransactions: BankTransaction[];
  onOpenInvoiceModal: () => void;
  onOpenConfirmPaymentModal: (transaction: Transaction) => void;
  onOpenQRCodeModal: (transaction: Transaction) => void;
}

const SummaryCard: React.FC<{title: string, value: string, change?: string, changeType?: 'positive' | 'negative'}> = ({title, value, change, changeType}) => {
    const isPositive = changeType === 'positive';
    return (
        <Card>
            <CardContent>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
                {change && changeType && (
                    <div className={`mt-2 flex items-center text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
                        <span className="ml-1 font-semibold">{change}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1">vs mês anterior</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const TransactionList: React.FC<{title: string, transactions: Transaction[], onViewAll: () => void}> = ({ title, transactions, onViewAll }) => (
    <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                <button onClick={onViewAll} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                    Ver Todos
                </button>
            </div>
        </CardHeader>
        <CardContent>
            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                {transactions.slice(0, 4).map(t => (
                    <li key={t.id} className="py-4 flex justify-between items-center">
                        <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{t.description}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(t.dueDate)}</p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                           <p className={`font-semibold ${t.type === 'receita' ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(t.amount)}</p>
                           <Badge color={t.status === 'Pago' ? 'green' : t.status === 'Agendado' ? 'blue' : t.status === 'Pendente' ? 'yellow' : 'red'}>{t.status}</Badge>
                        </div>
                    </li>
                ))}
            </ul>
             {transactions.length === 0 && <p className="text-center py-4 text-gray-500 dark:text-gray-400">Nenhuma transação encontrada.</p>}
        </CardContent>
    </Card>
);

const EmptyDashboard: React.FC<{ selectedCompany: string; onOpenExpenseModal: () => void; onOpenInvoiceModal: () => void; }> = ({ selectedCompany, onOpenExpenseModal, onOpenInvoiceModal }) => (
    <div className="text-center py-16 px-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-full h-20 w-20 flex items-center justify-center mx-auto">
             <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
        </div>
        <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">Bem-vindo à {selectedCompany}!</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Ainda não há dados financeiros para exibir. Comece adicionando suas primeiras transações.</p>
        <div className="mt-8 flex justify-center gap-4">
            <button
                onClick={onOpenExpenseModal}
                className="bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
            >
                Adicionar Despesa
            </button>
            <button
                onClick={onOpenInvoiceModal}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold px-5 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
                Gerar Cobrança (Receita)
            </button>
        </div>
    </div>
);


export const Dashboard: React.FC<DashboardProps> = ({ setActiveView, selectedCompany, payables, receivables, accountantRequests, setAccountantRequests, currentUser, isAccountantModuleEnabled, bankAccounts, bankTransactions, onOpenInvoiceModal, onOpenConfirmPaymentModal, onOpenQRCodeModal }) => {
    
    const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings>(apiService.getDashboardSettings());
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    
    useEffect(() => {
        apiService.saveDashboardSettings(dashboardSettings);
    }, [dashboardSettings]);
    
    const filteredPayables = useMemo(() => payables.filter(t => t.company === selectedCompany), [payables, selectedCompany]);
    const filteredReceivables = useMemo(() => receivables.filter(t => t.company === selectedCompany), [receivables, selectedCompany]);
    const filteredBankAccounts = useMemo(() => bankAccounts.filter(b => b.company === selectedCompany), [bankAccounts, selectedCompany]);
    
    const [aiInsight, setAiInsight] = useState<string>('');
    const [isInsightLoading, setIsInsightLoading] = useState<boolean>(true);

    const fetchInsight = useCallback(async () => {
        setIsInsightLoading(true);
        try {
            const insight = await getDashboardInsight(filteredPayables, filteredReceivables);
            setAiInsight(insight);
        } catch (error) {
            console.error(error);
            setAiInsight("💡 Não foi possível carregar o insight no momento.");
        } finally {
            setIsInsightLoading(false);
        }
    }, [filteredPayables, filteredReceivables]);

    useEffect(() => {
        if (dashboardSettings?.aiInsight) {
            fetchInsight();
        }
    }, [fetchInsight, selectedCompany, dashboardSettings]);

    const totalReceitas = filteredReceivables.filter(t => t.status === 'Pago').reduce((sum, t) => sum + t.amount, 0);
    const totalDespesas = filteredPayables.filter(t => t.status === 'Pago').reduce((sum, t) => sum + t.amount, 0);
    const lucroLiquido = totalReceitas - totalDespesas;
    
    const hasTransactions = filteredPayables.length > 0 || filteredReceivables.length > 0;

    const getAccountCurrentBalance = (account: BankAccount): number => {
      const accountTransactions = bankTransactions.filter(t => t.bankAccountId === account.id);
      const balance = accountTransactions.reduce((acc, tx) => {
          return tx.type === 'credit' ? acc + tx.amount : acc - tx.amount;
      }, account.balance);
      return balance;
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div></div>
                 <button onClick={() => setIsSettingsModalOpen(true)} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <SettingsIcon />
                    Personalizar
                </button>
            </div>

            {dashboardSettings.aiInsight && (
                <AIInsightCard 
                    isLoading={isInsightLoading}
                    insightText={aiInsight}
                    onRefresh={fetchInsight}
                />
            )}
            
            {dashboardSettings.scheduledItems && (
                 <ScheduledItemsWidget 
                    payables={filteredPayables} 
                    receivables={filteredReceivables} 
                    setActiveView={setActiveView} 
                    onOpenConfirmPaymentModal={onOpenConfirmPaymentModal}
                    onOpenQRCodeModal={onOpenQRCodeModal}
                />
            )}
           
            {dashboardSettings.accountantRequests && isAccountantModuleEnabled && (currentUser.role === 'Admin' || currentUser.role === 'Manager') && (
              <AccountantRequestsWidget 
                requests={accountantRequests}
                setRequests={setAccountantRequests}
                currentUser={currentUser}
                selectedCompany={selectedCompany}
              />
            )}
            
            {!hasTransactions ? (
                 <EmptyDashboard selectedCompany={selectedCompany} onOpenExpenseModal={() => setActiveView(VIEWS.PAYABLE)} onOpenInvoiceModal={onOpenInvoiceModal} />
            ) : (
                <>
                    {dashboardSettings.summaryCards && (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <SummaryCard title="Receitas Pagas (Mês)" value={formatCurrency(totalReceitas)} change="+5.2%" changeType="positive" />
                            <SummaryCard title="Despesas Pagas (Mês)" value={formatCurrency(totalDespesas)} change="+8.1%" changeType="negative" />
                            <SummaryCard title="Resultado (Mês)" value={formatCurrency(lucroLiquido)} change="-2.5%" changeType={lucroLiquido >= 0 ? 'positive' : 'negative'} />
                        </div>
                    )}
                   
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         {dashboardSettings.overduePayables && <OverdueTransactionsWidget type="despesa" transactions={filteredPayables} onViewAll={() => setActiveView(VIEWS.PAYABLE)} />}
                         {dashboardSettings.overdueReceivables && <OverdueTransactionsWidget type="receita" transactions={filteredReceivables} onViewAll={() => setActiveView(VIEWS.RECEIPTS)} />}
                    </div>

                    {dashboardSettings.bankBalances && (
                        <Card>
                            <CardHeader>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Saldos Bancários</h2>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                                    {filteredBankAccounts.map(account => {
                                        const currentBalance = getAccountCurrentBalance(account);
                                        return (
                                            <div key={account.id} className="flex items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
                                            <img src={account.logoUrl} alt={account.name} className="w-10 h-10 rounded-full mr-4 bg-white p-1" />
                                            <div>
                                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">{account.name}</h3>
                                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(currentBalance)}</p>
                                            </div>
                                            </div>
                                        )
                                    })}
                                </div>
                                {filteredBankAccounts.length === 0 && <p className="text-center py-4 text-gray-500 dark:text-gray-400">Nenhuma conta bancária para esta empresa.</p>}
                            </CardContent>
                        </Card>
                    )}

                    {dashboardSettings.cashFlowChart && (
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fluxo de Caixa (Últimos 6 meses)</h3>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80 pt-4">
                                <CashFlowChart data={MOCK_CASH_FLOW_DATA} />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         {dashboardSettings.latestReceivables && <TransactionList title="Últimas Contas a Receber" transactions={filteredReceivables} onViewAll={() => setActiveView(VIEWS.RECEIPTS)} />}
                         {dashboardSettings.latestPayables && <TransactionList title="Últimas Contas a Pagar" transactions={filteredPayables} onViewAll={() => setActiveView(VIEWS.PAYABLE)} />}
                    </div>
                </>
            )}
             <DashboardSettingsModal 
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                currentSettings={dashboardSettings}
                onSave={setDashboardSettings}
            />
        </div>
    );
};

const AIInsightCard: React.FC<{ isLoading: boolean; insightText: string; onRefresh: () => void; }> = ({ isLoading, insightText, onRefresh }) => {
    const AIIcon = () => <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 