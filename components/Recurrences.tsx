
import React, { useMemo } from 'react';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import type { Transaction, View, Contact } from '../types';
import { VIEWS } from '../constants';

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

const getStatusColor = (status: Transaction['status']): 'green' | 'yellow' | 'red' => {
    switch (status) {
        case 'Pago': return 'green';
        case 'Pendente': return 'yellow';
        case 'Vencido': return 'red';
    }
};

interface RecurrencesProps {
    receivables: Transaction[];
    selectedCompany: string;
    setReceivables: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

export const Recurrences: React.FC<RecurrencesProps> = ({ receivables, selectedCompany, setReceivables }) => {
    const recurringTransactions = useMemo(() => {
        return receivables.filter(r => r.recurrence && r.company === selectedCompany);
    }, [receivables, selectedCompany]);

    const handleEdit = (id: string) => {
        // This functionality requires an edit view or modal, which is not implemented for simple recurrences.
        console.log("Edit for recurrence ID:", id);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza de que deseja excluir esta receita recorrente? Esta ação não pode ser desfeita.')) {
            setReceivables(prev => prev.filter(r => r.id !== id));
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Receitas Recorrentes</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
                Gerencie suas assinaturas, mensalidades e outras receitas contínuas.
            </p>
            <Card className="!p-0">
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Descrição</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Frequência</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status Atual</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Próximo Vencimento</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900">
                                {recurringTransactions.map(transaction => (
                                    <tr key={transaction.id} className="even:bg-gray-50 dark:even:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{transaction.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-500">{formatCurrency(transaction.amount)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{transaction.recurrence?.interval === 'monthly' ? 'Mensal' : 'Anual'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm"><Badge color={getStatusColor(transaction.status)}>{transaction.status}</Badge></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(transaction.dueDate)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                            <button onClick={() => handleEdit(transaction.id)} className="font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                                                Editar
                                            </button>
                                            <button onClick={() => handleDelete(transaction.id)} className="font-semibold text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {recurringTransactions.length === 0 && (
                            <p className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhuma receita recorrente encontrada para esta empresa.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
