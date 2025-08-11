import React, { useState } from 'react';
import { Card, CardContent } from './ui/Card';
import { CustomerDetailModal } from './CustomerDetailModal';
import { MOCK_DEBTORS, FUNNEL_STAGES } from '../constants';
import type { DebtorCustomer, FunnelStage, CommunicationHistory } from '../types';

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

const DebtorCard: React.FC<{ debtor: DebtorCustomer; onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void; onClick: () => void }> = ({ debtor, onDragStart, onClick }) => (
    <div
        draggable
        onDragStart={(e) => onDragStart(e, debtor.id)}
        onClick={onClick}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow border-l-4 border-yellow-500"
        aria-label={`Cliente ${debtor.name}, dívida de ${formatCurrency(debtor.totalDebt)}`}
    >
        <div className="flex items-center">
            <img src={debtor.avatar} alt={debtor.name} className="w-10 h-10 rounded-full mr-4" />
            <div className="flex-1">
                <p className="font-bold text-gray-800 dark:text-white">{debtor.name}</p>
                <p className="text-sm text-red-500 font-semibold">{formatCurrency(debtor.totalDebt)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Vencido desde: {formatDate(debtor.lastDueDate)}</p>
            </div>
        </div>
    </div>
);

interface FinancialCRMProps {
    selectedCompany: string;
    onGenerateInvoice: (debtor: DebtorCustomer) => void;
}

export const FinancialCRM: React.FC<FinancialCRMProps> = ({ selectedCompany, onGenerateInvoice }) => {
    const [debtors, setDebtors] = useState<DebtorCustomer[]>(MOCK_DEBTORS.filter(d => d.company === selectedCompany));
    const [selectedDebtor, setSelectedDebtor] = useState<DebtorCustomer | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [draggedOverColumn, setDraggedOverColumn] = useState<FunnelStage | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        e.dataTransfer.setData("debtorId", id);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, stage: FunnelStage) => {
        e.preventDefault();
        setDraggedOverColumn(stage);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: FunnelStage) => {
        e.preventDefault();
        const debtorId = e.dataTransfer.getData("debtorId");
        setDebtors(prevDebtors =>
            prevDebtors.map(d =>
                d.id === debtorId ? { ...d, status: newStatus } : d
            )
        );
        setDraggedOverColumn(null);
    };

    const handleAddCommunication = (debtorId: string, newLog: Omit<CommunicationHistory, 'id'>) => {
        setDebtors(prevDebtors => prevDebtors.map(debtor => {
            if (debtor.id === debtorId) {
                const updatedHistory = [...debtor.communicationHistory, { ...newLog, id: `c${Date.now()}` }];
                const updatedDebtor = { ...debtor, communicationHistory: updatedHistory };
                if (selectedDebtor && selectedDebtor.id === debtorId) {
                    setSelectedDebtor(updatedDebtor);
                }
                return updatedDebtor;
            }
            return debtor;
        }));
    };

    const openModal = (debtor: DebtorCustomer) => {
        setSelectedDebtor(debtor);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDebtor(null);
    };

    const stageColors: Record<FunnelStage, string> = {
        'Notificação': 'border-blue-500',
        'Negociação': 'border-yellow-500',
        'Acordo': 'border-green-500',
        'Ação Jurídica': 'border-red-500',
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">CRM Financeiro - Funil de Inadimplência</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
                Gerencie o ciclo de cobrança de seus clientes de forma visual e interativa.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                {FUNNEL_STAGES.map(stage => (
                    <div
                        key={stage}
                        onDragOver={(e) => handleDragOver(e, stage)}
                        onDragLeave={() => setDraggedOverColumn(null)}
                        onDrop={(e) => handleDrop(e, stage)}
                        className={`bg-gray-100 dark:bg-gray-900/50 rounded-xl p-4 transition-colors ${draggedOverColumn === stage ? 'bg-indigo-100 dark:bg-indigo-900/40' : ''}`}
                    >
                        <h2 className={`text-lg font-bold text-gray-700 dark:text-gray-200 pb-2 mb-4 border-b-2 ${stageColors[stage]}`}>{stage}</h2>
                        <div className="space-y-4 min-h-[200px]">
                            {debtors
                                .filter(d => d.status === stage)
                                .map(debtor => (
                                    <DebtorCard key={debtor.id} debtor={debtor} onDragStart={handleDragStart} onClick={() => openModal(debtor)} />
                                ))}
                        </div>
                    </div>
                ))}
            </div>
            {isModalOpen && selectedDebtor && (
                <CustomerDetailModal
                    debtor={selectedDebtor}
                    onClose={closeModal}
                    onAddCommunication={handleAddCommunication}
                    onGenerateInvoice={onGenerateInvoice}
                />
            )}
        </div>
    );
};