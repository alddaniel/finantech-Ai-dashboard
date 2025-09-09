import React, { useState, useMemo, useEffect } from 'react';
import type { BankTransaction, SystemTransaction, BankAccount } from '../types';
import { reconcileTransactionsWithAI } from '../services/geminiService';
import { Card, CardContent, CardHeader } from './ui/Card';

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

type Suggestion = {
    bankTxId: string;
    systemTxId: string;
    reason: string;
};

const TransactionItem: React.FC<{
    transaction: BankTransaction | SystemTransaction;
    isSuggestion: boolean;
    suggestionReason?: string;
    isSelected: boolean;
    onClick: () => void;
}> = ({ transaction, isSuggestion, suggestionReason, isSelected, onClick }) => (
    <div 
        onClick={onClick}
        className={`p-3 rounded-lg transition-all duration-300 cursor-pointer ${
             isSelected ? 'bg-blue-200 dark:bg-blue-900/50 ring-2 ring-blue-500' :
             isSuggestion ? 'bg-indigo-100 dark:bg-indigo-900/30 ring-2 ring-indigo-500' : 
             'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50'
        }`}
        title={suggestionReason}
    >
        <div className="flex justify-between items-center">
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 flex-1 truncate pr-2">{transaction.description}</p>
            <p className={`font-bold text-sm ${transaction.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(transaction.amount)}
            </p>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatDate(transaction.date)}</p>
    </div>
);

export const BankReconciliation: React.FC<{
    bankTransactions: BankTransaction[];
    systemTransactions: SystemTransaction[];
    setSystemTransactions: React.Dispatch<React.SetStateAction<SystemTransaction[]>>;
    bankAccounts: BankAccount[];
    selectedCompany: string;
}> = ({ bankTransactions, systemTransactions, setSystemTransactions, bankAccounts, selectedCompany }) => {

    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [selectedBankTxId, setSelectedBankTxId] = useState<string | null>(null);
    const [selectedSystemTxId, setSelectedSystemTxId] = useState<string | null>(null);
    const [reconciledBankTxIds, setReconciledBankTxIds] = useState<Set<string>>(new Set());

    const companyBankAccountsIds = useMemo(() => 
        new Set(bankAccounts.filter(ba => ba.company === selectedCompany).map(ba => ba.id)),
        [bankAccounts, selectedCompany]
    );

    const unmatchedBankTxs = useMemo(() => 
        bankTransactions.filter(bt => companyBankAccountsIds.has(bt.bankAccountId)),
        [bankTransactions, companyBankAccountsIds]
    );

    const unmatchedSystemTxs = useMemo(() => 
        systemTransactions.filter(st => !st.matched && st.company === selectedCompany),
        [systemTransactions, selectedCompany]
    );

    // Reset local state when company changes
    useEffect(() => {
        setSuggestions([]);
        setSelectedBankTxId(null);
        setSelectedSystemTxId(null);
        setReconciledBankTxIds(new Set());
    }, [selectedCompany]);

    const displayBankTxs = useMemo(() => 
        unmatchedBankTxs.filter(tx => !reconciledBankTxIds.has(tx.id)),
        [unmatchedBankTxs, reconciledBankTxIds]
    );
    
    const handleSelect = (id: string, type: 'bank' | 'system') => {
        if (type === 'bank') {
            setSelectedBankTxId(prev => (prev === id ? null : id));
        } else {
            setSelectedSystemTxId(prev => (prev === id ? null : id));
        }
    };
    
    const handleAiReconciliation = async () => {
        setIsLoading(true);
        setSuggestions([]);
        try {
            const result = await reconcileTransactionsWithAI(displayBankTxs, unmatchedSystemTxs);
            setSuggestions(result);
        } catch (error) {
            alert('Erro ao conciliar com IA: ' + (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleManualReconciliation = () => {
        if (!selectedBankTxId || !selectedSystemTxId) return;

        setSystemTransactions(currentTxs =>
            currentTxs.map(tx =>
                tx.id === selectedSystemTxId ? { ...tx, matched: true } : tx
            )
        );
        
        setReconciledBankTxIds(prev => new Set(prev).add(selectedBankTxId));

        setSelectedBankTxId(null);
        setSelectedSystemTxId(null);

        alert('Transação conciliada manualmente com sucesso!');
    };


    const handleConfirmMatches = () => {
        if (suggestions.length === 0) return;

        const matchedSystemIds = new Set(suggestions.map(s => s.systemTxId));
        
        setSystemTransactions(currentTxs => 
            currentTxs.map(tx => 
                matchedSystemIds.has(tx.id) ? { ...tx, matched: true } : tx
            )
        );
        
        const matchedBankIds = suggestions.map(s => s.bankTxId);
        setReconciledBankTxIds(prev => new Set([...prev, ...matchedBankIds]));
        
        setSuggestions([]);
        alert(`${matchedSystemIds.size} transações foram conciliadas com sucesso!`);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Conciliação Bancária Inteligente</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                    Compare seu extrato bancário com os lançamentos do sistema e use a IA para acelerar o processo.
                </p>
            </div>

            <Card>
                <CardContent className="pt-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Ações de Conciliação</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Selecione um item de cada lista para conciliar manualmente, ou use a IA para sugestões automáticas.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleManualReconciliation}
                            disabled={!selectedBankTxId || !selectedSystemTxId || isLoading}
                            className="bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            <LinkIcon /> Conciliar Selecionados
                        </button>
                        <button 
                            onClick={handleConfirmMatches}
                            disabled={suggestions.length === 0 || isLoading}
                            className="bg-green-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:bg-green-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            <CheckIcon /> Confirmar {suggestions.length > 0 ? `${suggestions.length} Pares` : ''}
                        </button>
                         <button 
                            onClick={handleAiReconciliation}
                            disabled={isLoading}
                            className="bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:bg-indigo-400 disabled:cursor-wait"
                        >
                           {isLoading ? <Spinner /> : <AIIcon />}
                           {isLoading ? 'Analisando...' : 'Conciliar com IA'}
                        </button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TransactionColumn 
                    title="Extrato Bancário"
                    transactions={displayBankTxs}
                    suggestions={suggestions}
                    type="bank"
                    selectedTxId={selectedBankTxId}
                    onSelect={handleSelect}
                />
                 <TransactionColumn 
                    title="Lançamentos do Sistema"
                    transactions={unmatchedSystemTxs}
                    suggestions={suggestions}
                    type="system"
                    selectedTxId={selectedSystemTxId}
                    onSelect={handleSelect}
                />
            </div>
        </div>
    );
};

interface TransactionColumnProps {
    title: string;
    transactions: (BankTransaction | SystemTransaction)[];
    suggestions: Suggestion[];
    type: 'bank' | 'system';
    selectedTxId: string | null;
    onSelect: (id: string, type: 'bank' | 'system') => void;
}

const TransactionColumn: React.FC<TransactionColumnProps> = ({ title, transactions, suggestions, type, selectedTxId, onSelect }) => (
    <Card>
        <CardHeader>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{transactions.length} transações para conciliar</p>
        </CardHeader>
        <CardContent>
            {transactions.length > 0 ? (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {transactions.map(tx => {
                        const suggestion = suggestions.find(s => (type === 'bank' ? s.bankTxId : s.systemTxId) === tx.id);
                        return <TransactionItem 
                            key={tx.id} 
                            transaction={tx} 
                            isSuggestion={!!suggestion} 
                            suggestionReason={suggestion?.reason} 
                            isSelected={selectedTxId === tx.id}
                            onClick={() => onSelect(tx.id, type)}
                        />;
                    })}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">Nenhuma transação aqui.</p>
                </div>
            )}
        </CardContent>
    </Card>
);

const AIIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const CheckIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>;
const LinkIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>;
const Spinner = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
