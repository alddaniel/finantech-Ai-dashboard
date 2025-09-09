

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import type { DebtorCustomer, CommunicationHistory } from '../types';
import { getSmartCollectionStrategy } from '../services/geminiService';

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

const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const AIIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>;
const InvoiceIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;

const textareaStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";
const selectStyle = "mt-1 block rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-1.5 px-2 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";

interface CustomerDetailModalProps {
    debtor: DebtorCustomer;
    onClose: () => void;
    onAddCommunication: (debtorId: string, newLog: Omit<CommunicationHistory, 'id'>) => void;
    onGenerateInvoice: (debtor: DebtorCustomer) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ debtor, onClose, onAddCommunication, onGenerateInvoice }) => {
    const [newLogSummary, setNewLogSummary] = useState('');
    const [newLogType, setNewLogType] = useState<'call' | 'email' | 'sms' | 'whatsapp'>('call');
    const [isLoadingStrategy, setIsLoadingStrategy] = useState(false);
    const [strategy, setStrategy] = useState('');

    const handleLogSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLogSummary.trim()) return;
        const newLog = {
            date: new Date().toLocaleDateString('pt-BR'),
            type: newLogType,
            summary: newLogSummary
        };
        onAddCommunication(debtor.id, newLog);
        setNewLogSummary('');
    };

    const handleGenerateStrategy = async () => {
        setIsLoadingStrategy(true);
        setStrategy('');
        const result = await getSmartCollectionStrategy(debtor);
        setStrategy(result);
        setIsLoadingStrategy(false);
    };

    const handleGenerateClick = () => {
        onGenerateInvoice(debtor);
        onClose(); // Close modal after initiating navigation
    };

    const formattedStrategy = strategy
        .replace(/## (.*)/g, '<h4 class="text-md font-bold mt-3 mb-1 text-gray-800 dark:text-gray-100">$1</h4>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\* (.*)/g, '<li class="ml-5 list-disc">$1</li>')
        .replace(/^- (.*)/gm, '<li class="ml-5 list-disc">$1</li>')
        .replace(/\n/g, '<br />');

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-4xl my-8"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                    <h2 id="modal-title" className="text-2xl font-bold text-gray-900 dark:text-white">{debtor.name}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Resumo do Cliente</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div><span className="font-medium text-gray-500">Dívida Total:</span> <span className="font-bold text-red-500 text-lg">{formatCurrency(debtor.totalDebt)}</span></div>
                            <div><span className="font-medium text-gray-500">Status:</span> <span className="font-bold text-gray-800 dark:text-gray-200">{debtor.status}</span></div>
                            <div><span className="font-medium text-gray-500">Último Vencimento:</span> <span className="font-bold text-gray-800 dark:text-gray-200">{formatDate(debtor.lastDueDate)}</span></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Histórico de Comunicação</h3>
                            <div className="space-y-3">
                                <ul className="space-y-4 max-h-48 overflow-y-auto pr-2">
                                    {debtor.communicationHistory.length > 0 ? debtor.communicationHistory.slice().reverse().map(log => (
                                        <li key={log.id} className="text-sm">
                                            <p className="font-bold">{log.type.toUpperCase()} - {formatDate(log.date)}</p>
                                            <p className="text-gray-600 dark:text-gray-400">{log.summary}</p>
                                        </li>
                                    )) : <p className="text-sm text-gray-500">Nenhum registro encontrado.</p>}
                                </ul>
                                <form onSubmit={handleLogSubmit} className="border-t border-slate-200/50 dark:border-slate-700/50 pt-4 space-y-2">
                                    <textarea value={newLogSummary} onChange={e => setNewLogSummary(e.target.value)} placeholder="Adicionar novo registro..." rows={2} className={textareaStyle}></textarea>
                                    <div className="flex justify-between items-center">
                                        <select value={newLogType} onChange={e => setNewLogType(e.target.value as any)} className={selectStyle}>
                                            <option value="call">Ligação</option>
                                            <option value="email">E-mail</option>
                                            <option value="sms">SMS</option>
                                            <option value="whatsapp">WhatsApp</option>
                                        </select>
                                        <button type="submit" className="bg-indigo-600 text-white font-semibold px-3 py-1 rounded-md text-sm hover:bg-indigo-700 transition-colors">Registrar</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                             <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Régua de Cobrança Inteligente</h3>
                                <AIIcon />
                            </div>
                            <div className="space-y-3">
                                {!strategy && !isLoadingStrategy &&
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Clique para gerar um plano de ação com IA para este cliente, com base no seu histórico e perfil de dívida.</p>
                                }
                                <div className="flex justify-center">
                                    <button onClick={handleGenerateStrategy} disabled={isLoadingStrategy} className="w-full bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-wait">
                                        {isLoadingStrategy ? 'Gerando Estratégia...' : 'Gerar com Gemini'}
                                    </button>
                                </div>
                                 {isLoadingStrategy && (
                                    <div className="flex flex-col items-center justify-center p-4">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Analisando...</p>
                                    </div>
                                )}
                                {strategy && (
                                     <div className="prose prose-sm dark:prose-invert max-w-none pt-2 border-t border-slate-200/50 dark:border-slate-700/50 mt-3" dangerouslySetInnerHTML={{ __html: formattedStrategy }}></div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                    >
                        Fechar
                    </button>
                     <button
                        onClick={handleGenerateClick}
                        disabled={debtor.hasOpenInvoice}
                        title={debtor.hasOpenInvoice ? "Este cliente já possui uma cobrança pendente. Baixe a cobrança existente em 'Contas a Receber'." : "Gerar nova cobrança consolidada"}
                        className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <InvoiceIcon />
                        Gerar Cobrança
                    </button>
                </div>
            </div>
        </div>
    );
};