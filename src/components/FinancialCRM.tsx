import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/Card';
import { CustomerDetailModal } from './CustomerDetailModal';
import { FUNNEL_STAGES } from '../constants';
import type { DebtorCustomer, FunnelStage, CommunicationHistory, Transaction, Contact } from '../types';

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

// --- Communication Icons ---
const iconClass = "w-4 h-4 text-gray-500 dark:text-gray-400";
const PhoneIcon = () => <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const MailIcon = () => <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const MessageIcon = () => <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const WhatsAppIcon = () => <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.203 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>;

const CommunicationIcon: React.FC<{ type: CommunicationHistory['type'] }> = ({ type }) => {
    switch (type) {
        case 'call': return <PhoneIcon />;
        case 'email': return <MailIcon />;
        case 'sms': return <MessageIcon />;
        case 'whatsapp': return <WhatsAppIcon />;
        default: return null;
    }
};
// --- End Icons ---


const DebtorCard: React.FC<{ debtor: DebtorCustomer; onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void; onClick: () => void }> = ({ debtor, onDragStart, onClick }) => {
    const lastCommunication = debtor.communicationHistory.length > 0
        ? debtor.communicationHistory[debtor.communicationHistory.length - 1]
        : null;

    return (
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
            {lastCommunication && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700/50">
                    <div className="flex items-start text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex-shrink-0 mt-0.5">
                            <CommunicationIcon type={lastCommunication.type} />
                        </div>
                        <div className="ml-2 flex-1 min-w-0">
                            <p className="font-semibold">{formatDate(lastCommunication.date)}:</p>
                            <p className="italic truncate" title={lastCommunication.summary}>
                                {lastCommunication.summary}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

interface FinancialCRMProps {
    selectedCompany: string;
    onGenerateInvoice: (debtor: DebtorCustomer) => void;
    receivables: Transaction[];
    contacts: Contact[];
}

export const FinancialCRM: React.FC<FinancialCRMProps> = ({ selectedCompany, onGenerateInvoice, receivables, contacts }) => {
    const [debtors, setDebtors] = useState<DebtorCustomer[]>([]);
    const [selectedDebtor, setSelectedDebtor] = useState<DebtorCustomer | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [draggedOverColumn, setDraggedOverColumn] = useState<FunnelStage | null>(null);

    useEffect(() => {
        const overdueReceivablesByContact: Record<string, Transaction[]> = {};
        
        receivables.forEach(r => {
            if (r.company === selectedCompany && r.status === 'Vencido' && r.contactId) {
                if (!overdueReceivablesByContact[r.contactId]) {
                    overdueReceivablesByContact[r.contactId] = [];
                }
                overdueReceivablesByContact[r.contactId].push(r);
            }
        });

        const calculatedDebtors: DebtorCustomer[] = Object.keys(overdueReceivablesByContact).map(contactId => {
            const contact = contacts.find(c => c.id === contactId);
            if (!contact) return null;

            const overdueTxs = overdueReceivablesByContact[contactId];
            const totalDebt = overdueTxs.reduce((sum, tx) => sum + tx.amount, 0);
            const lastDueDate = overdueTxs.reduce((latest, tx) => {
                return tx.dueDate > latest ? tx.dueDate : latest;
            }, overdueTxs[0].dueDate);
            
            const hasOpenInvoice = receivables.some(r => r.contactId === contactId && r.status === 'Pendente');
            
            const existingDebtor = debtors.find(d => d.id === contactId);

            return {
                id: contactId,
                name: contact.name,
                avatar: contact.icon || `https://i.pravatar.cc/150?u=${contactId}`,
                totalDebt,
                lastDueDate,
                status: existingDebtor?.status || 'Notificação',
                communicationHistory: existingDebtor?.communicationHistory || [],
                company: selectedCompany,
                hasOpenInvoice,
            };
        }).filter((d): d is DebtorCustomer => d !== null);

        setDebtors(calculatedDebtors);

    }, [receivables, contacts, selectedCompany, debtors]);

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
