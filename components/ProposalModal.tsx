import React, { useState, useEffect, useMemo } from 'react';
import type { Proposal, Contact, ProposalItem } from '../types';

interface ProposalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (proposal: Proposal) => void;
    proposalToEdit: Proposal | null;
    contacts: Contact[];
    setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
    selectedCompany: string;
}

const inputStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";
const selectStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 pl-3 pr-10 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";
const textareaStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";

const isValidDocument = (doc: string): boolean => {
    const cleaned = doc.replace(/\D/g, '');

    if (cleaned.length === 11) { // CPF
        if (/^(\d)\1+$/.test(cleaned)) return false; // Check for repeated digits
        let sum = 0;
        let remainder;
        for (let i = 1; i <= 9; i++) sum = sum + parseInt(cleaned.substring(i - 1, i)) * (11 - i);
        remainder = (sum * 10) % 11;
        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(cleaned.substring(9, 10))) return false;
        sum = 0;
        for (let i = 1; i <= 10; i++) sum = sum + parseInt(cleaned.substring(i - 1, i)) * (12 - i);
        remainder = (sum * 10) % 11;
        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(cleaned.substring(10, 11))) return false;
        return true;
    } else if (cleaned.length === 14) { // CNPJ
        if (/^(\d)\1+$/.test(cleaned)) return false;
        let length = cleaned.length - 2;
        let numbers = cleaned.substring(0, length);
        const digits = cleaned.substring(length);
        let sum = 0;
        let pos = length - 7;
        for (let i = length; i >= 1; i--) {
            sum += parseInt(numbers.charAt(length - i)) * pos--;
            if (pos < 2) pos = 9;
        }
        let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        if (result !== parseInt(digits.charAt(0))) return false;
        length = length + 1;
        numbers = cleaned.substring(0, length);
        sum = 0;
        pos = length - 7;
        for (let i = length; i >= 1; i--) {
            sum += parseInt(numbers.charAt(length - i)) * pos--;
            if (pos < 2) pos = 9;
        }
        result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        if (result !== parseInt(digits.charAt(1))) return false;
        return true;
    }
    return false;
};

