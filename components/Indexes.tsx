import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { IndexModal } from './IndexModal';
import type { AdjustmentIndex, View, Property, Transaction, ToastMessage } from '../types';
import { VIEWS } from '../constants';
import { generateAndAdjustRentReceivables } from '../services/apiService';
import { ConfirmationModal } from './ConfirmationModal';

interface IndexesProps {
    adjustmentIndexes: AdjustmentIndex[];
    setAdjustmentIndexes: React.Dispatch<React.SetStateAction<AdjustmentIndex[]>>;
    selectedCompany: string;
    setActiveView: (view: View) => void;
    properties: Property[];
    receivables: Transaction[];
    setReceivables: React.Dispatch<React.SetStateAction<Transaction[]>>;
    addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

export const Indexes: React.FC<IndexesProps> = ({ adjustmentIndexes, setAdjustmentIndexes, selectedCompany, setActiveView, properties, receivables, setReceivables, addToast }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [indexToEdit, setIndexToEdit] = useState<AdjustmentIndex | null>(null);
    const [indexToDelete, setIndexToDelete] = useState<AdjustmentIndex | null>(null);

    const companyIndexes = useMemo(() => {
        return adjustmentIndexes.filter(c => c.company === selectedCompany).sort((a, b) => a.name.localeCompare(b.name));
    }, [adjustmentIndexes, selectedCompany]);

    const handleOpenModal = (index: AdjustmentIndex | null = null) => {
        setIndexToEdit(index);
        setModalOpen(true);
    };

    const handleSaveIndex = (indexData: { name: string; description: string; value: number; }) => {
        let updatedIndexId = '';
        let updatedIndexes: AdjustmentIndex[] = [];

        if (indexToEdit) {
            updatedIndexId = indexToEdit.id;
            updatedIndexes = adjustmentIndexes.map(i => i.id === indexToEdit.id ? { ...i, ...indexData } : i);
            setAdjustmentIndexes(updatedIndexes);
        } else {
            const newIndex: AdjustmentIndex = {
                id: `idx${Date.now()}`,
                name: indexData.name,
                description: indexData.description,
                company: selectedCompany,
                value: indexData.value,
            };
            updatedIndexId = newIndex.id;
            updatedIndexes = [...adjustmentIndexes, newIndex];
            setAdjustmentIndexes(updatedIndexes);
        }

        // After saving, recalculate future receivables for properties using this index
        const propertiesToUpdate = properties.filter(p => p.rentalDetails?.adjustmentIndexId === updatedIndexId);
        
        if (propertiesToUpdate.length > 0) {
            let currentReceivables = [...receivables];
            const allNewReceivables: Transaction[] = [];

            propertiesToUpdate.forEach(prop => {
                const { receivablesToKeep, newReceivables } = generateAndAdjustRentReceivables(prop, updatedIndexes, currentReceivables);
                // Update currentReceivables for the next iteration to avoid processing removed items again
                currentReceivables = receivablesToKeep; 
                allNewReceivables.push(...newReceivables);
            });
            
            setReceivables([...currentReceivables, ...allNewReceivables]);

            addToast({
                type: 'info',
                title: 'Recálculo Automático',
                description: `O valor de ${allNewReceivables.length} aluguéis futuros foi recalculado com base no novo valor do índice.`
            });
        }
    };
    
    const handleConfirmDelete = () => {
        if (!indexToDelete) return;
        setAdjustmentIndexes(prev => prev.filter(i => i.id !== indexToDelete.id));
        addToast({
            type: 'success',
            title: 'Índice Excluído!',
            description: `O índice "${indexToDelete.name}" foi removido.`
        });
    };

    return (
        <div className="space-y-8">
            <div>
                 <button
                    onClick={() => setActiveView(VIEWS.SETTINGS)}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Voltar para Configurações
                </button>
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gerenciamento de Índices de Reajuste</h1>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center"
                    >
                        <PlusIcon />
                        <span className="ml-2">Adicionar Índice</span>
                    </button>
                </div>
            </div>
            
            <Card className="!p-0">
                <CardHeader className="p-6">
                    <h2 className="text-xl font-semibold">Índices Cadastrados</h2>
                </CardHeader>
                <CardContent>
                     <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Nome do Índice</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Descrição</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Valor (%)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900">
                                {companyIndexes.map(index => (
                                    <tr key={index.id} className="even:bg-gray-50 dark:even:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{index.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{index.description}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">{index.value.toFixed(2).replace('.', ',')}%</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                            <button onClick={() => handleOpenModal(index)} className="font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">Editar</button>
                                            <button onClick={() => setIndexToDelete(index)} className="font-semibold text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">Excluir</button>
                                        </td>
                                    </tr>
                                ))}
                                {companyIndexes.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum índice cadastrado para esta empresa.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <IndexModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSaveIndex}
                indexToEdit={indexToEdit}
            />
            <ConfirmationModal
                isOpen={!!indexToDelete}
                onClose={() => setIndexToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Confirmar Exclusão de Índice"
            >
                Tem certeza que deseja excluir o índice <strong className="text-slate-800 dark:text-slate-100">"{indexToDelete?.name}"</strong>? Ele pode estar em uso em contratos de aluguel. Esta ação não pode ser desfeita.
            </ConfirmationModal>
        </div>
    );
};

const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;