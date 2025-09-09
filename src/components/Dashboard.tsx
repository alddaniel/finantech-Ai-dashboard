
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { CashFlowChart } from './CashFlowChart';
import { DashboardSettingsModal } from './DashboardSettingsModal';
import * as apiService from '../services/apiService';
import type { View, Transaction, AccountantRequest, User, BankAccount, BankTransaction, DashboardSettings } from '../types';
import { VIEWS, MOCK_CASH_FLOW_DATA } from '../constants';
import { getDashboardInsight } from '../services/geminiService';

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
    
    const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings>(() => apiService.getDashboardSettings());
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
        fetchInsight();
    }, [fetchInsight, selectedCompany]);

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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard: <span className="text-indigo-500">{selectedCompany}</span></h1>
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
    const AIIcon = () => <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
    const RefreshIcon: React.FC<{className?: string}> = ({className}) => <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l16 16"></path></svg>;

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full">
                           <AIIcon />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Insight Rápido com Gemini</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Uma análise proativa para suas finanças.</p>
                        </div>
                    </div>
                     <button onClick={onRefresh} disabled={isLoading} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-wait" aria-label="Atualizar insight">
                        <RefreshIcon className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
                <div className="mt-4 pl-4 border-l-4 border-indigo-500 min-h-[4rem] flex items-center">
                    {isLoading ? (
                        <p className="text-gray-500 dark:text-gray-400 italic">Analisando dados para gerar um insight...</p>
                    ) : (
                        <p className="text-gray-700 dark:text-gray-300 font-medium">{insightText}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const ScheduledItemsWidget: React.FC<{
    payables: Transaction[];
    receivables: Transaction[];
    setActiveView: (view: View) => void;
    onOpenConfirmPaymentModal: (transaction: Transaction) => void;
    onOpenQRCodeModal: (transaction: Transaction) => void;
}> = ({ payables, receivables, setActiveView, onOpenConfirmPaymentModal, onOpenQRCodeModal }) => {
    const paymentsDueToday = useMemo(() => {
        return payables.filter(p => p.status === 'Agendado' && isToday(p.scheduledPaymentDate));
    }, [payables]);
    
    const receivablesDueToday = useMemo(() => {
        return receivables.filter(r => r.status === 'Agendado' && isToday(r.scheduledPaymentDate));
    }, [receivables]);

    if (paymentsDueToday.length === 0 && receivablesDueToday.length === 0) return null;

    return (
        <Card className="border-cyan-500 border-2">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <ClockIcon />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Avisos para Hoje</h2>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Os seguintes itens estão agendados para hoje.</p>
            </CardHeader>
            <CardContent>
                {paymentsDueToday.length > 0 && (
                    <div className="mb-4 last:mb-0">
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Pagamentos:</h3>
                        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                            {paymentsDueToday.map(tx => (
                                <li key={tx.id} className="py-2 flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                            {tx.description}
                                            {tx.notificationEmail && (
                                                <span title={`Lembrete por e-mail configurado para ${tx.notificationEmail}`}>
                                                    <MailIcon className="w-4 h-4 text-cyan-600" />
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{formatCurrency(tx.amount)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onOpenConfirmPaymentModal(tx)}
                                            className="bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 font-semibold px-3 py-1.5 rounded-md text-xs hover:bg-green-200 dark:hover:bg-green-500/20 transition-colors">
                                            Pagar Agora
                                        </button>
                                        <button
                                            onClick={() => setActiveView(VIEWS.PAYMENT_SCHEDULE)}
                                            className="font-semibold text-indigo-600 text-xs hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                                            Reagendar
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                 {receivablesDueToday.length > 0 && (
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Recebimentos:</h3>
                        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                            {receivablesDueToday.map(tx => (
                                <li key={tx.id} className="py-2 flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                            {tx.description}
                                            {tx.notificationEmail && (
                                                <span title={`Lembrete por e-mail configurado para ${tx.notificationEmail}`}>
                                                    <MailIcon className="w-4 h-4 text-cyan-600" />
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{formatCurrency(tx.amount)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onOpenQRCodeModal(tx)}
                                            className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 font-semibold px-3 py-1.5 rounded-md text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1">
                                            <QRCodeIcon /> PIX
                                        </button>
                                        <button
                                            onClick={() => onOpenConfirmPaymentModal(tx)}
                                            className="bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 font-semibold px-3 py-1.5 rounded-md text-xs hover:bg-green-200 dark:hover:bg-green-500/20 transition-colors">
                                            Receber Agora
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};


const AccountantRequestsWidget: React.FC<{
  requests: AccountantRequest[];
  setRequests: React.Dispatch<React.SetStateAction<AccountantRequest[]>>;
  currentUser: User;
  selectedCompany: string;
}> = ({ requests, setRequests, currentUser, selectedCompany }) => {
  const pendingRequests = useMemo(() => requests.filter(r => 
    r.status === 'Pendente' && 
    r.assignedToId === currentUser.id &&
    r.company === selectedCompany
  ), [requests, currentUser.id, selectedCompany]);

  if (pendingRequests.length === 0) return null;

  const handleResolve = (requestId: string) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'Resolvido', resolvedAt: new Date().toISOString().split('T')[0] } : r));
  };

  return (
    <Card className="border-amber-500 border-2">
      <CardHeader>
        <div className="flex items-center gap-3">
          <BellIcon />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Pendências Contábeis</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">O seu contador precisa de sua atenção nos itens abaixo.</p>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {pendingRequests.map(req => (
            <li key={req.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{req.subject}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Solicitado por: {req.requesterName}</p>
              </div>
              <button 
                onClick={() => handleResolve(req.id)}
                className="bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 font-semibold px-3 py-1.5 rounded-md text-xs hover:bg-green-200 dark:hover:bg-green-500/20 transition-colors">
                Marcar como Resolvido
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

const OverdueTransactionsWidget: React.FC<{
    type: 'despesa' | 'receita';
    transactions: Transaction[];
    onViewAll: () => void;
}> = ({ type, transactions, onViewAll }) => {
    const overdue = useMemo(() => transactions.filter(t => t.status === 'Vencido'), [transactions]);
    if (overdue.length === 0) return null;

    const totalOverdue = overdue.reduce((sum, t) => sum + t.amount, 0);
    const isPayable = type === 'despesa';

    return (
        <Card className="border-red-500 border-2">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {isPayable ? 'Contas a Pagar Vencidas' : 'Contas a Receber em Atraso'}
                        </h3>
                        <p className="text-sm text-red-500 font-bold">{formatCurrency(totalOverdue)} em {overdue.length} item(s)</p>
                    </div>
                    <button onClick={onViewAll} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                        Ver Todos
                    </button>
                </div>
            </CardHeader>
            <CardContent>
                <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                    {overdue.slice(0, 3).map(t => (
                        <li key={t.id} className="py-3 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">{t.description}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Venceu em: {formatDate(t.dueDate)}</p>
                            </div>
                            <p className="font-semibold text-red-500">{formatCurrency(t.amount)}</p>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};

// ICONS
const SettingsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;
const BellIcon = () => <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>;
const ArrowUpIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>;
const ArrowDownIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>;
const ClockIcon = () => <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const MailIcon = ({ className = "w-4 h-4" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>;
const QRCodeIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;