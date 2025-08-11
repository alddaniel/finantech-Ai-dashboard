
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from './ui/Card';
import { BankAccountModal } from './BankAccountModal';
import { BankTransactionDetailModal } from './BankTransactionDetailModal';
import type { View, BankAccount, BankTransaction } from '../types';
import { VIEWS } from '../constants';

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Handle invalid dates
    // Format to DD/MM/YYYY
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};


const OptionsMenu: React.FC<{ onEdit: () => void; onDelete: () => void; }> = ({ onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <DotsIcon />
            </button>
            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700"
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <a href="#" onClick={(e) => { e.preventDefault(); onEdit(); setIsOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Editar</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); onDelete(); setIsOpen(false); }} className="block px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50">Excluir</a>
                </div>
            )}
        </div>
    );
};

const BankAccountCard: React.FC<{
    account: BankAccount;
    transactions: BankTransaction[];
    onEdit: () => void;
    onDelete: () => void;
    onTransactionClick: (transaction: BankTransaction) => void;
}> = ({ account, transactions, onEdit, onDelete, onTransactionClick }) => {
    const lastTransactions = transactions.slice(0, 5);

    const currentBalance = useMemo(() => {
        return transactions.reduce((balance, tx) => {
            if (tx.type === 'credit') {
                return balance + tx.amount;
            }
            return balance - tx.amount;
        }, account.balance);
    }, [account.balance, transactions]);


    return (
        <Card className="flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-4">
                    <img src={account.logoUrl} alt={account.name} className="w-10 h-10 rounded-full bg-white p-1" />
                    <div>
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{account.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{`Ag: ${account.agency} / Cc: ${account.account}`}</p>
                    </div>
                </div>
                <OptionsMenu onEdit={onEdit} onDelete={onDelete} />
            </div>
            <CardContent className="p-4 flex-grow">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Saldo Atual</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(currentBalance)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Saldo Inicial</p>
                        <p className="text-lg font-semibold text-gray-600 dark:text-gray-300 mt-1">{formatCurrency(account.balance)}</p>
                    </div>
                </div>
                <div className="mt-6">
                     <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Últimos Movimentos</h4>
                     <ul className="space-y-2">
                        {lastTransactions.map(tx => (
                            <li 
                                key={tx.id} 
                                onClick={() => onTransactionClick(tx)}
                                className="flex justify-between items-center text-sm p-2 rounded-md bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <div>
                                    <p className="font-medium text-gray-700 dark:text-gray-300">{tx.description}</p>
                                    <p className="text-xs text-gray-500">{formatDate(tx.date)}</p>
                                </div>
                                <p className={`font-semibold ${tx.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                                    {tx.type === 'credit' ? '+' : '-'} {formatCurrency(tx.amount)}
                                </p>
                            </li>
                        ))}
                     </ul>
                      {lastTransactions.length === 0 && <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">Nenhum movimento recente.</p>}
                </div>
            </CardContent>
        </Card>
    );
};


interface BankAccountsProps {
    bankAccounts: BankAccount[];
    setBankAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
    selectedCompany: string;
    bankTransactions: BankTransaction[];
}

export const BankAccounts: React.FC<BankAccountsProps> = ({ bankAccounts, setBankAccounts, selectedCompany, bankTransactions }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [accountToEdit, setAccountToEdit] = useState<BankAccount | null>(null);
    const [viewingTx, setViewingTx] = useState<{ transaction: BankTransaction; account: BankAccount } | null>(null);

    const filteredAccounts = useMemo(() => {
        return bankAccounts.filter(acc => acc.company === selectedCompany);
    }, [bankAccounts, selectedCompany]);

    const handleOpenModal = (account: BankAccount | null = null) => {
        setAccountToEdit(account);
        setModalOpen(true);
    };

    const handleSaveAccount = (accountData: BankAccount) => {
        if (accountToEdit) {
            setBankAccounts(bankAccounts.map(acc => acc.id === accountData.id ? accountData : acc));
        } else {
            setBankAccounts([...bankAccounts, { ...accountData, id: `acc${Date.now()}` }]);
        }
    };

    const handleDeleteAccount = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta conta bancária? Esta ação não pode ser desfeita.')) {
            setBankAccounts(bankAccounts.filter(acc => acc.id !== id));
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                 <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contas Bancárias</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                        Visualize suas contas e os últimos movimentos em cada uma.
                    </p>
                </div>
                <button 
                    onClick={() => handleOpenModal()} 
                    className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm self-start md:self-center">
                    <PlusIcon /> Adicionar Conta
                </button>
            </div>

            {filteredAccounts.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {filteredAccounts.map(account => {
                        const accountTransactions = bankTransactions
                            .filter(t => t.bankAccountId === account.id)
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                        
                        return (
                            <BankAccountCard 
                                key={account.id}
                                account={account}
                                transactions={accountTransactions}
                                onEdit={() => handleOpenModal(account)}
                                onDelete={() => handleDeleteAccount(account.id)}
                                onTransactionClick={(transaction) => setViewingTx({ transaction, account })}
                            />
                        )
                    })}
                </div>
            ) : (
                <Card>
                    <CardContent className="text-center py-20">
                         <div className="bg-gray-100 dark:bg-gray-800/50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                             <BankIcon />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Nenhuma Conta Cadastrada</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Adicione sua primeira conta bancária para começar.</p>
                         <button onClick={() => handleOpenModal()} className="mt-6 bg-indigo-600 text-white font-semibold px-5 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors text-sm">
                            Adicionar Conta Bancária
                        </button>
                    </CardContent>
                </Card>
            )}

            <BankAccountModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSaveAccount}
                accountToEdit={accountToEdit}
                selectedCompany={selectedCompany}
            />

            {viewingTx && (
                <BankTransactionDetailModal
                    transaction={viewingTx.transaction}
                    account={viewingTx.account}
                    onClose={() => setViewingTx(null)}
                />
            )}
        </div>
    );
};

const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;
const DotsIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>;
const BankIcon = () => <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>;
