import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { PropertyModal } from './PropertyModal';
import type { Property, Contact, Transaction, AdjustmentIndex, ToastMessage, Contract } from '../types';
import { generateAndAdjustRentReceivables, parseDate } from '../services/apiService';
import { IconDisplay } from './ui/IconComponents';

interface PropertiesProps {
    properties: Property[];
    setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
    contacts: Contact[];
    payables: Transaction[];
    setPayables: React.Dispatch<React.SetStateAction<Transaction[]>>;
    receivables: Transaction[];
    setReceivables: React.Dispatch<React.SetStateAction<Transaction[]>>;
    selectedCompany: string;
    adjustmentIndexes: AdjustmentIndex[];
    addToast: (toast: Omit<ToastMessage, 'id'>) => void;
    customAvatars: string[];
    setCustomAvatars: React.Dispatch<React.SetStateAction<string[]>>;
    contracts: Contract[];
}

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const PropertyCard: React.FC<{
    property: Property;
    ownerName?: string;
    tenantName?: string;
    monthlyResult: number;
    costCenterBreakdown: { name: string; value: number }[];
    onEdit: () => void;
}> = ({ property, ownerName, tenantName, monthlyResult, costCenterBreakdown, onEdit }) => {
    
    const getStatusBadge = () => {
        switch (property.status) {
            case 'Alugado': return <Badge color="green">Alugado</Badge>;
            case 'À Venda': return <Badge color="blue">À Venda</Badge>;
            case 'Disponível': return <Badge color="yellow">Disponível</Badge>;
            case 'Vendido': return <Badge color="purple">Vendido</Badge>;
        }
    };

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                        <IconDisplay iconName={property.icon} className="w-16 h-16" shape="square" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate" title={property.name}>{property.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{`${property.address.street}, ${property.address.number}`}</p>
                    </div>
                </div>
                <div className="flex-shrink-0">{getStatusBadge()}</div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">Proprietário</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{ownerName || 'N/A'}</p>
                    </div>
                     <div>
                        <p className="text-gray-500">Inquilino</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{tenantName || 'N/A'}</p>
                    </div>
                </div>
                 <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Resultado Mensal</p>
                    <p className={`text-2xl font-bold ${monthlyResult >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(monthlyResult)}</p>
                    <p className="text-xs text-gray-400">(Receitas - Despesas Vinculadas)</p>
                </div>

                {costCenterBreakdown.length > 0 && (
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                        <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-2">Resultado por Centro de Custo</h4>
                        <ul className="space-y-1">
                            {costCenterBreakdown.map(item => (
                                <li key={item.name} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 dark:text-gray-300">{item.name}</span>
                                    <span className={`font-semibold ${item.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(item.value)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {(property.condoAmount || property.iptuAmount) && (
                    <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                        <div>
                            <p className="text-gray-500">Condomínio</p>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">
                                {property.condoAmount ? `${formatCurrency(property.condoAmount)} (Dia ${property.condoDueDate || 'N/A'})` : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500">IPTU</p>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">
                                {property.iptuAmount ? `${formatCurrency(property.iptuAmount)} (Dia ${property.iptuDueDate || 'N/A'})` : 'N/A'}
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
             <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <button
                    onClick={onEdit}
                    className="w-full text-center font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                    Ver / Editar Detalhes
                </button>
            </div>
        </Card>
    );
};

export const Properties: React.FC<PropertiesProps> = ({ properties, setProperties, contacts, payables, setPayables, receivables, setReceivables, selectedCompany, adjustmentIndexes, addToast, customAvatars, setCustomAvatars, contracts }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);

    const companyProperties = useMemo(() => {
        return properties.filter(p => p.company === selectedCompany);
    }, [properties, selectedCompany]);

    const handleOpenModal = (property: Property | null = null) => {
        setPropertyToEdit(property);
        setModalOpen(true);
    };

    const handleSaveProperty = (propertyData: Property) => {
        const isNew = !propertyToEdit;
        const finalProperty = isNew ? { ...propertyData, id: `prop${Date.now()}` } : propertyData;

        setProperties(prev => {
            if (isNew) return [...prev, finalProperty];
            return prev.map(p => p.id === finalProperty.id ? finalProperty : p);
        });
        
        addToast({
            type: 'success',
            title: 'Imóvel Salvo!',
            description: `Os dados do imóvel "${finalProperty.name}" foram salvos com sucesso.`
        });
    };
    
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestão de Imóveis</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center"
                >
                    <PlusIcon />
                    <span className="ml-2">Adicionar Imóvel</span>
                </button>
            </div>
            
            {companyProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companyProperties.map(prop => {
                        const owner = contacts.find(c => c.id === prop.ownerId);
                        const contract = contracts.find(c => c.id === prop.contractId);
                        const tenant = contract ? contacts.find(c => c.id === contract.tenantId) : undefined;
                        
                        const today = new Date();
                        const currentMonth = today.getMonth();
                        const currentYear = today.getFullYear();

                        const linkedTransactionsForMonth = [...receivables, ...payables].filter(t => {
                            if (t.propertyId !== prop.id || t.status !== 'Pago' || !t.paymentDate) return false;
                            const paymentDate = parseDate(t.paymentDate);
                            return !isNaN(paymentDate.getTime()) && paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
                        });

                        const monthlyResult = linkedTransactionsForMonth.reduce((acc, t) => {
                            return acc + (t.type === 'receita' ? t.amount : -t.amount);
                        }, 0);

                        const costCenterBreakdown = linkedTransactionsForMonth.reduce((acc, t) => {
                            const key = t.costCenter || 'Não categorizado';
                            if (!acc[key]) {
                                acc[key] = 0;
                            }
                            acc[key] += (t.type === 'receita' ? t.amount : -t.amount);
                            return acc;
                        }, {} as Record<string, number>);

                        const breakdownForRender = Object.entries(costCenterBreakdown)
                            .map(([name, value]) => ({ name, value }))
                            .sort((a, b) => b.value - a.value);

                        return (
                             <PropertyCard
                                key={prop.id}
                                property={prop}
                                ownerName={owner?.name}
                                tenantName={tenant?.name}
                                monthlyResult={monthlyResult}
                                costCenterBreakdown={breakdownForRender}
                                onEdit={() => handleOpenModal(prop)}
                            />
                        );
                    })}
                </div>
            ) : (
                 <Card>
                    <CardContent className="text-center py-20">
                         <div className="bg-gray-100 dark:bg-gray-800/50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                             <PropertyIcon />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Nenhum Imóvel Cadastrado</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Adicione seu primeiro imóvel para começar a gerenciar.</p>
                         <button onClick={() => handleOpenModal()} className="mt-6 bg-indigo-600 text-white font-semibold px-5 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors text-sm">
                            Adicionar Imóvel
                        </button>
                    </CardContent>
                </Card>
            )}

            <PropertyModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSaveProperty}
                propertyToEdit={propertyToEdit}
                contacts={contacts}
                selectedCompany={selectedCompany}
                customAvatars={customAvatars}
                setCustomAvatars={setCustomAvatars}
            />
        </div>
    );
};

const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;
const PropertyIcon = () => <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V10a2 2 0 00-2-2H7a2 2 0 00-2 2v11m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 21v-6a2 2 0 012-2h2a2 2 0 012 2v6"></path></svg>;
