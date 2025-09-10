import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Badge } from './ui/Badge';
import { ConfirmationModal } from './ConfirmationModal';
import type { Contract, Property, Contact, ToastMessage } from '../types';

interface ContractsProps {
    contracts: Contract[];
    setContracts: React.Dispatch<React.SetStateAction<Contract[]>>;
    properties: Property[];
    contacts: Contact[];
    selectedCompany: string;
    onOpenContractModal: (contract?: Contract | null) => void;
    addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDate = (dateString: string) => {
    const parts = dateString.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
};

export const Contracts: React.FC<ContractsProps> = ({ contracts, setContracts, properties, contacts, selectedCompany, onOpenContractModal, addToast }) => {
    const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);

    const companyContracts = useMemo(() => {
        return contracts.filter(c => c.company === selectedCompany);
    }, [contracts, selectedCompany]);

    const handleConfirmDelete = () => {
        if (!contractToDelete) return;
        setContracts(prev => prev.filter(c => c.id !== contractToDelete.id));
        // Also update property to remove link
        // Note: This logic should ideally be in App.tsx to ensure data consistency
        addToast({
            type: 'success',
            title: 'Contrato Excluído!',
            description: `O contrato foi removido com sucesso.`
        });
        setContractToDelete(null);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contratos de Aluguel</h1>
                <button
                    onClick={() => onOpenContractModal(null)}
                    className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                    <PlusIcon /> Adicionar Contrato
                </button>
            </div>
            
            <Card className="!p-0">
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b border-slate-200 dark:border-slate-800 bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imóvel</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inquilino</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor do Aluguel</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vigência</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900">
                                {companyContracts.map(contract => {
                                    const property = properties.find(p => p.id === contract.propertyId);
                                    const tenant = contacts.find(c => c.id === contract.tenantId);
                                    return (
                                        <tr key={contract.id} className="even:bg-gray-50 dark:even:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{property?.name || 'Imóvel não encontrado'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{tenant?.name || 'Inquilino não encontrado'}</td>
                                            <td className="px-6 py-4 font-semibold text-green-600">{formatCurrency(contract.rentAmount)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{`${formatDate(contract.startDate)} a ${formatDate(contract.endDate)}`}</td>
                                            <td className="px-6 py-4"><Badge color={contract.status === 'Ativo' ? 'green' : 'red'}>{contract.status}</Badge></td>
                                            <td className="px-6 py-4 space-x-4">
                                                <button onClick={() => onOpenContractModal(contract)} className="font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm">Editar</button>
                                                <button onClick={() => setContractToDelete(contract)} className="font-semibold text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm">Excluir</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                         {companyContracts.length === 0 && (
                            <p className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum contrato cadastrado para esta empresa.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

             <ConfirmationModal
                isOpen={!!contractToDelete}
                onClose={() => setContractToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Confirmar Exclusão de Contrato"
            >
                Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita e pode afetar a geração de aluguéis futuros.
            </ConfirmationModal>
        </div>
    );
};

const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;