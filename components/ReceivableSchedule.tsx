



import React, { useMemo, useState } from 'react';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import type { Transaction, View, Contact, BankAccount } from '../types';
import { VIEWS } from '../constants';
import { ScheduleReceivableModal } from './ScheduleReceivableModal';

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDate = (dateString: string | undefined): string => {
    if (!dateString) {
        return '-';
    }
    // Handles both DD/MM/YYYY and YYYY-MM-DD, returns DD/MM/YYYY
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const parts = dateString.split('-');
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return dateString;
    }
    return dateString;
};

const getStatusColor = (status: Transaction['status']): 'yellow' | 'blue' => {
    switch (status) {
        case 'Pendente': return 'yellow';
        case 'Agendado': return 'blue';
        default: return 'yellow';
    }
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

interface ReceivableScheduleProps {
    receivables: Transaction[];
    setReceivables: React.Dispatch<React.SetStateAction<Transaction[]>>;
    selectedCompany: string;
    setActiveView: (view: View) => void;
    contacts: Contact[];
    onOpenInvoiceModal: () => void;
    bankAccounts: BankAccount[];
    onOpenQRCodeModal: (transaction: Transaction) => void;
}

export const ReceivableSchedule: React.FC<ReceivableScheduleProps> = ({ receivables, setReceivables, selectedCompany, setActiveView, contacts, onOpenInvoiceModal, bankAccounts, onOpenQRCodeModal }) => {
    const [transactionToSchedule, setTransactionToSchedule] = useState<Transaction | null>(null);

    const scheduledReceivables = useMemo(() => {
        return receivables
            .filter(r => r.company === selectedCompany && (r.status === 'Pendente' || r.status === 'Agendado'))
            .sort((a, b) => {
                const dateA = a.status === 'Agendado' && a.scheduledPaymentDate ? parseDate(a.scheduledPaymentDate) : parseDate(a.dueDate);
                const dateB = b.status === 'Agendado' && b.scheduledPaymentDate ? parseDate(b.scheduledPaymentDate) : parseDate(b.dueDate);
                if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
                return dateA.getTime() - dateB.getTime();
            });
    }, [receivables, selectedCompany]);

    const handleConfirmSchedule = (transactionId: string, scheduledDate: string, email: string, bankAccountId: string) => {
        setReceivables(currentReceivables =>
            currentReceivables.map(t =>
                t.id === transactionId ? { 
                    ...t, 
                    status: 'Agendado',
                    scheduledPaymentDate: scheduledDate,
                    notificationEmail: email || undefined,
                    notificationSentOn: undefined, // Reset notification status
                    bankAccount: bankAccountId,
                } : t
            )
        );
        setTransactionToSchedule(null);
    };

    const handleCancelSchedule = (transactionId: string) => {
        if (window.confirm('Tem certeza de que deseja cancelar este agendamento? A conta voltará a ser "Pendente".')) {
            setReceivables(currentReceivables =>
                currentReceivables.map(t =>
                    t.id === transactionId ? { 
                        ...t, 
                        status: 'Pendente',
                        scheduledPaymentDate: undefined,
                        notificationEmail: undefined,
                        notificationSentOn: undefined, // Reset notification status
                    } : t
                )
            );
        }
    };

    const handleEmailReminder = (transaction: Transaction) => {
        const contact = contacts.find(c => c.id === transaction.contactId);
        if (!contact?.email) {
            alert('Este contato não possui um e-mail cadastrado para enviar o lembrete.');
            return;
        }

        const subject = `Lembrete de Cobrança: ${transaction.description}`;
        const dueDate = formatDate(transaction.dueDate);
        const amount = formatCurrency(transaction.amount);
        const body = `Olá ${contact.name},\n\nEste é um lembrete sobre a cobrança de "${transaction.description}" no valor de ${amount}, com vencimento em ${dueDate}.\n\nPor favor, confirme o recebimento deste e-mail.\n\nAtenciosamente,\n${selectedCompany}`;

        window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    return (
        <>
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agenda de Recebimentos</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                            Visualize e gerencie suas contas a receber pendentes e agendadas.
                        </p>
                    </div>
                    <button
                        onClick={() => onOpenInvoiceModal()}
                        className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center"
                    >
                        <PlusIcon />
                        <span className="ml-2">Agendar Novo Recebimento</span>
                    </button>
                </div>

                {scheduledReceivables.length > 0 ? (
                    <Card className="!p-0">
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Descrição</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data Agendada</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vencimento Original</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900">
                                        {scheduledReceivables.map(transaction => {
                                             const contact = contacts.find(c => c.id === transaction.contactId);
                                             const canEmail = !!contact?.email;

                                             return (
                                            <tr key={transaction.id} className="even:bg-gray-50 dark:even:bg-gray-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{transaction.description}</td>
                                                <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">{formatDate(transaction.scheduledPaymentDate)}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(transaction.dueDate)}</td>
                                                <td className="px-6 py-4 font-bold text-green-500">{formatCurrency(transaction.amount)}</td>
                                                <td className="px-6 py-4"><Badge color={getStatusColor(transaction.status)}>{transaction.status}</Badge></td>
                                                <td className="px-6 py-4 text-sm font-medium flex items-center gap-2">
                                                    {transaction.status === 'Agendado' ? (
                                                        <>
                                                            <button 
                                                                onClick={() => setTransactionToSchedule(transaction)}
                                                                className="font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                                                                Editar
                                                            </button>
                                                            <button 
                                                                onClick={() => handleCancelSchedule(transaction.id)}
                                                                className="font-semibold text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                                                                Cancelar
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button 
                                                            onClick={() => setTransactionToSchedule(transaction)}
                                                            className="font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                                                            Agendar
                                                        </button>
                                                    )}
                                                     <button
                                                        onClick={() => onOpenQRCodeModal(transaction)}
                                                        className="font-semibold text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 inline-flex items-center gap-1"
                                                        title="Gerar QR Code PIX para pagamento">
                                                        <QRCodeIcon /> PIX
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEmailReminder(transaction)}
                                                        className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 font-semibold px-2 py-1 rounded-md text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={!canEmail}
                                                        title={canEmail ? "Enviar lembrete por e-mail" : "Vincule um contato com e-mail cadastrado para usar esta função"}
                                                    >
                                                        <MailIcon />
                                                    </button>
                                                </td>
                                            </tr>
                                             );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="text-center py-20">
                            <div className="bg-gray-100 dark:bg-gray-800/50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                                <CalendarIcon />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Agenda Limpa!</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">Nenhum recebimento pendente ou agendado para esta empresa.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
            <ScheduleReceivableModal
                isOpen={!!transactionToSchedule}
                onClose={() => setTransactionToSchedule(null)}
                onConfirm={handleConfirmSchedule}
                transaction={transactionToSchedule}
                bankAccounts={bankAccounts}
            />
        </>
    );
};

const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;
const CalendarIcon = () => <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>;
const MailIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>;
const QRCodeIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;