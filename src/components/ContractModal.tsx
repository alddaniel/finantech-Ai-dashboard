import React, { useState, useEffect } from 'react';
import type { Contract, Property, Contact, AdjustmentIndex } from '../types';

interface ContractModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (contract: Contract) => void;
    contractToEdit: Contract | null;
    properties: Property[];
    contacts: Contact[];
    selectedCompany: string;
    adjustmentIndexes: AdjustmentIndex[];
    contracts: Contract[];
}

const inputStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";
const selectStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 pl-3 pr-10 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";
const textareaStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";


const defaultContract: Omit<Contract, 'id' | 'company'> = {
    propertyId: '',
    tenantId: '',
    rentAmount: 0,
    startDate: '',
    endDate: '',
    paymentDay: 1,
    adjustmentIndexId: '',
    status: 'Ativo',
    description: '',
};

// --- Currency Formatting Utilities ---
const formatCurrencyOnInput = (value: string): string => {
  if (!value) return '';
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly.length === 0) return '';
  const numberValue = parseFloat(digitsOnly) / 100;
  return numberValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const parseFormattedCurrency = (value: string): number => {
    if (typeof value !== 'string' || !value) return 0;
    const cleanedValue = value.replace(/R\$\s?/, '').replace(/\./g, '');
    const numericString = cleanedValue.replace(',', '.');
    return parseFloat(numericString) || 0;
};
// --- End Currency Formatting Utilities ---

export const ContractModal: React.FC<ContractModalProps> = ({ isOpen, onClose, onSave, contractToEdit, properties, contacts, selectedCompany, adjustmentIndexes, contracts }) => {
    const [formData, setFormData] = useState<Omit<Contract, 'id'> & { id?: string }>(() => ({...defaultContract, company: selectedCompany}));
    const [rentAmountString, setRentAmountString] = useState('');

    useEffect(() => {
        if (contractToEdit) {
            setFormData(contractToEdit);
            setRentAmountString(contractToEdit.rentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
        } else {
            setFormData({...defaultContract, company: selectedCompany});
            setRentAmountString('');
        }
    }, [contractToEdit, isOpen, selectedCompany]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            rentAmount: parseFormattedCurrency(rentAmountString)
        } as Contract);
    };

    if (!isOpen) return null;

    // A property is available if it's 'Disponível' OR it's the one currently linked to the contract being edited.
    const availableProperties = properties.filter(p => p.company === selectedCompany && (p.status === 'Disponível' || p.id === contractToEdit?.propertyId));
    const companyTenants = contacts.filter(c => c.company === selectedCompany && c.type === 'Cliente');
    const companyIndexes = adjustmentIndexes.filter(i => i.company === selectedCompany);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{contractToEdit ? 'Editar Contrato' : 'Novo Contrato de Aluguel'}</h2>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="propertyId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Imóvel</label>
                                <select name="propertyId" id="propertyId" value={formData.propertyId} onChange={handleChange} required className={selectStyle}>
                                    <option value="">Selecione um imóvel disponível</option>
                                    {availableProperties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="tenantId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Inquilino</label>
                                <select name="tenantId" id="tenantId" value={formData.tenantId} onChange={handleChange} required className={selectStyle}>
                                    <option value="">Selecione um cliente</option>
                                    {companyTenants.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Descrição/Observações do Contrato</label>
                            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className={textareaStyle} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="rentAmount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Valor do Aluguel (R$)</label>
                                <input type="text" inputMode="decimal" id="rentAmount" value={rentAmountString} onChange={e => setRentAmountString(formatCurrencyOnInput(e.target.value))} required className={inputStyle} />
                            </div>
                            <div>
                                <label htmlFor="paymentDay" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Dia do Vencimento</label>
                                <input type="number" name="paymentDay" id="paymentDay" value={formData.paymentDay} onChange={handleChange} min="1" max="31" required className={inputStyle} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Início da Vigência</label>
                                <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleChange} required className={inputStyle} />
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fim da Vigência</label>
                                <input type="date" name="endDate" id="endDate" value={formData.endDate} onChange={handleChange} required className={inputStyle} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="adjustmentIndexId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Índice de Reajuste Anual</label>
                                <select name="adjustmentIndexId" id="adjustmentIndexId" value={formData.adjustmentIndexId} onChange={handleChange} required className={selectStyle}>
                                    <option value="">Selecione um índice</option>
                                    {companyIndexes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status do Contrato</label>
                                <select name="status" id="status" value={formData.status} onChange={handleChange} required className={selectStyle}>
                                    <option value="Ativo">Ativo</option>
                                    <option value="Encerrado">Encerrado</option>
                                    <option value="Rascunho">Rascunho</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                        <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">Cancelar</button>
                        <button type="submit" className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">Salvar Contrato</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
