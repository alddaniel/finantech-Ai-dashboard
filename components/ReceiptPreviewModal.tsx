

import React from 'react';
import type { Transaction, Contact } from '../types';
import { downloadPdfFromElement } from '../services/pdfService';

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
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

interface ReceiptPreviewModalProps {
    transaction: Transaction;
    companyName: string;
    contacts: Contact[];
    onClose: () => void;
}

export const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({ transaction, companyName, contacts, onClose }) => {
    const customerName = contacts.find(c => c.id === transaction.contactId)?.name 
        || transaction.invoiceDetails?.customer 
        || 'Cliente não identificado';
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center print-hide">
                    <h2 className="text-xl font-bold">Recibo de Pagamento</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50">
                        <CloseIcon />
                    </button>
                </div>
                
                <div className="overflow-y-auto p-6" id="receipt-content">
                    <div className="printable-area bg-white dark:bg-slate-900 p-8 rounded-lg border border-slate-200/50 dark:border-slate-800/50 print:border-none print:p-0">
                        <header className="flex justify-between items-start pb-4 border-b border-dashed border-slate-300 dark:border-slate-700">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{companyName}</h3>
                                <p className="text-slate-500 dark:text-slate-400">Recibo de Pagamento</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-slate-800 dark:text-slate-200">Data do Recebimento</p>
                                <p className="text-slate-600 dark:text-slate-300">{formatDate(transaction.paymentDate)}</p>
                            </div>
                        </header>
                        <main className="py-8">
                            <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                                Recebemos de <strong className="font-bold text-slate-900 dark:text-white">{customerName}</strong> a importância de 
                                <strong className="font-bold text-slate-900 dark:text-white"> {formatCurrency(transaction.amount)}</strong>, referente a:
                            </p>
                            <p className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-md text-lg font-semibold text-slate-800 dark:text-slate-200">
                                {transaction.description}
                            </p>
                        </main>
                        <footer className="pt-8 text-center">
                            <div className="w-48 h-12 border-b border-slate-400 mx-auto"></div>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{companyName}</p>
                        </footer>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 print-hide">
                    <button onClick={onClose} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                        Fechar
                    </button>
                    <button 
                        onClick={() => downloadPdfFromElement('receipt-content', `recibo_${customerName.replace(/\s/g, '_')}.pdf`)}
                        className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <DownloadIcon /> Salvar como PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const DownloadIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>;