import React, { useState, useMemo } from 'react';
import type { QuotationRequest, Contact, ToastMessage, QuotationStatus } from '../types';
import { ConfirmationModal } from './ConfirmationModal';
import { Badge } from './ui/Badge';

interface PriceQuotationsProps {
    quotations: QuotationRequest[];
    setQuotations: React.Dispatch<React.SetStateAction<QuotationRequest[]>>;
    contacts: Contact[];
    selectedCompany: string;
    onOpenQuotationModal: (quotation?: QuotationRequest | null) => void;
    addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
};

const QUOTATION_STAGES: QuotationStatus[] = ['Rascunho', 'Cotação', 'Concluída', 'Cancelada'];

const stageColors: Record<QuotationStatus, string> = {
    'Rascunho': 'border-gray-500',
    'Cotação': 'border-blue-500',
    'Concluída': 'border-green-500',
    'Cancelada': 'border-red-500',
};

const QuotationCard: React.FC<{ 
    quotation: QuotationRequest; 
    onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
    onClick: () => void;
    onDelete: () => void;
}> = ({ quotation, onDragStart, onClick, onDelete }) => {
    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, quotation.id)}
            className="relative bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow border-l-4"
            style={{ borderColor: stageColors[quotation.status].replace('border-', '') }}
        >
            <div onClick={onClick} className="cursor-pointer">
                <p className="font-bold text-gray-800 dark:text-white pr-8">{quotation.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{quotation.items.length} item(s) para cotação</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{quotation.suppliers.length} fornecedor(es)</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Criada em: {formatDate(quotation.createdAt)}</p>
            </div>
            <button onClick={onDelete} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                <TrashIcon />
            </button>
        </div>
    );
};

export const PriceQuotations: React.FC<PriceQuotationsProps> = ({ quotations, setQuotations, contacts, selectedCompany, onOpenQuotationModal, addToast }) => {
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<QuotationStatus | null>(null);
    const [quotationToDelete, setQuotationToDelete] = useState<QuotationRequest | null>(null);

    const companyQuotations = useMemo(() => {
        return quotations.filter(q => q.company === selectedCompany);
    }, [quotations, selectedCompany]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        setDraggedItemId(id);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, stage: QuotationStatus) => {
        e.preventDefault();
        setDragOverColumn(stage);
    };
    
    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: QuotationStatus) => {
        e.preventDefault();
        if (draggedItemId) {
            setQuotations(prev =>
                prev.map(q =>
                    q.id === draggedItemId ? { ...q, status: newStatus } : q
                )
            );
        }
        setDraggedItemId(null);
        setDragOverColumn(null);
    };

    const handleConfirmDelete = () => {
        if (!quotationToDelete) return;
        setQuotations(prev => prev.filter(q => q.id !== quotationToDelete.id));
        addToast({
            type: 'success',
            title: 'Cotação Excluída!',
            description: `A cotação "${quotationToDelete.title}" foi removida com sucesso.`
        });
        setQuotationToDelete(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Gerencie suas cotações de preços com fornecedores.
                </p>
                <button
                    onClick={() => onOpenQuotationModal(null)}
                    className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 self-start md:self-center"
                >
                    <PlusIcon /> Nova Cotação
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                {QUOTATION_STAGES.map(stage => (
                    <div
                        key={stage}
                        onDragOver={(e) => handleDragOver(e, stage)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, stage)}
                        className={`bg-slate-100 dark:bg-slate-900/50 rounded-xl p-4 transition-colors ${dragOverColumn === stage ? 'bg-indigo-100 dark:bg-indigo-900/40' : ''}`}
                    >
                        <h2 className={`text-lg font-bold text-gray-700 dark:text-gray-200 pb-2 mb-4 border-b-2 ${stageColors[stage]}`}>{stage}</h2>
                        <div className="space-y-4 min-h-[200px]">
                            {companyQuotations
                                .filter(q => q.status === stage)
                                .map(quotation => (
                                    <QuotationCard 
                                        key={quotation.id} 
                                        quotation={quotation} 
                                        onDragStart={handleDragStart} 
                                        onClick={() => onOpenQuotationModal(quotation)}
                                        onDelete={() => setQuotationToDelete(quotation)}
                                    />
                                ))
                            }
                        </div>
                    </div>
                ))}
            </div>
            <ConfirmationModal
                isOpen={!!quotationToDelete}
                onClose={() => setQuotationToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Confirmar Exclusão de Cotação"
            >
                Tem certeza que deseja excluir a cotação <strong className="text-slate-800 dark:text-slate-100">"{quotationToDelete?.title}"</strong>? Esta ação não pode ser desfeita.
            </ConfirmationModal>
        </div>
    );
};

const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;