import React, { useState, useMemo } from 'react';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { VIEWS } from '../constants';
import type { Transaction, View, InvoiceData, DanfeData, ToastMessage } from '../types';
import { InvoicePreviewModal } from './InvoicePreviewModal';
import { DanfePreviewModal } from './DanfePreviewModal';
import { parseXmlToDanfeData } from '../services/xmlParserService';
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

interface GeneratedInvoicesProps {
    selectedCompany: string;
    receivables: Transaction[];
    setReceivables: React.Dispatch<React.SetStateAction<Transaction[]>>;
    onOpenInvoiceModal: (data?: { receivableToEdit: Transaction } | null) => void;
    addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

export const GeneratedInvoices: React.FC<GeneratedInvoicesProps> = ({ selectedCompany, receivables, setReceivables, onOpenInvoiceModal, addToast }) => {
    const [viewingInvoice, setViewingInvoice] = useState<Transaction | null>(null);
    const [isDanfeModalOpen, setIsDanfeModalOpen] = useState(false);
    const [danfeData, setDanfeData] = useState<DanfeData | null>(null);
    const [itemToDelete, setItemToDelete] = useState<Transaction | null>(null);


    const generatedInvoices = useMemo(() => {
        return receivables.filter(r => r.invoiceDetails && r.company === selectedCompany);
    }, [receivables, selectedCompany]);

    const handleEdit = (transactionId: string) => {
        const invoiceToEdit = generatedInvoices.find(inv => inv.id === transactionId);
        if (invoiceToEdit) {
            onOpenInvoiceModal({ receivableToEdit: invoiceToEdit });
        }
    };

    const handleConfirmDelete = () => {
        if (!itemToDelete) return;
        setReceivables(currentReceivables =>
            currentReceivables.filter(t => t.id !== itemToDelete.id)
        );
        addToast({
            type: 'success',
            title: 'Cobrança Excluída!',
            description: `A cobrança para "${itemToDelete.invoiceDetails?.customer}" foi removida.`
        });
        setItemToDelete(null);
    };

    const handleDownloadXml = (xmlContent: string, fileName: string) => {
        const blob = new Blob([xmlContent], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    const handleViewDanfe = async (invoiceDetails: InvoiceData) => {
        if (!invoiceDetails.xmlContent) {
            alert('Conteúdo XML não disponível para esta fatura.');
            return;
        }
        try {
            const parsedData = await parseXmlToDanfeData(invoiceDetails.xmlContent);
            setDanfeData(parsedData);
            setIsDanfeModalOpen(true);
        } catch (error) {
            console.error("Error parsing XML for DANFE preview:", error);
            alert(`Não foi possível gerar a pré-visualização da DANFE. O XML pode ser inválido ou incompleto. Erro: ${(error as Error).message}`);
        }
    };

    return (
        <>
            <div className={`space-y-8 ${viewingInvoice ? 'print-hide' : ''}`}>
                <div className="flex justify-end items-center">
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
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Arquivos</th>
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
                                             <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {transaction.invoiceDetails?.xmlContent ? (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleDownloadXml(
                                                                transaction.invoiceDetails!.xmlContent!,
                                                                `NFe_${transaction.invoiceDetails!.customer.replace(/\s/g, '_')}_${transaction.id}.xml`
                                                            )}
                                                            className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 font-semibold px-3 py-1 rounded-md text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1.5"
                                                        >
                                                            <XmlIcon /> Baixar XML
                                                        </button>
                                                         <button
                                                            onClick={() => handleViewDanfe(transaction.invoiceDetails!)}
                                                            className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-semibold px-3 py-1 rounded-md text-xs hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center gap-1.5"
                                                        >
                                                            <DanfeIcon /> Ver DANFE
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic text-xs">Sem NF-e</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                                <button onClick={() => setViewingInvoice(transaction)} className="font-semibold text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300">
                                                    Visualizar
                                                </button>
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
            {isDanfeModalOpen && danfeData && (
                <DanfePreviewModal
                    data={danfeData}
                    onClose={() => setIsDanfeModalOpen(false)}
                />
            )}
            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Confirmar Exclusão de Cobrança"
            >
                Tem certeza que deseja excluir a cobrança para <strong className="text-slate-800 dark:text-slate-100">{itemToDelete?.invoiceDetails?.customer}</strong>? Esta ação não pode ser desfeita.
            </ConfirmationModal>
        </>
    );
};

const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;
const XmlIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>;
const DanfeIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;