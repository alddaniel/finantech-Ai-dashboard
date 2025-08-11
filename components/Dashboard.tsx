
import React from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { CashFlowChart } from './CashFlowChart';
import type { View, Transaction, AccountantRequest, User, BankAccount, BankTransaction } from '../types';
import { VIEWS, MOCK_CASH_FLOW_DATA } from '../constants';

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
                           <Badge color={t.status === 'Pago' ? 'green' : t.status === 'Pendente' ? 'yellow' : 'red'}>{t.status}</Badge>
                        </div>
                    </li>
                ))}
            </ul>
             {transactions.length === 0 && <p className="text-center py-4 text-gray-500 dark:text-gray-400">Nenhuma transação encontrada.</p>}
        </CardContent>
    </Card>
);

const EmptyDashboard: React.FC<{ selectedCompany: string; onOpenExpenseModal: () => void; onOpenInvoiceModal: () => void; }> = ({ selectedCompany, onOpenExpenseModal, onOpenInvoiceModal }) => (
    <div className="text-center py-16 px-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-full h-20 w-20 flex items-center justify-center mx-auto">
             <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
        </div>
        <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">Bem-vindo à {selectedCompany}!</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Ainda não há dados financeiros para exibir. Comece adicionando suas primeiras transações.</p>
        <div className="mt-8 flex justify-center gap-4">
            <button
                onClick={onOpenExpenseModal}
                className="bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
            >
                Adicionar Despesa
            </button>
            <button
                onClick={onOpenInvoiceModal}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
                Gerar Cobrança (Receita)
            </button>
        </div>
    </div>
);


export const Dashboard: React.FC<DashboardProps> = ({ setActiveView, selectedCompany, payables, receivables, accountantRequests, setAccountantRequests, currentUser, isAccountantModuleEnabled, bankAccounts, bankTransactions, onOpenInvoiceModal }) => {
    
    const filteredPayables = payables.filter(t => t.company === selectedCompany);
    const filteredReceivables = receivables.filter(t => t.company === selectedCompany);
    const filteredBankAccounts = bankAccounts.filter(b => b.company === selectedCompany);
    
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard: <span className="text-indigo-500">{selectedCompany}</span></h1>

            {isAccountantModuleEnabled && (currentUser.role === 'Admin' || currentUser.role === 'Manager') &&
              <AccountantRequestsWidget 
                requests={accountantRequests}
                setRequests={setAccountantRequests}
                currentUser={currentUser}
                selectedCompany={selectedCompany}
              />
            }
            
            {!hasTransactions ? (
                 <EmptyDashboard selectedCompany={selectedCompany} onOpenExpenseModal={() => setActiveView(VIEWS.PAYABLE)} onOpenInvoiceModal={onOpenInvoiceModal} />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <SummaryCard title="Receitas Pagas (Mês)" value={formatCurrency(totalReceitas)} change="+5.2%" changeType="positive" />
                        <SummaryCard title="Despesas Pagas (Mês)" value={formatCurrency(totalDespesas)} change="+8.1%" changeType="negative" />
                        <SummaryCard title="Resultado (Mês)" value={formatCurrency(lucroLiquido)} change="-2.5%" changeType={lucroLiquido >= 0 ? 'positive' : 'negative'} />
                    </div>

                    <Card>
                         <CardHeader>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Saldos Bancários</h2>
                         </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                                {filteredBankAccounts.map(account => {
                                    const currentBalance = getAccountCurrentBalance(account);
                                    return (
                                        <div key={account.id} className="flex items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <TransactionList title="Últimas Contas a Receber" transactions={filteredReceivables} onViewAll={() => setActiveView(VIEWS.RECEIPTS)} />
                        <TransactionList title="Últimas Contas a Pagar" transactions={filteredPayables} onViewAll={() => setActiveView(VIEWS.PAYABLE)} />
                    </div>
                </>
            )}
        </div>
    );
};

const AccountantRequestsWidget: React.FC<{
  requests: AccountantRequest[];
  setRequests: React.Dispatch<React.SetStateAction<AccountantRequest[]>>;
  currentUser: User;
  selectedCompany: string;
}> = ({ requests, setRequests, currentUser, selectedCompany }) => {
  const pendingRequests = requests.filter(r => 
    r.status === 'Pendente' && 
    r.assignedToId === currentUser.id &&
    r.company === selectedCompany
  );

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

const BellIcon = () => <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>;
const ArrowUpIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>;
const ArrowDownIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>;