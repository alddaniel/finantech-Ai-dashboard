import React, { useState, useEffect, useMemo } from 'react';
import type { Transaction } from '../types';
import { calculateCharges } from '../services/apiService';
import { MOCK_PAYMENT_METHODS } from '../constants';

// --- Currency Formatting Utilities ---
const formatCurrencyOnInput = (value: string): string => {
  if (!value) return '';
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly.length === 0) return '';
  const numberValue = parseFloat(digitsOnly) / 100;
  return numberValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const parseFormattedCurrency = (value: string): number => {
    if (typeof value !== 'string' || !value) return 0;
    const cleanedValue = value.replace(/R\$\s?/, '').replace(/\./g, '');
    const numericString = cleanedValue.replace(',', '.');
    return parseFloat(numericString) || 0;
};
// --- End Currency Formatting Utilities ---

const inputStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";
const selectStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 pl-3 pr-10 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";


interface PaymentConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (transactionId: string, amount: number, paymentDate: string, paymentMethod: string) => void;
    transaction: Transaction | null;
}

export const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({ isOpen, onClose, onConfirm, transaction }) => {
    const [amountString, setAmountString] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [paymentMethod, setPaymentMethod] = useState(MOCK_PAYMENT_METHODS[0]);

    const calculatedTotal = useMemo(() => {
        if (!transaction) return { total: 0, interest: 0, fine: 0 };
        return calculateCharges(transaction);
    }, [transaction]);

    useEffect(() => {
        if (transaction) {
            setAmountString(calculatedTotal.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
            
            let initialPaymentDate = new Date().toISOString().split('T')[0];
            if (transaction.status === 'Agendado' && transaction.scheduledPaymentDate) {
                let scheduledDate = transaction.scheduledPaymentDate;
                // Normalize date format to YYYY-MM-DD for the input
                if (scheduledDate.includes('/')) {
                    const [day, month, year] = scheduledDate.split('/');
                    scheduledDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                }
                initialPaymentDate = scheduledDate.split('T')[0];
            }
            
            setPaymentDate(initialPaymentDate);
            setPaymentMethod(transaction.paymentMethod || MOCK_PAYMENT_METHODS[0]);
        }
    }, [transaction, calculatedTotal]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (transaction) {
            onConfirm(transaction.id, parseFormattedCurrency(amountString), paymentDate, paymentMethod);
        }
    };

    if (!isOpen || !transaction) return null;

    const verb = transaction.type === 'despesa' ? 'Pagar' : 'Receber';
    const verbIng = transaction.type === 'despesa' ? 'Pagamento' : 'Recebimento';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Confirmar {verbIng}</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <p className="text-slate-600 dark:text-slate-300">
                            Você está prestes a baixar a transação: <strong className="text-slate-800 dark:text-slate-100">{transaction.description}</strong>.
                        </p>
                        
                        {transaction.status === 'Vencido' && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-md">
                                <h4 className="font-bold text-yellow-800 dark:text-yellow-200">Detalhes da Cobrança por Atraso</h4>
                                <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 grid grid-cols-3 gap-2">
                                    <p>Valor Original: <strong className="block">{transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></p>
                                    <p>Multa: <strong className="block">{calculatedTotal.fine.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></p>
                                    <p>Juros: <strong className="block">{calculatedTotal.interest.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></p>
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="paymentAmount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Valor a {verb} (R$)</label>
                            <input
                                type="text"
                                inputMode="decimal"
                                id="paymentAmount"
                                value={amountString}
                                onChange={(e) => setAmountString(formatCurrencyOnInput(e.target.value))}
                                required
                                className={inputStyle}
                            />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="paymentDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data da Baixa</label>
                                <input
                                    type="date"
                                    id="paymentDate"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    required
                                    className={inputStyle}
                                />
                            </div>
                            <div>
                                <label htmlFor="paymentMethod" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Meio de {verbIng}</label>
                                <select 
                                    id="paymentMethod" 
                                    value={paymentMethod} 
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    required
                                    className={selectStyle}
                                >
                                    {MOCK_PAYMENT_METHODS.map(method => <option key={method} value={method}>{method}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                        <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-green-700 transition-colors">
                            Confirmar {verbIng}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};