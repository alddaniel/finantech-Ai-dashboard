
import React, { useState, useMemo, useEffect } from 'react';
import type { InvoiceItem, InvoiceData, Contact, Transaction } from '../types';
import { MOCK_BANKS, MOCK_COST_CENTERS, MOCK_BANK_ACCOUNTS } from '../constants';
import { BoletoPreviewModal } from './BoletoPreviewModal';
import { downloadPdfFromElement } from '../services/pdfService';

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const inputStyle = "block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";
const selectStyle = "block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 pl-3 pr-10 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";

interface InvoiceGeneratorProps {
    isOpen: boolean;
    onClose: () => void;
    contacts: Contact[];
    setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
    receivables: Transaction[];
    setReceivables: React.Dispatch<React.SetStateAction<Transaction[]>>;
    selectedCompany: string;
    initialData?: { customer: string; amount: number; } | { receivableToEdit: Transaction } | null;
}

export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ isOpen, onClose, contacts, setContacts, receivables, setReceivables, selectedCompany, initialData }) => {
    const [submission, setSubmission] = useState<{ data: InvoiceData, installments?: number } | null>(null);
    const [customer, setCustomer] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [invoiceType, setInvoiceType] = useState<'nfe' | 'nfse' | 'nfce'>('nfse');
    const [bank, setBank] = useState<string>(MOCK_BANKS[0]);
    const [items, setItems] = useState<InvoiceItem[]>([
        { id: Date.now(), description: '', quantity: 1, price: '' }
    ]);
    const [issuerProvider, setIssuerProvider] = useState('TecnoSpeed');
    
    const [applyInstallments, setApplyInstallments] = useState(false);
    const [installmentData, setInstallmentData] = useState({
        count: 2,
        frequency: 'monthly' as 'monthly' | 'bi-weekly' | 'weekly',
    });

    const [applyInterest, setApplyInterest] = useState(false);
    const [interestConfig, setInterestConfig] = useState({
        rate: '',
        type: 'daily' as 'daily' | 'monthly'
    });

    const [applyFine, setApplyFine] = useState(false);
    const [fineRate, setFineRate] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    
    useEffect(() => {
        if (initialData) {
            if ('receivableToEdit' in initialData) {
                const { receivableToEdit } = initialData;
                const details = receivableToEdit.invoiceDetails;
                if(details) {
                    setCustomer(details.customer);
                    setDueDate(details.dueDate); // assuming YYYY-MM-DD
                    setItems(details.items);
                    setInvoiceType(details.invoiceType);
                    setBank(details.bank);
                    setIssuerProvider(details.issuerProvider);
                    if(details.interestRate) {
                        setApplyInterest(true);
                        setInterestConfig({rate: String(details.interestRate), type: details.interestType || 'daily'});
                    } else {
                        setApplyInterest(false);
                        setInterestConfig({rate: '', type: 'daily'});
                    }
                    if(details.fineRate){
                        setApplyFine(true);
                        setFineRate(String(details.fineRate));
                    } else {
                        setApplyFine(false);
                        setFineRate('');
                    }
                }
                setApplyInstallments(false);
                setEditingId(receivableToEdit.id);
            } else if ('customer' in initialData) {
                setCustomer(initialData.customer);
                setItems([
                    {
                        id: Date.now(),
                        description: 'Cobrança de débitos pendentes',
                        quantity: 1,
                        price: initialData.amount.toFixed(2).replace('.', ','),
                    }
                ]);
                handleNewInvoice(); // Reset advanced options
            }
        } else {
             handleNewInvoice(); // Reset form if no data
        }
    }, [initialData, isOpen]);

    const total = useMemo(() => {
        return items.reduce((acc, item) => {
            const price = parseFloat(item.price.replace(',', '.')) || 0;
            return acc + (price * item.quantity);
        }, 0);
    }, [items]);

    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), description: '', quantity: 1, price: '' }]);
    };

    const handleRemoveItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleItemChange = (id: number, field: keyof Omit<InvoiceItem, 'id'>, value: string | number) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let contactId: string | undefined = undefined;
        const existingContact = contacts.find(c => c.name.toLowerCase() === customer.toLowerCase() && c.company === selectedCompany);

        if (existingContact) {
            contactId = existingContact.id;
        } else if (customer) {
            const newContact: Contact = {
                id: `contact${Date.now()}`,
                name: customer,
                type: 'Cliente',
                document: '',
                email: '',
                phone: '',
                company: selectedCompany,
            };
            setContacts(prev => [...prev, newContact]);
            contactId = newContact.id;
        }

        const interestRateValue = applyInterest ? parseFloat(interestConfig.rate.replace(',', '.')) || undefined : undefined;
        const fineRateValue = applyFine ? parseFloat(fineRate.replace(',', '.')) || undefined : undefined;

        const baseInvoiceData: InvoiceData = {
            customer,
            dueDate,
            items,
            total,
            bank,
            invoiceType,
            issuerProvider,
            interestRate: interestRateValue,
            interestType: interestRateValue ? interestConfig.type : undefined,
            fineRate: fineRateValue,
        };

        if (editingId) {
            const updatedReceivable: Transaction = {
                id: editingId,
                description: `Cobrança para ${customer}`,
                category: 'Venda de Serviço/Produto',
                amount: total,
                dueDate: new Date(dueDate + 'T00:00:00').toLocaleDateString('pt-BR'),
                status: 'Pendente',
                type: 'receita',
                company: selectedCompany,
                costCenter: MOCK_COST_CENTERS[1],
                bankAccount: MOCK_BANK_ACCOUNTS.find(b => b.company === selectedCompany)?.id || MOCK_BANK_ACCOUNTS[0].id,
                invoiceDetails: baseInvoiceData,
                contactId: contactId,
                interestRate: interestRateValue,
                interestType: interestRateValue ? interestConfig.type : undefined,
                fineRate: fineRateValue,
            };
            setReceivables(receivables.map(r => r.id === editingId ? updatedReceivable : r));
        } else if (applyInstallments && installmentData.count > 1) {
            const newReceivables: Transaction[] = [];
            const installmentAmount = total / installmentData.count;
            const initialDueDate = new Date(dueDate + 'T00:00:00');

            for (let i = 0; i < installmentData.count; i++) {
                const currentDueDate = new Date(initialDueDate);
                if (installmentData.frequency === 'monthly') {
                    currentDueDate.setMonth(currentDueDate.getMonth() + i);
                } else if (installmentData.frequency === 'bi-weekly') {
                    currentDueDate.setDate(currentDueDate.getDate() + (i * 14));
                } else if (installmentData.frequency === 'weekly') {
                    currentDueDate.setDate(currentDueDate.getDate() + (i * 7));
                }

                const installmentReceivable: Transaction = {
                    id: `r${Date.now() + i}`,
                    description: `Cobrança para ${customer} (Parcela ${i + 1}/${installmentData.count})`,
                    category: 'Venda de Serviço/Produto',
                    amount: installmentAmount,
                    dueDate: currentDueDate.toLocaleDateString('pt-BR'),
                    status: 'Pendente',
                    type: 'receita',
                    company: selectedCompany,
                    costCenter: MOCK_COST_CENTERS[1],
                    bankAccount: MOCK_BANK_ACCOUNTS.find(b => b.company === selectedCompany)?.id || MOCK_BANK_ACCOUNTS[0].id,
                    invoiceDetails: { ...baseInvoiceData, total: installmentAmount },
                    contactId: contactId,
                    interestRate: interestRateValue,
                    interestType: interestRateValue ? interestConfig.type : undefined,
                    fineRate: fineRateValue,
                };
                newReceivables.push(installmentReceivable);
            }
            setReceivables(prev => [...prev, ...newReceivables]);

        } else {
            const newReceivable: Transaction = {
                id: `r${Date.now()}`,
                description: `Cobrança para ${customer}`,
                category: 'Venda de Serviço/Produto',
                amount: total,
                dueDate: new Date(dueDate + 'T00:00:00').toLocaleDateString('pt-BR'),
                status: 'Pendente',
                type: 'receita',
                company: selectedCompany,
                costCenter: MOCK_COST_CENTERS[1],
                bankAccount: MOCK_BANK_ACCOUNTS.find(b => b.company === selectedCompany)?.id || MOCK_BANK_ACCOUNTS[0].id,
                invoiceDetails: baseInvoiceData,
                contactId: contactId,
                interestRate: interestRateValue,
                interestType: interestRateValue ? interestConfig.type : undefined,
                fineRate: fineRateValue,
            };
            setReceivables(prev => [...prev, newReceivable]);
        }
        
        setSubmission({ data: baseInvoiceData, installments: applyInstallments ? installmentData.count : undefined });
    };

    const handleNewInvoice = () => {
        setSubmission(null);
        setCustomer('');
        setDueDate('');
        setItems([{ id: Date.now(), description: '', quantity: 1, price: '' }]);
        setApplyInterest(false);
        setInterestConfig({rate: '', type: 'daily'});
        setApplyFine(false);
        setFineRate('');
        setApplyInstallments(false);
        setInstallmentData({ count: 2, frequency: 'monthly' });
        setEditingId(null);
    };

    if (!isOpen) return null;

    if (submission) {
        return <SuccessView submission={submission.data} onNewInvoice={handleNewInvoice} onClose={onClose} />;
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                     <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{editingId ? "Editar Cobrança" : "Gerar Cobrança e Nota Fiscal"}</h1>
                        <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                             <CloseIcon />
                        </button>
                    </div>
                    <div className="p-6 space-y-6 overflow-y-auto">
                        {/* Form content from original component goes here */}
                        <fieldset>
                             <legend className="text-lg font-medium text-gray-900 dark:text-white mb-4">Informações do Cliente e Vencimento</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="customer" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cliente (Nome ou CNPJ/CPF)</label>
                                    <input
                                        type="text"
                                        id="customer"
                                        name="customer"
                                        placeholder="Busque ou cadastre um novo cliente"
                                        value={customer}
                                        onChange={e => setCustomer(e.target.value)}
                                        list="customers-list"
                                        className={`${inputStyle} mt-1`}
                                    />
                                    <datalist id="customers-list">
                                        {contacts.filter(c => c.type === 'Cliente' && c.company === selectedCompany).map(c => <option key={c.id} value={c.name} />)}
                                    </datalist>
                                </div>
                                <div>
                                    <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data de Vencimento</label>
                                    <input type="date" id="dueDate" name="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} className={`${inputStyle} mt-1`} />
                                </div>
                            </div>
                        </fieldset>
                        
                        <hr className="my-6 border-slate-200 dark:border-slate-700" />

                        <fieldset>
                             <legend className="text-lg font-medium text-gray-900 dark:text-white mb-4">Itens da Cobrança</legend>
                            <div className="space-y-4">
                               {items.map((item) => (
                                   <div key={item.id} className="flex items-end gap-4">
                                       <div className="flex-1">
                                            <label htmlFor={`item-desc-${item.id}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300">Descrição</label>
                                            <input type="text" id={`item-desc-${item.id}`} value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} placeholder="Ex: Consultoria Financeira" className={`${inputStyle} mt-1`} />
                                       </div>
                                       <div className="w-24">
                                            <label htmlFor={`item-qty-${item.id}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300">Qtde.</label>
                                            <input type="number" min="1" id={`item-qty-${item.id}`} value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value, 10) || 1)} placeholder="1" className={`${inputStyle} mt-1`} />
                                       </div>
                                       <div className="w-32">
                                            <label htmlFor={`item-price-${item.id}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300">Valor Unit.</label>
                                            <input type="text" id={`item-price-${item.id}`} value={item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} placeholder="R$ 0,00" className={`${inputStyle} mt-1`} />
                                       </div>
                                       {items.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveItem(item.id)} className="h-10 w-10 flex-shrink-0 flex items-center justify-center p-2 text-red-500 hover:bg-red-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                                                <span className="sr-only">Remover item</span>
                                                <TrashIcon />
                                            </button>
                                       )}
                                   </div>
                               ))}
                            </div>
                            <div className="flex justify-between items-center mt-3">
                                <button type="button" onClick={handleAddItem} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center">
                                    <PlusIcon />
                                    <span className="ml-1">Adicionar outro item</span>
                                </button>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Valor a Gerar</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(total)}</p>
                                </div>
                            </div>
                        </fieldset>

                        <hr className="my-6 border-slate-200 dark:border-slate-700" />
                        
                        <fieldset>
                            <legend className="text-lg font-medium text-gray-900 dark:text-white mb-4">Opções Avançadas</legend>
                            <div className="space-y-4">
                                <div>
                                    <label className="flex items-center cursor-pointer" title={!!editingId ? "Não é possível parcelar uma cobrança existente." : ""}>
                                        <input type="checkbox" disabled={!!editingId} checked={applyInstallments && !editingId} onChange={e => setApplyInstallments(e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed" />
                                        <span className={`ml-2 text-slate-700 dark:text-slate-300 ${!!editingId ? 'text-gray-400 dark:text-gray-500' : ''}`}>Parcelar cobrança?</span>
                                    </label>
                                    {applyInstallments && !editingId && (
                                        <div className="grid grid-cols-2 gap-4 mt-2 pl-6">
                                            <div>
                                                <label htmlFor="installment-count" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nº de Parcelas</label>
                                                <input type="number" min="2" id="installment-count" value={installmentData.count} onChange={e => setInstallmentData(d => ({...d, count: parseInt(e.target.value, 10) || 2}))} className={`${inputStyle} mt-1`} />
                                            </div>
                                            <div>
                                                <label htmlFor="installment-frequency" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Frequência</label>
                                                <select id="installment-frequency" value={installmentData.frequency} onChange={e => setInstallmentData(d => ({...d, frequency: e.target.value as any}))} className={`${selectStyle} mt-1`}>
                                                    <option value="monthly">Mensal</option>
                                                    <option value="bi-weekly">Quinzenal</option>
                                                    <option value="weekly">Semanal</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="flex items-center cursor-pointer">
                                        <input type="checkbox" checked={applyInterest} onChange={e => setApplyInterest(e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                        <span className="ml-2 text-slate-700 dark:text-slate-300">Aplicar juros por atraso?</span>
                                    </label>
                                    {applyInterest && (
                                        <div className="grid grid-cols-2 gap-4 mt-2 pl-6">
                                            <div>
                                                <label htmlFor="interest-rate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Taxa de Juros (%)</label>
                                                <input type="text" id="interest-rate" value={interestConfig.rate} onChange={e => setInterestConfig(c => ({...c, rate: e.target.value}))} placeholder="Ex: 1" className={`${inputStyle} mt-1`} />
                                            </div>
                                            <div>
                                                <label htmlFor="interest-type" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Juros</label>
                                                <select id="interest-type" value={interestConfig.type} onChange={e => setInterestConfig(c => ({...c, type: e.target.value as any}))} className={`${selectStyle} mt-1`}>
                                                    <option value="daily">Ao dia</option>
                                                    <option value="monthly">Ao mês</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="flex items-center cursor-pointer">
                                        <input type="checkbox" checked={applyFine} onChange={e => setApplyFine(e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                        <span className="ml-2 text-slate-700 dark:text-slate-300">Aplicar multa por atraso?</span>
                                    </label>
                                    {applyFine && (
                                        <div className="mt-2 pl-6">
                                            <label htmlFor="fine-rate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Taxa de Multa (%)</label>
                                            <input type="text" id="fine-rate" value={fineRate} onChange={e => setFineRate(e.target.value)} placeholder="Ex: 2" className={`${inputStyle} mt-1 w-1/2`} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </fieldset>

                        <hr className="my-6 border-slate-200 dark:border-slate-700" />

                        <fieldset>
                            <legend className="text-lg font-medium text-gray-900 dark:text-white mb-4">Emissão (Boleto & NF-e)</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="bank" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Banco Homologado</label>
                                    <select id="bank" value={bank} onChange={e => setBank(e.target.value)} className={`${selectStyle} mt-1`}>
                                        {MOCK_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Nota Fiscal</label>
                                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 pt-2">
                                        <label className="flex items-center"><input type="radio" name="invoiceType" value="nfse" checked={invoiceType === 'nfse'} onChange={() => setInvoiceType('nfse')} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" /><span className="ml-2 text-slate-700 dark:text-slate-300">NFS-e</span></label>
                                        <label className="flex items-center"><input type="radio" name="invoiceType" value="nfe" checked={invoiceType === 'nfe'} onChange={() => setInvoiceType('nfe')} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" /><span className="ml-2 text-slate-700 dark:text-slate-300">NF-e</span></label>
                                        <label className="flex items-center"><input type="radio" name="invoiceType" value="nfce" checked={invoiceType === 'nfce'} onChange={() => setInvoiceType('nfce')} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" /><span className="ml-2 text-slate-700 dark:text-slate-300">NFC-e</span></label>
                                    </div>
                                </div>
                            </div>
                        </fieldset>
                    </div>
                    <div className="px-6 py-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                         <button
                            type="button"
                            onClick={onClose}
                            className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-6 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                         >
                             Cancelar
                         </button>
                         <button type="submit" disabled={total <= 0 || !dueDate} className="bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed">
                             {editingId ? "Salvar Alterações" : "Gerar Cobrança"}
                         </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SuccessView: React.FC<{submission: InvoiceData, onNewInvoice: () => void, onClose: () => void}> = ({ submission, onNewInvoice, onClose }) => {
    const [showBoletoModal, setShowBoletoModal] = useState(false);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog">
             <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <div className="bg-green-100 dark:bg-green-900/50 rounded-full h-24 w-24 flex items-center justify-center mx-auto">
                        <CheckIcon className="text-green-600 dark:text-green-400 h-16 w-16" />
                    </div>
                    <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Cobrança Gerada!</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">A cobrança foi adicionada à sua lista de Contas a Receber.</p>
                </div>
                
                <div className="p-6 pt-0 space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:justify-center sm:gap-3">
                     <ActionButton icon={<BoletoIcon />} isSecondary onClick={() => setShowBoletoModal(true)}>
                        Visualizar Boleto
                    </ActionButton>
                     <ActionButton icon={<DownloadIcon />} isSecondary onClick={() => downloadPdfFromElement('invoice-success-printable-area', `fatura_${submission.customer.replace(/\s/g, '_')}.pdf`)}>
                        Salvar Fatura em PDF
                    </ActionButton>
                </div>
                 <div className="px-6 pb-6 text-center">
                    <button onClick={onClose} className="w-full bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
                        Fechar e Ver Lançamentos
                    </button>
                </div>
            </div>
            {showBoletoModal && (
                <BoletoPreviewModal
                    submission={submission}
                    onClose={() => setShowBoletoModal(false)}
                />
            )}
        </div>
    );
};

const ActionButton: React.FC<{icon: React.ReactNode, children: React.ReactNode, onClick: () => void, isSecondary?: boolean}> = ({icon, children, onClick, isSecondary}) => (
    <button 
        onClick={onClick} 
        className={`w-full sm:w-auto flex items-center justify-center px-4 py-2 border rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
            isSecondary 
            ? 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700' 
            : 'border-transparent bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
    >
        {icon}
        <span className="ml-2">{children}</span>
    </button>
);


const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const TrashIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const CheckIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>;
const BoletoIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h2m8-5h2M3 6h18v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6z"></path></svg>;
const DownloadIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>;
const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
