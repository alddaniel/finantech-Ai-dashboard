
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { ExpenseModal } from './ExpenseModal';
import type { Transaction, Contact } from '../types';

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

const getStatusColor = (status: Transaction['status']): 'green' | 'yellow' | 'red' | 'blue' => {
    switch (status) {
        case 'Pago': return 'green';
        case 'Pendente': return 'yellow';
        case 'Vencido': return 'red';
        case 'Agendado': return 'blue';
    }
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


const calculateCharges = (transaction: Transaction) => {
    if (transaction.status !== 'Vencido') {
        return { interest: 0, fine: 0, total: transaction.amount };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = parseDate(transaction.dueDate);

    if (isNaN(dueDate.getTime()) || today <= dueDate) {
        return { interest: 0, fine: 0, total: transaction.amount };
    }
    dueDate.setHours(0, 0, 0, 0);

    let fine = 0;
    if (transaction.fineRate && transaction.fineRate > 0) {
        fine = transaction.amount * (transaction.fineRate / 100);
    }

    let interest = 0;
    if (transaction.interestRate && transaction.interestType) {
        const timeDiff = today.getTime() - dueDate.getTime();
        const daysOverdue = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
        const ratePerPeriod = transaction.interestRate / 100;

        if (transaction.interestType === 'daily') {
            interest = transaction.amount * ratePerPeriod * daysOverdue;
        } else if (transaction.interestType === 'monthly') {
            const monthsOverdue = daysOverdue / 30;
            interest = transaction.amount * ratePerPeriod * monthsOverdue;
        }
    }
    
    interest = Math.max(0, interest);
    fine = Math.max(0, fine);

    return {
        interest,
        fine,
        total: transaction.amount + interest + fine,
    };
};

interface AccountsPayableProps {
    selectedCompany: string;
    payables: Transaction[];
    setPayables: React.Dispatch<React.SetStateAction<Transaction[]>>;
    contacts: Contact[];
}

export const AccountsPayable: React.FC<AccountsPayableProps> = ({ selectedCompany, payables, setPayables, contacts }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [expenseToEdit, setExpenseToEdit] = useState<Transaction | null>(null);

    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const transactionsToUpdate = payables.filter(tx => {
            if (tx.status === 'Pago' || tx.status === 'Vencido' || tx.status === 'Agendado') return false;
            const dueDate = parseDate(tx.dueDate);
            if (isNaN(dueDate.getTime())) return false;
            dueDate.setHours(0, 0, 0, 0);
            return dueDate < today;
        });

        if (transactionsToUpdate.length > 0) {
            const idsToUpdate = new Set(transactionsToUpdate.map(t => t.id));
            setPayables(currentPayables => 
                currentPayables.map(tx => 
                    idsToUpdate.has(tx.id) ? { ...tx, status: 'Vencido' } : tx
                )
            );
        }
    }, [payables, setPayables]);


    const filteredTransactions = payables.filter(t => t.company === selectedCompany);

    const handleOpenModal = (expense: Transaction | null = null) => {
        setExpenseToEdit(expense);
        setModalOpen(true);
    };

    const handleSaveExpense = (expenseData: Transaction) => {
        if (expenseToEdit) {
            setPayables(payables.map(p => p.id === expenseData.id ? expenseData : p));
        } else {
            setPayables([...payables, { ...expenseData, id: `p${Date.now()}` }]);
        }
    };
    
    const handleMarkAsPaid = (transaction: Transaction) => {
        const { total } = calculateCharges(transaction);
        setPayables(currentPayables =>
            currentPayables.map(t =>
                t.id === transaction.id ? { 
                    ...t, 
                    status: 'Pago',
                    amount: total,
                    interestRate: undefined,
                    interestType: undefined,
                    fineRate: undefined,
                    paymentDate: new Date().toISOString().split('T')[0],
                } : t
            )
        );
    };

     const handleSchedule = (id: string) => {
        setPayables(currentPayables =>
            currentPayables.map(t =>
                t.id === id ? { ...t, status: 'Agendado' } : t
            )
        );
    };
    
    return (
        <>
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contas a Pagar</h1>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center"
                >
                    <PlusIcon />
                    <span className="ml-2">Adicionar Despesa</span>
                </button>
            </div>
            <Card className="!p-0">
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Descrição</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vencimento</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Forma de Pagamento</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor Original</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Multa</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Juros</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor Total</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900">
                                {filteredTransactions.map((transaction) => {
                                    const { interest, fine, total } = calculateCharges(transaction);
                                    return (
                                        <tr key={transaction.id} className="even:bg-gray-50 dark:even:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                <div className="flex items-center gap-2">
                                                    {transaction.recurrence && <RepeatIcon />}
                                                    {transaction.description}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(transaction.dueDate)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{transaction.paymentMethod || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatCurrency(transaction.amount)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                                                {fine > 0 ? formatCurrency(fine) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                                                {interest > 0 ? formatCurrency(interest) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-500">{formatCurrency(total)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Badge color={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                {transaction.status !== 'Pago' && (
                                                     <button 
                                                        onClick={() => handleMarkAsPaid(transaction)}
                                                        className="bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 font-semibold px-3 py-1 rounded-md text-xs hover:bg-green-200 dark:hover:bg-green-500/20 transition-colors">
                                                        Baixar Pagamento
                                                    </button>
                                                )}
                                                {transaction.status === 'Pendente' && (
                                                    <button 
                                                        onClick={() => handleSchedule(transaction.id)}
                                                        className="bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 font-semibold px-3 py-1 rounded-md text-xs hover:bg-blue-200 dark:hover:bg-blue-500/20 transition-colors">
                                                        Agendar
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleOpenModal(transaction)}
                                                    className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold">
                                                    Editar
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                         {filteredTransactions.length === 0 && <p className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhuma conta a pagar para esta empresa.</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
        <ExpenseModal
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            onSave={handleSaveExpense}
            expenseToEdit={expenseToEdit}
            selectedCompany={selectedCompany}
            contacts={contacts}
        />
        </>
    );
};

const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;
const RepeatIcon = () => <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Transação Recorrente</title><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l16 16"></path></svg>;