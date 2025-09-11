import React, { useState, useEffect, useMemo } from 'react';
import type { QuotationRequest, Contact, QuotationItem, QuotationSupplierResponse, QuotationSupplierItem, ToastMessage, Transaction } from '../types';

interface QuotationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (quotation: QuotationRequest) => void;
    quotationToEdit: QuotationRequest | null;
    contacts: Contact[];
    selectedCompany: string;
    addToast: (toast: Omit<ToastMessage, 'id'>) => void;
    onGenerateExpense: (expense: Transaction | null) => void;
}

const inputStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";
const selectStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 pl-3 pr-10 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";

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

const defaultQuotation = {
    title: '',
    status: 'Rascunho' as QuotationRequest['status'],
    items: [{ id: `item-${Date.now()}`, description: '', quantity: 1, unit: 'un' }],
    suppliers: [],
};

export const QuotationModal: React.FC<QuotationModalProps> = ({ isOpen, onClose, onSave, quotationToEdit, contacts, selectedCompany, addToast, onGenerateExpense }) => {
    const [formData, setFormData] = useState<Omit<QuotationRequest, 'id' | 'company' | 'createdAt' > & { id?: string }>(() => defaultQuotation);
    const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
    
    useEffect(() => {
        if (quotationToEdit) {
            setFormData(quotationToEdit);
            setSelectedSuppliers(quotationToEdit.suppliers.map(s => s.supplierId));
        } else {
            setFormData({ ...defaultQuotation, items: [{ id: `item-${Date.now()}`, description: '', quantity: 1, unit: 'un' }] });
            setSelectedSuppliers([]);
        }
    }, [quotationToEdit, isOpen]);

    const handleSupplierSelection = (supplierId: string) => {
        const isSelected = selectedSuppliers.includes(supplierId);
        let newSelection;
        if (isSelected) {
            newSelection = selectedSuppliers.filter(id => id !== supplierId);
        } else {
            newSelection = [...selectedSuppliers, supplierId];
        }
        setSelectedSuppliers(newSelection);
        setFormData(prev => ({
            ...prev,
            suppliers: newSelection.map(id => {
                const existing = prev.suppliers.find(s => s.supplierId === id);
                return existing || { supplierId: id };
            })
        }));
    };
    
    const handleItemChange = (id: string, field: keyof Omit<QuotationItem, 'id'>, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
        }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { id: `item-${Date.now()}`, description: '', quantity: 1, unit: 'un' }]
        }));
    };

    const removeItem = (id: string) => {
        if (formData.items.length <= 1) return;
        setFormData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
    };
    
    const handlePriceChange = (supplierId: string, itemId: string, price: string) => {
        const parsedPrice = parseFormattedCurrency(price);
        setFormData(prev => ({
            ...prev,
            suppliers: prev.suppliers.map(sup => {
                if (sup.supplierId !== supplierId) return sup;

                const response = sup.response || { id: `resp-${Date.now()}`, supplierId, items: [], total: 0, createdAt: new Date().toISOString() };
                
                const existingItem = response.items.find(i => i.quotationItemId === itemId);
                let newItems;
                if(existingItem) {
                    newItems = response.items.map(i => i.quotationItemId === itemId ? {...i, price: parsedPrice} : i);
                } else {
                    newItems = [...response.items, { quotationItemId: itemId, price: parsedPrice }];
                }
                
                const newTotal = newItems.reduce((sum, item) => {
                    const reqItem = prev.items.find(i => i.id === item.quotationItemId);
                    return sum + (item.price * (reqItem?.quantity || 1));
                }, 0);

                return { ...sup, response: { ...response, items: newItems, total: newTotal } };
            })
        }));
    };
    
    const handleSelectWinner = (supplierId: string) => {
        setFormData(prev => ({...prev, selectedSupplierId: supplierId, status: 'Concluída'}));
        addToast({type: 'success', title: 'Fornecedor Selecionado!', description: 'A cotação foi marcada como concluída.'});
    };
    
    const handleGenerateExpenseClick = () => {
        if (!formData.selectedSupplierId) return;
        const winner = formData.suppliers.find(s => s.supplierId === formData.selectedSupplierId);
        if (!winner?.response) return;

        const expense: Transaction = {
            id: '',
            description: `Compra baseada na cotação: ${formData.title}`,
            amount: winner.response.total,
            category: 'Suprimentos', // or a default category
            dueDate: new Date().toISOString().split('T')[0],
            status: 'Pendente',
            type: 'despesa',
            company: selectedCompany,
            costCenter: '',
            bankAccount: '',
            contactId: winner.supplierId,
        };
        onGenerateExpense(expense);
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as QuotationRequest);
        onClose();
    };

    const companySuppliers = contacts.filter(c => c.company === selectedCompany && c.type === 'Fornecedor');

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[95vh]" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center flex-shrink-0">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{quotationToEdit ? 'Editar Cotação' : 'Nova Cotação de Preços'}</h2>
                        <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><CloseIcon /></button>
                    </div>

                    <div className="p-6 space-y-4 overflow-y-auto flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Título da Cotação</label>
                                <input type="text" name="title" id="title" value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} required className={inputStyle} />
                            </div>
                            <div>
                                <label htmlFor="deadline" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Prazo para Resposta</label>
                                <input type="date" name="deadline" id="deadline" value={formData.deadline || ''} onChange={e => setFormData(p => ({...p, deadline: e.target.value}))} className={inputStyle} />
                            </div>
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                                <select name="status" id="status" value={formData.status} onChange={e => setFormData(p => ({...p, status: e.target.value as any}))} className={selectStyle}>
                                    <option>Rascunho</option>
                                    <option>Cotação</option>
                                    <option>Concluída</option>
                                    <option>Cancelada</option>
                                </select>
                            </div>
                        </div>

                        <fieldset className="pt-4 border-t border-slate-200 dark:border-slate-700">
                            <legend className="text-lg font-semibold text-slate-800 dark:text-slate-200">Itens para Cotação</legend>
                            <div className="space-y-3 mt-2">
                                {formData.items.map(item => (
                                    <div key={item.id} className="flex items-end gap-3">
                                        <div className="flex-1">
                                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Descrição</label>
                                            <input type="text" value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} className={inputStyle} />
                                        </div>
                                        <div className="w-24">
                                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Quantidade</label>
                                            <input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', parseInt(e.target.value, 10) || 1)} className={inputStyle} />
                                        </div>
                                        <div className="w-28">
                                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Unidade</label>
                                            <input type="text" value={item.unit} onChange={e => handleItemChange(item.id, 'unit', e.target.value)} className={inputStyle} />
                                        </div>
                                        <button type="button" onClick={() => removeItem(item.id)} disabled={formData.items.length <= 1} className="h-10 w-10 flex items-center justify-center text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md transition-colors flex-shrink-0 disabled:opacity-50">
                                            <TrashIcon />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addItem} className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1"><PlusIcon /> Adicionar Item</button>
                        </fieldset>

                        <fieldset className="pt-4 border-t border-slate-200 dark:border-slate-700">
                            <legend className="text-lg font-semibold text-slate-800 dark:text-slate-200">Fornecedores</legend>
                            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {companySuppliers.map(sup => (
                                    <label key={sup.id} className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-colors cursor-pointer ${selectedSuppliers.includes(sup.id) ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                        <input type="checkbox" checked={selectedSuppliers.includes(sup.id)} onChange={() => handleSupplierSelection(sup.id)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{sup.name}</span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                        
                        {formData.status !== 'Rascunho' && formData.suppliers.length > 0 && (
                            <fieldset className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                <legend className="text-lg font-semibold text-slate-800 dark:text-slate-200">Comparativo de Preços</legend>
                                <div className="overflow-x-auto mt-2">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr>
                                                <th className="py-2 px-3 text-left font-medium text-gray-500 dark:text-gray-300">Item</th>
                                                {formData.suppliers.map(sup => <th key={sup.supplierId} className="py-2 px-3 text-right font-medium text-gray-500 dark:text-gray-300">{contacts.find(c=>c.id === sup.supplierId)?.name}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                            {formData.items.map(item => (
                                                <tr key={item.id}>
                                                    <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">{item.description} ({item.quantity} {item.unit})</td>
                                                    {formData.suppliers.map(sup => {
                                                        const price = sup.response?.items.find(i => i.quotationItemId === item.id)?.price || 0;
                                                        return (
                                                            <td key={`${sup.supplierId}-${item.id}`} className="py-1 px-3">
                                                                <input type="text" inputMode="decimal" value={price > 0 ? price.toLocaleString('pt-BR', {minimumFractionDigits: 2}) : ''} onChange={e => handlePriceChange(sup.supplierId, item.id, e.target.value)} className={`${inputStyle} !mt-0 text-right`} placeholder="R$ 0,00" />
                                                            </td>
                                                        )
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-t-2 border-slate-300 dark:border-slate-600">
                                                <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-100">TOTAL</td>
                                                {formData.suppliers.map(sup => (
                                                    <td key={sup.supplierId} className={`py-2 px-3 font-bold text-right text-lg ${formData.selectedSupplierId === sup.supplierId ? 'text-green-500' : 'text-slate-800 dark:text-slate-100'}`}>
                                                        {sup.response?.total.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'}) || '-'}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td></td>
                                                {formData.suppliers.map(sup => (
                                                    <td key={sup.supplierId} className="pt-2 px-3 text-right">
                                                        {formData.selectedSupplierId === sup.supplierId ? (
                                                            <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-300 px-2 py-1 rounded-full">VENCEDOR</span>
                                                        ) : (
                                                            <button type="button" onClick={() => handleSelectWinner(sup.supplierId)} className="text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-2 py-1 rounded-md">
                                                                Selecionar
                                                            </button>
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </fieldset>
                        )}

                    </div>

                    <div className="px-6 py-4 flex justify-between items-center border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                        {formData.status === 'Concluída' && formData.selectedSupplierId ? (
                             <button type="button" onClick={handleGenerateExpenseClick} className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-green-700 transition-colors">
                                Gerar Despesa
                            </button>
                        ): <div></div>}
                        <div className="flex gap-3">
                            <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors">
                                Salvar Cotação
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const TrashIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;