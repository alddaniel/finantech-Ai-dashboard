

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { VIEWS } from '../constants';
import type { Transaction, View } from '../types';
import { InvoicePreviewModal } from './InvoicePreviewModal';

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

interface GeneratedInvoicesProps {
    selectedCompany: string;
    receivables: Transaction[];
    setReceivables: React.Dispatch<React.SetStateAction<Transaction[]>>;
    onOpenInvoiceModal: (data?: { receivableToEdit: Transaction } | null) => void;
}

export const GeneratedInvoices: React.FC<GeneratedInvoicesProps> = ({ selectedCompany, receivables, setReceivables, onOpenInvoiceModal }) => {
    const [viewingInvoice, setViewingInvoice] = useState<Transaction | null>(null);

    const generatedInvoices = useMemo(() => {
        return receivables.filter(r => r.invoiceDetails && r.company === selectedCompany);
    }, [receivables, selectedCompany]);

    const handleEdit = (transactionId: string) => {
        const invoiceToEdit = generatedInvoices.find(inv => inv.id === transactionId);
        if (invoiceToEdit) {
            onOpenInvoiceModal({ receivableToEdit: invoiceToEdit });
        }
    };

    const handleDelete = (transactionId: string) => {
        if (window.confirm('Tem certeza de que deseja excluir esta cobrança? Esta ação não pode ser desfeita.')) {
            setReceivables(currentReceivables =>
                currentReceivables.filter(t => t.id !== transactionId)
            );
        }
    };
    
    return (
        <>
            <div className={`space-y-8 ${viewingInvoice ? 'print-hide' : ''}`}>
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cobranças Geradas</h1>
                    <button 
                        onClick={() => onOpenInvoiceModal()}
                        className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center">
                        <PlusIcon />
                        <span className="ml-2">Gerar Nova Cobrança</span>
                    </button>
                </div>
                <Card className="!p-0">
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cliente</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vencimento</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor Total</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800/50">
                                    {generatedInvoices.map((transaction) => (
                                        <tr key={transaction.id} className="even:bg-slate-50 dark:even:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {transaction.invoiceDetails?.customer}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(transaction.dueDate)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-500">{formatCurrency(transaction.amount)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Badge color={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                                <button onClick={() => setViewingInvoice(transaction)} className="font-semibold text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300">
                                                    Visualizar
                                                </button>
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
                             {generatedInvoices.length === 0 && <p className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhuma cobrança gerada para esta empresa.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
            {viewingInvoice && (
                <InvoicePreviewModal
                    invoice={viewingInvoice}
                    onClose={() => setViewingInvoice(null)}
                />
            )}
        </>
    );
};

const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;