const formatDocument = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) { // CPF
        return cleaned
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else { // CNPJ
        return cleaned
            .slice(0, 14)
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
};

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

const defaultProposal = {
    name: '',
    clientId: '',
    scope: '',
    status: 'Rascunho' as Proposal['status'],
    items: [{ id: `item-${Date.now()}`, description: '', value: '' }],
};

export const ProposalModal: React.FC<ProposalModalProps> = ({ isOpen, onClose, onSave, proposalToEdit, contacts, setContacts, selectedCompany }) => {
    const [formData, setFormData] = useState<Omit<Proposal, 'id' | 'company' | 'createdAt' | 'items'> & { id?: string; items: (Omit<ProposalItem, 'value'> & { value: string | number; })[] }>(() => defaultProposal);
    const [clientName, setClientName] = useState('');
    const [showNewClientForm, setShowNewClientForm] = useState(false);
    const [newClientData, setNewClientData] = useState({ name: '', document: '' });
    const [newClientDocError, setNewClientDocError] = useState('');

    useEffect(() => {
        if (proposalToEdit) {
            const { items, ...rest } = proposalToEdit;
            setFormData({
                ...rest,
                items: items.map(item => ({
                    ...item,
                    value: item.value > 0 ? (item.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''
                }))
            });
            const client = contacts.find(c => c.id === proposalToEdit.clientId);
            setClientName(client?.name || '');
        } else {
            setFormData({ ...defaultProposal, items: [{ id: `item-${Date.now()}`, description: '', value: '' }] });
            setClientName('');
        }
        setShowNewClientForm(false);
        setNewClientDocError('');
    }, [proposalToEdit, isOpen, contacts]);

    const totalValue = useMemo(() => {
        return formData.items.reduce((sum, item) => sum + parseFormattedCurrency(item.value as string), 0);
    }, [formData.items]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (id: string, field: 'description' | 'value', value: string) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === id ? { ...item, [field]: field === 'value' ? formatCurrencyOnInput(value) : value } : item
            )
        }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { id: `item-${Date.now()}`, description: '', value: '' }]
        }));
    };

    const removeItem = (id: string) => {
        if (formData.items.length <= 1) return;
        if (window.confirm('Tem certeza que deseja remover este item da proposta? Esta ação não pode ser desfeita.')) {
            setFormData(prev => ({
                ...prev,
                items: prev.items.filter(item => item.id !== id)
            }));
        }
    };

    const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setClientName(value);

        const existingContact = contacts.find(c => c.name.toLowerCase() === value.trim().toLowerCase() && c.type === 'Cliente');
        if (existingContact) {
            setFormData(prev => ({ ...prev, clientId: existingContact.id }));
            setShowNewClientForm(false);
            setNewClientDocError('');
        } else {
            setFormData(prev => ({ ...prev, clientId: '' }));
            setShowNewClientForm(value.trim().length > 0);
            setNewClientData({ name: value, document: '' });
        }
    };

    const handleNewClientDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatDocument(e.target.value);
        setNewClientData(d => ({...d, document: formattedValue}));
        if (newClientDocError) {
            setNewClientDocError('');
        }
    };

    const handleNewClientDocBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const doc = e.target.value;
        if (doc && !isValidDocument(doc)) {
            setNewClientDocError('CPF/CNPJ inválido.');
        } else {
            setNewClientDocError('');
        }
    };

    const handleSaveNewClient = () => {
        if (!newClientData.name.trim() || !newClientData.document.trim()) {
            alert('Nome e Documento são obrigatórios para o novo cliente.');
            return;
        }
        if (!isValidDocument(newClientData.document)) {
            setNewClientDocError('O CPF ou CNPJ inserido é inválido. Por favor, verifique.');
            return;
        }
        const newContact: Contact = {
            id: `contact${Date.now()}`,
            name: newClientData.name.trim(),
            document: newClientData.document.trim(),
            type: 'Cliente',
            email: '', phone: '',
            address: { street: '', number: '', neighborhood: '', city: '', state: '', zip: '' },
            company: selectedCompany,
            taxRegime: 'Simples Nacional',
        };
        setContacts(prev => [...prev, newContact]);
        setFormData(prev => ({ ...prev, clientId: newContact.id }));
        setClientName(newContact.name);
        setShowNewClientForm(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData = {
            ...formData,
            items: formData.items.map(item => ({
                ...item,
                value: parseFormattedCurrency(item.value as string)
            })),
            company: selectedCompany
        };
        onSave(finalData as Proposal);
        onClose();
    };

    if (!isOpen) return null;

    const companyClients = contacts.filter(c => c.company === selectedCompany && c.type === 'Cliente');

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-3xl flex flex-col max-h-[95vh]" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center flex-shrink-0">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{proposalToEdit ? 'Editar Proposta' : 'Nova Proposta Comercial'}</h2>
                        <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><CloseIcon /></button>
                    </div>

                    <div className="p-6 space-y-4 overflow-y-auto flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome da Proposta</label>
                                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputStyle} />
                            </div>
                            <div>
                                <label htmlFor="clientName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cliente</label>
                                <input
                                    type="text"
                                    id="clientName"
                                    value={clientName}
                                    onChange={handleClientChange}
                                    list="clients-list"
                                    required
                                    className={inputStyle}
                                    placeholder="Digite o nome do cliente"
                                />
                                <datalist id="clients-list">
                                    {companyClients.map(c => <option key={c.id} value={c.name} />)}
                                </datalist>
                            </div>
                        </div>
                        {showNewClientForm && (
                            <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50">
                                <h4 className="font-semibold text-indigo-800 dark:text-indigo-200">Adicionar Novo Cliente</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                    <div>
                                        <label htmlFor="new-client-name" className="text-sm text-slate-600 dark:text-slate-300">Nome</label>
                                        <input type="text" id="new-client-name" value={newClientData.name} onChange={e => setNewClientData(d => ({...d, name: e.target.value}))} className={inputStyle} />
                                    </div>
                                    <div>
                                        <label htmlFor="new-client-doc" className="text-sm text-slate-600 dark:text-slate-300">CNPJ / CPF</label>
                                        <input type="text" id="new-client-doc" value={newClientData.document} onChange={handleNewClientDocChange} onBlur={handleNewClientDocBlur} className={`${inputStyle} ${newClientDocError ? '!ring-red-500 focus:!ring-red-500' : ''}`} />
                                        {newClientDocError && <p className="mt-1 text-xs text-red-600">{newClientDocError}</p>}
                                    </div>
                                </div>
                                <button type="button" onClick={handleSaveNewClient} disabled={!!newClientDocError} className="mt-3 bg-indigo-600 text-white font-semibold px-4 py-1.5 rounded-md text-sm hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                                    Salvar Cliente
                                </button>
                            </div>
                        )}
                        <div>
                            <label htmlFor="scope" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Escopo dos Serviços</label>
                            <textarea name="scope" id="scope" value={formData.scope} onChange={handleChange} rows={4} className={textareaStyle}></textarea>
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                            <select name="status" id="status" value={formData.status} onChange={handleChange} className={selectStyle}>
                                <option>Rascunho</option>
                                <option>Enviada</option>
                                <option>Aprovada</option>
                                <option>Recusada</option>
                            </select>
                        </div>

                        <fieldset className="pt-4 border-t border-slate-200 dark:border-slate-700">
                            <legend className="text-lg font-semibold text-slate-800 dark:text-slate-200">Itens da Proposta</legend>
                            <div className="space-y-3 mt-2">
                                {formData.items.map(item => (
                                    <div key={item.id} className="flex items-end gap-3">
                                        <div className="flex-1">
                                            <label htmlFor={`item-desc-${item.id}`} className="block text-xs font-medium text-slate-700 dark:text-slate-300">Descrição</label>
                                            <input type="text" id={`item-desc-${item.id}`} value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} className={inputStyle} />
                                        </div>
                                        <div className="w-40">
                                            <label htmlFor={`item-value-${item.id}`} className="block text-xs font-medium text-slate-700 dark:text-slate-300">Valor (R$)</label>
                                            <input type="text" inputMode="decimal" id={`item-value-${item.id}`} value={String(item.value)} onChange={e => handleItemChange(item.id, 'value', e.target.value)} className={inputStyle} />
                                        </div>
                                        <button type="button" onClick={() => removeItem(item.id)} disabled={formData.items.length <= 1} className="h-10 w-10 flex items-center justify-center text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
                                            <TrashIcon />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                                <button type="button" onClick={addItem} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
                                    <PlusIcon /> Adicionar Item
                                </button>
                                <div>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Valor Total: </span>
                                    <span className="font-bold text-lg text-slate-800 dark:text-slate-200">{totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                </div>
                            </div>
                        </fieldset>
                    </div>

                    <div className="px-6 py-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                        <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors">
                            Salvar Proposta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const TrashIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;