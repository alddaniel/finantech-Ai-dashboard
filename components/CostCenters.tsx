import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { CostCenterModal } from './CostCenterModal';
import type { CostCenter, View, Transaction, Property, ToastMessage } from '../types';
import { VIEWS } from '../constants';
import { ConfirmationModal } from './ConfirmationModal';

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

interface CostCenterCardProps {
    center: CostCenter;
    onEdit: () => void;
    onDelete: () => void;
    payables: Transaction[];
    receivables: Transaction[];
    properties: Property[];
}

const CostCenterCard: React.FC<CostCenterCardProps> = ({ center, onEdit, onDelete, payables, receivables, properties }) => {
    const centerTransactions = useMemo(() => {
        return [...payables, ...receivables].filter(t => t.costCenter === center.name && t.company === center.company);
    }, [payables, receivables, center]);

    const totalMovimentado = useMemo(() => {
        return centerTransactions.reduce((acc, t) => {
            if (t.status !== 'Pago') return acc;
            if (t.type === 'receita') return acc + t.amount;
            if (t.type === 'despesa') return acc - t.amount;
            return acc;
        }, 0);
    }, [centerTransactions]);
    
    const propertyBreakdown = useMemo(() => {
        const breakdown: Record<string, { name: string; value: number }> = {};
        const propertyTransactions = centerTransactions.filter(t => t.propertyId && t.status === 'Pago');

        propertyTransactions.forEach(t => {
            if (!t.propertyId) return;

            if (!breakdown[t.propertyId]) {
                const property = properties.find(p => p.id === t.propertyId);
                breakdown[t.propertyId] = {
                    name: property?.name || 'Propriedade desconhecida',
                    value: 0,
                };
            }
            
            const amount = t.type === 'receita' ? t.amount : -t.amount;
            breakdown[t.propertyId].value += amount;
        });

        return Object.values(breakdown).filter(b => b.value !== 0);
    }, [centerTransactions, properties]);

    const budget = center.budget || 0;
    const balance = budget + totalMovimentado; // Assuming budget is an "income" and expenses are negative
    const spentPercentage = budget > 0 ? (Math.abs(totalMovimentado) / budget) * 100 : 0;
    
    let progressBarColor = 'bg-green-500';
    if (spentPercentage > 75) progressBarColor = 'bg-yellow-500';
    if (spentPercentage > 100) progressBarColor = 'bg-red-500';


    return (
        <Card className="flex flex-col">
            <CardHeader className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{center.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{center.description}</p>
                </div>
                 <div className="flex-shrink-0 ml-4 space-x-2">
                    <button onClick={onEdit} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold text-sm">Editar</button>
                    <button onClick={onDelete} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-semibold text-sm">Excluir</button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-xs text-gray-500">Orçamento</p>
                        <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{formatCurrency(budget)}</p>
                    </div>
                     <div>
                        <p className="text-xs text-gray-500">Movimentado</p>
                        <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{formatCurrency(totalMovimentado)}</p>
                    </div>
                     <div>
                        <p className="text-xs text-gray-500">Saldo</p>
                        <p className={`font-bold text-lg ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(balance)}</p>
                    </div>
                </div>
                {budget > 0 && (
                    <div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                            <div 
                                className={`h-2 rounded-full ${progressBarColor}`}
                                style={{ width: `${Math.min(spentPercentage, 100)}%`}}
                            ></div>
                        </div>
                        <p className="text-right text-xs mt-1 text-gray-500">{spentPercentage.toFixed(0)}% do orçamento utilizado</p>
                    </div>
                )}
                {propertyBreakdown.length > 0 && (
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                        <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-2">Discriminação por Imóvel</h4>
                        <ul className="space-y-1">
                            {propertyBreakdown.map(item => (
                                <li key={item.name} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 dark:text-gray-300">{item.name}</span>
                                    <span className={`font-semibold ${item.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(item.value)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

interface CostCentersProps {
    costCenters: CostCenter[];
    setCostCenters: React.Dispatch<React.SetStateAction<CostCenter[]>>;
    selectedCompany: string;
    setActiveView: (view: View) => void;
    payables: Transaction[];
    receivables: Transaction[];
    properties: Property[];
    addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

export const CostCenters: React.FC<CostCentersProps> = ({ costCenters, setCostCenters, selectedCompany, setActiveView, payables, receivables, properties, addToast }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [centerToEdit, setCenterToEdit] = useState<CostCenter | null>(null);
    const [centerToDelete, setCenterToDelete] = useState<CostCenter | null>(null);

    const companyCostCenters = useMemo(() => {
        return costCenters.filter(c => c.company === selectedCompany).sort((a, b) => a.name.localeCompare(b.name));
    }, [costCenters, selectedCompany]);

    const handleOpenModal = (center: CostCenter | null = null) => {
        setCenterToEdit(center);
        setModalOpen(true);
    };

    const handleSaveCostCenter = (centerData: { name: string; description: string; budget?: number }) => {
        if (centerToEdit) {
            setCostCenters(costCenters.map(c => c.id === centerToEdit.id ? { ...c, ...centerData } : c));
        } else {
            const newCenter: CostCenter = {
                id: `cc${Date.now()}`,
                name: centerData.name,
                description: centerData.description,
                budget: centerData.budget,
                company: selectedCompany,
            };
            setCostCenters([...costCenters, newCenter]);
        }
    };
    
    const handleConfirmDelete = () => {
        if (!centerToDelete) return;
        setCostCenters(prev => prev.filter(c => c.id !== centerToDelete.id));
        addToast({
            type: 'success',
            title: 'Centro de Custo Excluído!',
            description: `O centro de custo "${centerToDelete.name}" foi removido.`
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Centros de Custo</h1>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center"
                    >
                        <PlusIcon />
                        <span className="ml-2">Adicionar Centro de Custo</span>
                    </button>
                </div>
            </div>
            
            {companyCostCenters.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companyCostCenters.map(center => (
                        <CostCenterCard 
                            key={center.id}
                            center={center}
                            onEdit={() => handleOpenModal(center)}
                            onDelete={() => setCenterToDelete(center)}
                            payables={payables}
                            receivables={receivables}
                            properties={properties}
                        />
                    ))}
                 </div>
            ) : (
                <Card>
                    <CardContent className="text-center py-20">
                         <div className="bg-gray-100 dark:bg-gray-800/50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                             <TagIcon />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Nenhum Centro de Custo</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Crie seu primeiro centro de custo para categorizar suas finanças.</p>
                         <button onClick={() => handleOpenModal()} className="mt-6 bg-indigo-600 text-white font-semibold px-5 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors text-sm">
                            Adicionar Centro de Custo
                        </button>
                    </CardContent>
                </Card>
            )}

            <CostCenterModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSaveCostCenter}
                centerToEdit={centerToEdit}
            />
             <ConfirmationModal
                isOpen={!!centerToDelete}
                onClose={() => setCenterToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Confirmar Exclusão de Centro de Custo"
            >
                Tem certeza que deseja excluir o centro de custo <strong className="text-slate-800 dark:text-slate-100">"{centerToDelete?.name}"</strong>? Esta ação não pode ser desfeita.
            </ConfirmationModal>
        </div>
    );
};

const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;
const TagIcon = () => <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 8V5a2 2 0 012-2z"></path></svg>;