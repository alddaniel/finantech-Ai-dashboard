import React, { useState, useMemo, useEffect, Fragment } from 'react';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { VIEWS } from '../constants';
import type { Transaction, View, Contact, Property, BankAccount, ToastMessage } from '../types';
import { InvoicePreviewModal } from './InvoicePreviewModal';
import { ScheduleReceivableModal } from './ScheduleReceivableModal';
import { AttachmentPreviewModal } from './AttachmentPreviewModal';
import { ReceiptPreviewModal } from './ReceiptPreviewModal';
import { calculateCharges, parseDate } from '../services/apiService';
import { downloadPdfFromElement } from '../services/pdfService';
import type { GroupingType } from './Reports';
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

const base64ToBlob = (base64: string, mimeType: string): Blob | null => {
    try {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    } catch (e) {
        console.error("Error decoding base64:", e);
        return null;
    }
};

interface ReceiptsProps {
    selectedCompany: string;
    receivables: Transaction[];
    setReceivables: React.Dispatch<React.SetStateAction<Transaction[]>>;
    onOpenInvoiceModal: (data?: { receivableToEdit: Transaction } | null) => void;
    onOpenConfirmPaymentModal: (transaction: Transaction) => void;
    contacts: Contact[];
    properties: Property[];
    bankAccounts: BankAccount[];
    startDate?: string;
    endDate?: string;
    groupingType?: GroupingType;
    onOpenQRCodeModal: (transaction: Transaction) => void;
    addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

const PdfIcon = () => <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const ExcelIcon = () => <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;


export const Receipts: React.FC<ReceiptsProps> = ({ selectedCompany, receivables, setReceivables, onOpenInvoiceModal, onOpenConfirmPaymentModal, contacts, properties, bankAccounts, startDate, endDate, groupingType = 'none', onOpenQRCodeModal, addToast }) => {
    const [viewingInvoice, setViewingInvoice] = useState<Transaction | null>(null);
    const [transactionToSchedule, setTransactionToSchedule] = useState<Transaction | null>(null);
    const [viewingAttachment, setViewingAttachment] = useState<NonNullable<Transaction['attachments']>[0] | null>(null);
    const [receiptToGenerate, setReceiptToGenerate] = useState<Transaction | null>(null);
    const [itemToDelete, setItemToDelete] = useState<Transaction | null>(null);

    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const transactionsToUpdate = receivables.filter(tx => {
            if (tx.status === 'Pago' || tx.status === 'Vencido' || tx.status === 'Agendado') return false;
            const dueDate = parseDate(tx.dueDate);
            if (isNaN(dueDate.getTime())) return false;
            dueDate.setHours(0, 0, 0, 0);
            return dueDate < today;
        });

        if (transactionsToUpdate.length > 0) {
            const idsToUpdate = new Set(transactionsToUpdate.map(t => t.id));
            setReceivables(currentReceivables => 
                currentReceivables.map(tx => 
                    idsToUpdate.has(tx.id) ? { ...tx, status: 'Vencido' } : tx
                )
            );
        }
    }, [receivables, setReceivables]);
    
    const filteredTransactions = useMemo(() => {
        let transactions = receivables.filter(t => t.company === selectedCompany);

        if (startDate && endDate) {
            const start = parseDate(startDate);
            const end = parseDate(endDate);
            end.setHours(23, 59, 59, 999);

            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                transactions = transactions.filter(t => {
                    const dueDate = parseDate(t.dueDate);
                    if (isNaN(dueDate.getTime())) return false;
                    return dueDate >= start && dueDate <= end;
                });
            }
        }
        return transactions;
    }, [receivables, selectedCompany, startDate, endDate]);

    const groupedTransactions = useMemo(() => {
        if (groupingType === 'none') {
            return { 'all': filteredTransactions };
        }
        
        const groupKey = groupingType === 'status' ? 'status' : 'costCenter';

        return filteredTransactions.reduce((acc, tx) => {
            const key = tx[groupKey] || 'Não categorizado';
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(tx);
            return acc;
        }, {} as Record<string, Transaction[]>);

    }, [filteredTransactions, groupingType]);

    const handleConfirmSchedule = (transactionId: string, scheduledDate: string, email: string, bankAccountId: string) => {
        setReceivables(currentReceivables =>
            currentReceivables.map(t =>
                t.id === transactionId ? { 
                    ...t, 
                    status: 'Agendado',
                    scheduledPaymentDate: scheduledDate,
                    notificationEmail: email || undefined,
                    notificationSentOn: undefined, // Reset notification status on schedule change
                    bankAccount: bankAccountId,
                } : t
            )
        );
        setTransactionToSchedule(null);
    };

    const handleEdit = (transaction: Transaction) => {
        onOpenInvoiceModal({ receivableToEdit: transaction });
    };

    const handleConfirmDelete = () => {
        if (!itemToDelete) return;
        setReceivables(prev => prev.filter(r => r.id !== itemToDelete.id));
        addToast({
            type: 'success',
            title: 'Receita Excluída!',
            description: `A receita "${itemToDelete.description}" foi removida com sucesso.`
        });
        setItemToDelete(null);
    };
    
    const handleViewAttachment = (attachment: NonNullable<Transaction['attachments']>[0]) => {
        const blob = base64ToBlob(attachment.fileContent, attachment.fileType);
        if (!blob) {
            addToast({type: 'warning', title: 'Erro', description: 'Não foi possível carregar o anexo.'});
            return;
        }

        if (attachment.fileType === 'application/pdf') {
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } else {
            setViewingAttachment(attachment);
        }
    };

    const handleDownloadAttachment = (attachment: NonNullable<Transaction['attachments']>[0]) => {
        const blob = base64ToBlob(attachment.fileContent, attachment.fileType);
        if (!blob) {
            addToast({type: 'warning', title: 'Erro', description: 'Não foi possível baixar o anexo.'});
            return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = attachment.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

     const handleExportCsv = () => {
        const headers = ['Descrição', 'Cliente', 'Categoria', 'Centro de Custo', 'Vencimento', 'Valor Original', 'Juros', 'Multa', 'Valor Total', 'Status'];
        let rows: string[] = [];
        
        Object.entries(groupedTransactions).forEach(([groupName, transactions]) => {
            if (groupingType !== 'none') {
                rows.push(`"${groupName}";;;;;;;;`);
            }

            transactions.forEach(t => {
                const clientName = contacts.find(c => c.id === t.contactId)?.name || t.invoiceDetails?.customer || 'N/A';
                const { interest, fine, total } = calculateCharges(t);
                rows.push([
                    `"${t.description.replace(/"/g, '""')}"`,
                    `"${clientName.replace(/"/g, '""')}"`,
                    t.category,
                    t.costCenter,
                    formatDate(t.dueDate),
                    t.amount.toFixed(2).replace('.', ','),
                    interest.toFixed(2).replace('.', ','),
                    fine.toFixed(2).replace('.', ','),
                    total.toFixed(2).replace('.', ','),
                    t.status
                ].join(';'));
            });

            if (groupingType !== 'none') {
                 const subtotal = transactions.reduce((sum, t) => sum + calculateCharges(t).total, 0);
                 rows.push(`"Subtotal";;;;;;;;${subtotal.toFixed(2).replace('.', ',')}`);
                 rows.push('');
            }
        });

        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"
            + headers.join(";") + "\n"
            + rows.join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "contas_a_receber.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    return (
        <>
            <div className={`space-y-8 ${viewingInvoice ? 'print-hide' : ''}`}>
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lançamentos a Receber</h1>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleExportCsv}
                            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm"
                        >
                            <ExcelIcon /> Exportar CSV
                        </button>
                        <button 
                            onClick={() => downloadPdfFromElement('receipts-printable-area', `contas_a_receber_${selectedCompany}.pdf`)}
                            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm"
                        >
                            <PdfIcon /> Salvar PDF
                        </button>
                         <button 
                            onClick={() => onOpenInvoiceModal()}
                            className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center">
                            <InvoiceIcon />
                            <span className="ml-2">Gerar Fatura (NF)</span>
                        </button>
                    </div>
                </div>
                <div id="receipts-printable-area" className="printable-area">
                    <Card className="!p-0">
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/3">Descrição</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vencimento</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor Total</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Anexos</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900">
                                        {Object.entries(groupedTransactions).map(([groupName, transactions]) => {
                                            const subtotal = transactions.reduce((sum, t) => sum + calculateCharges(t).total, 0);
                                            return (
                                                <Fragment key={groupName}>
                                                    {groupingType !== 'none' && (
                                                        <tr className="bg-slate-100 dark:bg-slate-800">
                                                            <th colSpan={6} className="px-6 py-2 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                                {groupingType === 'status' ? `Situação: ${groupName}` : `Centro de Custo: ${groupName}`}
                                                            </th>
                                                        </tr>
                                                    )}
                                                    {transactions.map(transaction => <TransactionRow key={transaction.id} transaction={transaction} />)}
                                                    {groupingType !== 'none' && (
                                                         <tr className="bg-slate-50 dark:bg-slate-800/50 font-semibold">
                                                            <td colSpan={2} className="px-6 py-2 text-right text-slate-600 dark:text-slate-300">Subtotal do Grupo:</td>
                                                            <td colSpan={4} className="px-6 py-2 text-left text-slate-800 dark:text-slate-100">{formatCurrency(subtotal)}</td>
                                                        </tr>
                                                    )}
                                                </Fragment>
                                            )
                                        })}
                                    </tbody>
                                </table>
                                 {filteredTransactions.length === 0 && <p className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhuma conta a receber encontrada para esta empresa.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            {viewingInvoice && (
                <InvoicePreviewModal
                    invoice={viewingInvoice}
                    onClose={() => setViewingInvoice(null)}
                />
            )}
            <ScheduleReceivableModal
                isOpen={!!transactionToSchedule}
                onClose={() => setTransactionToSchedule(null)}
                onConfirm={handleConfirmSchedule}
                transaction={transactionToSchedule}
                bankAccounts={bankAccounts}
            />
            {viewingAttachment && (
                <AttachmentPreviewModal
                    attachment={viewingAttachment}
                    onClose={() => setViewingAttachment(null)}
                />
            )}
            {receiptToGenerate && (
                <ReceiptPreviewModal
                    transaction={receiptToGenerate}
                    companyName={selectedCompany}
                    contacts={contacts}
                    onClose={() => setReceiptToGenerate(null)}
                />
            )}
            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Confirmar Exclusão de Receita"
            >
                Tem certeza que deseja excluir a receita <strong className="text-slate-800 dark:text-slate-100">"{itemToDelete?.description}"</strong>? Esta ação não pode ser desfeita.
            </ConfirmationModal>
        </>
    );

    function TransactionRow({ transaction }: { transaction: Transaction }) {
        const { total } = calculateCharges(transaction);
        return (
            <tr className={"even:bg-gray-50 dark:even:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"}>
                <td className={`px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white`}>
                    <div className="flex items-center gap-2">
                        {transaction.recurrence && <RepeatIcon />}
                        <span>{transaction.description}</span>
                    </div>
                     {transaction.propertyId && properties.find(p => p.id === transaction.propertyId) && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                            <PropertyIcon />
                            <span>{properties.find(p => p.id === transaction.propertyId)?.name}</span>
                        </div>
                    )}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(transaction.dueDate)}</td>
                <td className="px-6 py-3 whitespace-nowrap text-sm font-semibold text-green-500">{formatCurrency(total)}</td>
                <td className="px-6 py-3 whitespace-nowrap text-sm">
                    <Badge color={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm">
                    {transaction.attachments && transaction.attachments.length > 0 && (
                        <AttachmentsDropdown 
                            attachments={transaction.attachments} 
                            onView={handleViewAttachment} 
                            onDownload={handleDownloadAttachment} 
                        />
                    )}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium space-x-3">
                    {transaction.status === 'Pago' && (
                        <button 
                            onClick={() => setReceiptToGenerate(transaction)}
                            className="font-semibold text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300">
                            Recibo
                        </button>
                    )}
                    {transaction.status !== 'Pago' && (
                        <>
                            <button
                                onClick={() => onOpenQRCodeModal(transaction)}
                                className="font-semibold text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 inline-flex items-center gap-1"
                                title="Gerar QR Code PIX para pagamento">
                                <QRCodeIcon /> PIX
                            </button>
                            <button 
                                onClick={() => onOpenConfirmPaymentModal(transaction)}
                                className="bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 font-semibold px-3 py-1 rounded-md text-xs hover:bg-green-200 dark:hover:bg-green-500/20 transition-colors">
                                Receber
                            </button>
                        </>
                    )}
                    {transaction.status === 'Pendente' && (
                        <button 
                            onClick={() => setTransactionToSchedule(transaction)}
                            className="bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 font-semibold px-3 py-1 rounded-md text-xs hover:bg-blue-200 dark:hover:bg-blue-500/20 transition-colors">
                            Agendar
                        </button>
                    )}
                        {transaction.invoiceDetails && (
                        <button onClick={() => setViewingInvoice(transaction)} className="font-semibold text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300">
                            Visualizar
                        </button>
                    )}
                    <button onClick={() => handleEdit(transaction)} className="font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                        Editar
                    </button>
                     <button onClick={() => setItemToDelete(transaction)} className="font-semibold text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                        Excluir
                    </button>
                </td>
            </tr>
        );
    }
};

