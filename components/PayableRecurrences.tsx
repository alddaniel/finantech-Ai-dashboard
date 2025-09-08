import React, { useMemo, useState } from 'react';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import type { Transaction, View, Contact, ToastMessage } from '../types';
import { VIEWS } from '../constants';
import { ConfirmationModal } from './ConfirmationModal';

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

interface PayableRecurrencesProps {
    payables: Transaction[];
    selectedCompany: string;
    setPayables: React.Dispatch<React.SetStateAction<Transaction[]>>;
    addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

export const PayableRecurrences: React.FC<PayableRecurrencesProps> = ({ payables, selectedCompany, setPayables, addToast }) => {
    const [itemToDelete, setItemToDelete] = useState<Transaction | null>(null);

    const recurringTransactions = useMemo(() => {
        return payables.filter(p => p.recurrence && p.company === selectedCompany);
    }, [payables, selectedCompany]);

    const handleEdit = (id: string) => {
        // This functionality requires an edit view or modal, which is not implemented for recurrences.
        console.log("Edit for recurrence ID:", id);
    };

    const handleConfirmDelete = () => {
        if (!itemToDelete) return;
        setPayables(prev => prev.filter(p => p.id !== itemToDelete.id));
        addToast({
            type: 'success',
            title: 'Recorrência Excluída!',
            description: `A despesa recorrente "${itemToDelete.description}" foi removida.`
        });
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Despesas Recorrentes</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
                Gerencie suas assinaturas, aluguéis e outras despesas contínuas.
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-500">{formatCurrency(transaction.amount)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{transaction.recurrence?.interval === 'monthly' ? 'Mensal' : 'Anual'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm"><Badge color={getStatusColor(transaction.status)}>{transaction.status}</Badge></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(transaction.dueDate)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                            <button onClick={() => handleEdit(transaction.id)} className="font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                                                Editar
                                            </button>
                                            <button onClick={() => setItemToDelete(transaction)} className="font-semibold text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {recurringTransactions.length === 0 && (
                            <p className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhuma despesa recorrente encontrada para esta empresa.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Confirmar Exclusão de Recorrência"
            >
                Tem certeza que deseja excluir a recorrência <strong className="text-slate-800 dark:text-slate-100">"{itemToDelete?.description}"</strong>? Esta ação não pode ser desfeita.
            </ConfirmationModal>
        </div>
    );
};