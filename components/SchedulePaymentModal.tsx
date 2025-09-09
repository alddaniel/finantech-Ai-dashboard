

import React, { useState, useEffect } from 'react';
import type { Transaction, BankAccount } from '../types';

interface SchedulePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (transactionId: string, scheduledDate: string, email: string, bankAccountId: string) => void;
    transaction: Transaction | null;
    bankAccounts: BankAccount[];
}

const inputStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";
const selectStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 pl-3 pr-10 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";

export const SchedulePaymentModal: React.FC<SchedulePaymentModalProps> = ({ isOpen, onClose, onConfirm, transaction, bankAccounts }) => {
    const [scheduledDate, setScheduledDate] = useState('');
    const [email, setEmail] = useState('');
    const [sendEmail, setSendEmail] = useState(false);
    const [bankAccountId, setBankAccountId] = useState('');

    useEffect(() => {
        if (transaction) {
            if (transaction.status === 'Agendado' && transaction.scheduledPaymentDate) {
                let inputDate = transaction.scheduledPaymentDate;
                if (inputDate.includes('/')) {
                    const [day, month, year] = inputDate.split('/');
                    inputDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                }
                setScheduledDate(inputDate.split('T')[0]);
            } else {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setScheduledDate(tomorrow.toISOString().split('T')[0]);
            }
            
            const notificationEmail = transaction.notificationEmail || '';
            setEmail(notificationEmail);
            setSendEmail(!!notificationEmail);
            setBankAccountId(transaction.bankAccount || '');
        }
    }, [transaction]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (transaction && scheduledDate && bankAccountId) {
            onConfirm(transaction.id, scheduledDate, sendEmail ? email : '', bankAccountId);
        } else {
            alert("Por favor, selecione uma conta bancária.");
        }
    };

    if (!isOpen || !transaction) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Agendar Pagamento
                        </h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <p className="text-slate-600 dark:text-slate-300">
                            Você está agendando a despesa: <strong className="text-slate-800 dark:text-slate-100">{transaction.description}</strong>.
                        </p>
                        <div>
                            <label htmlFor="scheduledDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Selecione a data para o agendamento</label>
                            <input
                                type="date"
                                id="scheduledDate"
                                name="scheduledDate"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                required
                                className={inputStyle}
                            />
                        </div>
                        <div>
                            <label htmlFor="bankAccount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Conta para Débito</label>
                            <select
                                id="bankAccount"
                                value={bankAccountId}
                                onChange={(e) => setBankAccountId(e.target.value)}
                                required
                                className={selectStyle}
                            >
                                <option value="" disabled>Selecione uma conta</option>
                                {bankAccounts
                                    .filter(acc => acc.company === transaction.company)
                                    .map(acc => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.name} ({acc.agency}/{acc.account})
                                        </option>
                                ))}
                            </select>
                        </div>
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={sendEmail}
                                    onChange={(e) => setSendEmail(e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <span className="ml-2 text-slate-700 dark:text-slate-300">
                                    Enviar lembrete por e-mail 1 dia antes
                                </span>
                            </label>
                            {sendEmail && (
                                <div className="mt-2 pl-6">
                                    <label htmlFor="notificationEmail" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        E-mail para notificação
                                    </label>
                                    <input
                                        type="email"
                                        id="notificationEmail"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="exemplo@dominio.com"
                                        required
                                        className={inputStyle}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="px-6 py-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                        <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors">
                            Confirmar Agendamento
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