const AttachmentsDropdown: React.FC<{
    attachments: NonNullable<Transaction['attachments']>;
    onView: (attachment: NonNullable<Transaction['attachments']>[0]) => void;
    onDownload: (attachment: NonNullable<Transaction['attachments']>[0]) => void;
}> = ({ attachments, onView, onDownload }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (attachments.length === 0) return null;

    if (attachments.length === 1) {
        const att = attachments[0];
        const canPreview = att.fileType.startsWith('image/') || att.fileType === 'text/plain';
        const buttonText = att.fileType === 'application/pdf' || canPreview ? 'Visualizar' : 'Prévia Indisponível';
        return (
             <div className="flex items-center gap-2">
                <button
                    onClick={() => onView(att)}
                    title={canPreview || att.fileType === 'application/pdf' ? 'Visualizar anexo' : 'A pré-visualização não está disponível para este tipo de arquivo.'}
                    className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 font-semibold px-3 py-1 rounded-md text-xs hover:bg-indigo-200 dark:hover:bg-indigo-500/20 transition-colors flex items-center gap-1.5"
                >
                    <ViewIcon /> {buttonText}
                </button>
                <button
                    onClick={() => onDownload(att)}
                    className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 font-semibold px-3 py-1 rounded-md text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1.5"
                >
                    <DownloadIcon /> Baixar
                </button>
            </div>
        );
    }

    return (
        <div className="relative inline-block text-left">
            <div>
                <button type="button" onClick={() => setIsOpen(!isOpen)} onBlur={() => setTimeout(() => setIsOpen(false), 150)} className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 font-semibold px-3 py-1 rounded-md text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1.5">
                    <AttachmentIcon /> Anexos ({attachments.length}) <ChevronDownIcon />
                </button>
            </div>
            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        {attachments.map((att, index) => (
                             <div key={index} className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                                <span className="truncate flex-1" title={att.fileName}>{att.fileName}</span>
                                <div className="flex-shrink-0 ml-3 space-x-3">
                                    <button onClick={(e) => { e.preventDefault(); onView(att); setIsOpen(false); }} title="Visualizar" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                                        <ViewIcon />
                                    </button>
                                    <button onClick={(e) => { e.preventDefault(); onDownload(att); setIsOpen(false); }} title="Baixar" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                                        <DownloadIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;
const RepeatIcon = () => <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Transação Recorrente</title><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l16 16"></path></svg>;
const InvoiceIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;
const AttachmentIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>;
const ChevronDownIcon = () => <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>;
const ViewIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>;
const DownloadIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>;
const QRCodeIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const PropertyIcon = () => <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V10a2 2 0 00-2-2H7a2 2 0 00-2 2v11m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 21v-6a2 2 0 012-2h2a2 2 0 012 2v6"></path></svg>;