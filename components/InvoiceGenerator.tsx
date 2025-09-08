
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { InvoiceItem, InvoiceData, Contact, Transaction, Company, Property, DanfeData, CostCenter, Category, AdjustmentIndex, Project } from '../types';
import { MOCK_BANKS, MOCK_BANK_ACCOUNTS } from '../constants';
import { BoletoPreviewModal } from './BoletoPreviewModal';
import { DanfePreviewModal } from './DanfePreviewModal';
import { downloadPdfFromElement } from '../services/pdfService';
import { emitirNFe, ApiResponse, calculateCharges } from '../services/apiService';
import { parseXmlToDanfeData } from '../services/xmlParserService';

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

// --- Currency Formatting Utilities ---
const formatCurrencyOnInput = (value: string): string => {
  if (!value) return '';
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly.length === 0) return '';
  const numberValue = parseFloat(digitsOnly) / 100;
  return numberValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const parseFormattedCurrency = (value: string): number => {
    if (typeof value !== 'string' || !value) return 0;
    const cleanedValue = value.replace(/R\$\s?/, '').replace(/\./g, '');
    const numericString = cleanedValue.replace(',', '.');
    return parseFloat(numericString) || 0;
};
// --- End Currency Formatting Utilities ---

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const inputStyle = "block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed dark:disabled:bg-slate-800/50";
const selectStyle = "block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 pl-3 pr-10 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed dark:disabled:bg-slate-800/50";

const SuccessView: React.FC<{
    submission: { data: InvoiceData, installments?: number, nfGenerated: boolean };
    onNewInvoice: () => void;
    onClose: () => void;
}> = ({ submission, onNewInvoice, onClose }) => {
    const [isBoletoModalOpen, setIsBoletoModalOpen] = useState(false);
    const [isDanfeModalOpen, setIsDanfeModalOpen] = useState(false);
    const [danfeData, setDanfeData] = useState<DanfeData | null>(null);

    const handleViewDanfe = async () => {
        if (!submission.data.xmlContent) {
            alert('Conteúdo XML não disponível para esta fatura.');
            return;
        }
        try {
            const parsedData = await parseXmlToDanfeData(submission.data.xmlContent);
            setDanfeData(parsedData);
            setIsDanfeModalOpen(true);
        } catch (error) {
            console.error("Error parsing XML for DANFE preview:", error);
            alert(`Não foi possível gerar a pré-visualização da DANFE. Erro: ${(error as Error).message}`);
        }
    };

    return (
        <>
            <div className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center flex-shrink-0">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Operação Concluída com Sucesso!</h1>
                    <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        <CloseIcon />
                    </button>
                </div>
                <div className="flex-1 p-6 space-y-6 overflow-y-auto text-center">
                    <div className="bg-green-100 dark:bg-green-900/50 rounded-full h-20 w-20 flex items-center justify-center mx-auto">
                        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {submission.installments ? `${submission.installments} Cobranças Geradas` : 'Cobrança Gerada!'}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                        A cobrança para <strong className="text-slate-800 dark:text-slate-200">{submission.data.customer}</strong> no valor total de <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(submission.data.total)}</strong> foi registrada no sistema.
                    </p>
                    {submission.nfGenerated && <p className="text-sm text-green-600 dark:text-green-400">A Nota Fiscal Eletrônica foi emitida e enviada para a SEFAZ.</p>}

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                            onClick={() => !submission.installments && setIsBoletoModalOpen(true)}
                            disabled={!!submission.installments}
                            title={submission.installments ? "Boletos individuais podem ser vistos na tela de Contas a Receber" : "Visualizar boleto"}
                            className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <BoletoIcon />
                            <span className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {submission.installments ? 'Boletos Gerados' : 'Ver Boleto'}
                            </span>
                        </button>
                        {submission.data.xmlContent && (
                            <button onClick={handleViewDanfe} className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800">
                                <DanfeIcon />
                                <span className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Ver DANFE</span>
                            </button>
                        )}
                        {submission.data.xmlContent && (
                             <button onClick={() => {
                                const blob = new Blob([submission.data.xmlContent!], { type: 'application/xml' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `NFe_${submission.data.customer.replace(/\s/g, '_')}.xml`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                             }} className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800">
                                <XmlIcon />
                                <span className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Baixar XML</span>
                            </button>
                        )}
                         <button onClick={() => downloadPdfFromElement('invoice-preview-for-success', `fatura_${submission.data.customer.replace(/\s/g, '_')}.pdf`)} className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800">
                            <DownloadIcon />
                            <span className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Salvar PDF</span>
                        </button>
                    </div>
                </div>
                <div className="px-6 py-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                    <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                        Fechar
                    </button>
                    <button type="button" onClick={onNewInvoice} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors">
                        Gerar Nova Cobrança
                    </button>
                </div>
            </div>
             {isBoletoModalOpen && <BoletoPreviewModal submission={submission.data} onClose={() => setIsBoletoModalOpen(false)} />}
             {isDanfeModalOpen && danfeData && <DanfePreviewModal data={danfeData} onClose={() => setIsDanfeModalOpen(false)} />}
             {/* Hidden div for PDF generation */}
             <div className="hidden">
                 <div id="invoice-preview-for-success">
                     {/* Simplified preview for PDF, can be more elaborate */}
                     <h1>Fatura para {submission.data.customer}</h1>
                     <p>Total: {formatCurrency(submission.data.total)}</p>
                     <ul>
                         {submission.data.items.map(item => (
                             <li key={item.id}>{item.description} - {item.quantity} x {item.price}</li>
                         ))}
                     </ul>
                 </div>
             </div>
        </>
    );
};


interface InvoiceGeneratorProps {
    isOpen: boolean;
    onClose: () => void;
    contacts: Contact[];
    setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
    receivables: Transaction[];
    setReceivables: React.Dispatch<React.SetStateAction<Transaction[]>>;
    selectedCompany: string;
    companies: Company[];
    properties: Property[];
    projects: Project[];
    initialData?: { customer: string; amount: number; } | { receivableToEdit: Transaction } | null;
    costCenters: CostCenter[];
    categories: Category[];
    adjustmentIndexes: AdjustmentIndex[];
}

export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ isOpen, onClose, contacts, setContacts, receivables, setReceivables, selectedCompany, companies, properties, projects, initialData, costCenters, categories, adjustmentIndexes }) => {
    const [submission, setSubmission] = useState<{ data: InvoiceData, installments?: number, nfGenerated: boolean } | null>(null);
    const [customer, setCustomer] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [isPaid, setIsPaid] = useState(false);
    const [invoiceType, setInvoiceType] = useState<'nfe' | 'nfse' | 'nfce'>('nfse');
    const [bank, setBank] = useState<string>(MOCK_BANKS[0]);
    const [items, setItems] = useState<InvoiceItem[]>([
        { id: Date.now(), description: '', quantity: 1, price: '' }
    ]);
    const [issuerProvider, setIssuerProvider] = useState('TecnoSpeed');
    const [propertyId, setPropertyId] = useState<string>('');
    const [projectId, setProjectId] = useState<string>('');
    const [costCenter, setCostCenter] = useState('');
    const [isRentalCharge, setIsRentalCharge] = useState(false);
    const [chargeType, setChargeType] = useState<'rent' | 'deposit' | 'prorated' | 'other'>('rent');
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const [referenceMonth, setReferenceMonth] = useState<string>(currentMonth.toString());
    const [referenceYear, setReferenceYear] = useState<string>(currentYear.toString());
    
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
    const [loadingMessage, setLoadingMessage] = useState('');
    const [attachments, setAttachments] = useState<Transaction['attachments']>([]);

    const [showNewContactForm, setShowNewContactForm] = useState(false);
    const [newContactData, setNewContactData] = useState({ name: '', document: '' });
    const [newContactDocError, setNewContactDocError] = useState('');

    const companyCostCenters = useMemo(() => costCenters.filter(c => c.company === selectedCompany), [costCenters, selectedCompany]);
    const companyProjects = useMemo(() => projects.filter(p => p.company === selectedCompany), [projects, selectedCompany]);

    const handleNewInvoice = useCallback(() => {
        setSubmission(null);
        setCustomer('');
        setDueDate('');
        setPaymentDate('');
        setIsPaid(false);
        setItems([{ id: Date.now(), description: '', quantity: 1, price: '' }]);
        setApplyInterest(false);
        setInterestConfig({rate: '', type: 'daily'});
        setApplyFine(false);
        setFineRate('');
        setApplyInstallments(false);
        setInstallmentData({ count: 2, frequency: 'monthly' });
        setPropertyId('');
        setProjectId('');
        setCostCenter(companyCostCenters.length > 0 ? companyCostCenters[0].name : '');
        setIsRentalCharge(false);
        setChargeType('rent');
        setReferenceMonth(currentMonth.toString());
        setReferenceYear(currentYear.toString());
        setEditingId(null);
        setAttachments([]);
        setShowNewContactForm(false);
        setNewContactDocError('');
    }, [companyCostCenters, currentMonth, currentYear]);

    useEffect(() => {
        if (!isOpen) return;

        if (initialData && 'receivableToEdit' in initialData) {
            const { receivableToEdit } = initialData;
            const details = receivableToEdit.invoiceDetails;
            
            setEditingId(receivableToEdit.id);
            setAttachments(receivableToEdit.attachments || []);
            setPropertyId(receivableToEdit.propertyId || '');
            setProjectId(receivableToEdit.projectId || '');
            setCostCenter(receivableToEdit.costCenter || (companyCostCenters.length > 0 ? companyCostCenters[0].name : ''));

            const customerContact = contacts.find(c => c.id === receivableToEdit.contactId);
            setCustomer(details?.customer || customerContact?.name || receivableToEdit.description);
            
            let inputDueDate = receivableToEdit.dueDate;
            if (inputDueDate.includes('/')) {
                const [day, month, year] = inputDueDate.split('/');
                if (day && month && year) inputDueDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
            setDueDate(inputDueDate.split('T')[0]);

            setIsPaid(receivableToEdit.status === 'Pago');
            if (receivableToEdit.status === 'Pago') {
                let inputPaymentDate = receivableToEdit.paymentDate;
                if (inputPaymentDate && inputPaymentDate.includes('/')) {
                    const [day, month, year] = inputPaymentDate.split('/');
                    if (day && month && year) inputPaymentDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                }
                setPaymentDate(inputPaymentDate ? inputPaymentDate.split('T')[0] : new Date().toISOString().split('T')[0]);
            } else {
                setPaymentDate('');
            }

            const itemsToLoad = details?.items;
            if (Array.isArray(itemsToLoad) && itemsToLoad.length > 0) {
                setItems(itemsToLoad.map((item, index) => ({
                    id: item.id ?? Date.now() + index,
                    description: item.description ?? '',
                    quantity: item.quantity ?? 1,
                    price: item.price || ''
                })));
            } else {
                setItems([{
                    id: Date.now(),
                    description: receivableToEdit.description,
                    quantity: 1,
                    price: receivableToEdit.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                }]);
            }
            
            setInvoiceType(details?.invoiceType || 'nfse');
            setBank(details?.bank || MOCK_BANKS[0]);
            setIssuerProvider(details?.issuerProvider || 'TecnoSpeed');
            setIsRentalCharge(!!receivableToEdit.propertyId && !details?.issuerProviderTransactionId);

            const interestRate = details?.interestRate ?? receivableToEdit.interestRate;
            const fineRateValue = details?.fineRate ?? receivableToEdit.fineRate;
            
            if (typeof interestRate === 'number') {
                setApplyInterest(true);
                setInterestConfig({rate: interestRate.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), type: details?.interestType || receivableToEdit.interestType || 'daily'});
            } else {
                setApplyInterest(false);
                setInterestConfig({rate: '', type: 'daily'});
            }
            if (typeof fineRateValue === 'number') {
                setApplyFine(true);
                setFineRate(fineRateValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
            } else {
                setApplyFine(false);
                setFineRate('');
            }
            
            setApplyInstallments(false);

        } else {
            handleNewInvoice();
            if (initialData && 'customer' in initialData) {
                const customerName = initialData.customer;
                setCustomer(customerName);
                setItems([
                    { id: Date.now(), description: 'Cobrança de débitos pendentes', quantity: 1, price: initialData.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }
                ]);
                
                const exists = contacts.some(c => c.name.toLowerCase() === customerName.trim().toLowerCase() && c.type === 'Cliente');
                setShowNewContactForm(!exists && customerName.trim().length > 0);
                if (!exists) {
                    setNewContactData({ name: customerName, document: '' });
                    setNewContactDocError('');
                }
            }
        }
    }, [initialData, isOpen, contacts, companyCostCenters, handleNewInvoice]);
    
     useEffect(() => {
        if (propertyId && !editingId) {
            const selectedProperty = properties.find(p => p.id === propertyId);
            if (selectedProperty) {
                let newDescription = '';
                let newPrice = (selectedProperty.rentalDetails?.rentAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

                const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
                const monthName = monthNames[parseInt(referenceMonth, 10)];

                switch (chargeType) {
                    case 'rent':
                        newDescription = `Aluguel Mensal referente a ${monthName} de ${referenceYear} para o imóvel "${selectedProperty.name}"`;
                        if (selectedProperty.rentalDetails?.paymentDay) {
                            const year = parseInt(referenceYear, 10);
                            const month = parseInt(referenceMonth, 10); // 0-indexed
                            const day = selectedProperty.rentalDetails.paymentDay;
                            const newDueDate = new Date(year, month, day);
                            setDueDate(newDueDate.toISOString().split('T')[0]);
                        }
                        break;
                    case 'deposit':
                        newDescription = `Depósito Caução referente ao imóvel "${selectedProperty.name}"`;
                        break;
                    case 'prorated':
                        newDescription = `Aluguel Proporcional referente ao imóvel "${selectedProperty.name}"`;
                        newPrice = '';
                        break;
                    case 'other':
                        newDescription = ``;
                        newPrice = '';
                        break;
                }

                setItems([{
                    id: Date.now(),
                    description: newDescription,
                    quantity: 1,
                    price: newPrice,
                }]);
                setIsRentalCharge(true);
            }
        } else if (!propertyId && !editingId) {
             setIsRentalCharge(false);
        }
    }, [propertyId, chargeType, referenceMonth, referenceYear, properties, editingId]);
    
    // Auto-fill cost center when project is selected
    useEffect(() => {
        if (projectId) {
            const selectedProject = projects.find(p => p.id === projectId);
            if (selectedProject) {
                setCostCenter(selectedProject.costCenterName);
            }
        } else {
            // If no project is selected, reset to default or keep user's manual selection
            if (!editingId) { // Only reset if it's a new transaction
               setCostCenter(companyCostCenters.length > 0 ? companyCostCenters[0].name : '');
            }
        }
    }, [projectId, projects, companyCostCenters, editingId]);


    const total = useMemo(() => {
        return items.reduce((acc, item) => {
            const price = parseFormattedCurrency(item.price);
            return acc + (price * item.quantity);
        }, 0);
    }, [items]);

    const calculatedCharges = useMemo(() => {
        if (editingId) {
            const originalReceivable = receivables.find(r => r.id === editingId);
            if (originalReceivable) {
                return calculateCharges(originalReceivable);
            }
        }
        return null;
    }, [editingId, receivables]);

    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), description: '', quantity: 1, price: '' }]);
    };

    const handleRemoveItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleItemChange = (id: number, field: keyof Omit<InvoiceItem, 'id'>, value: string | number) => {
        let finalValue = value;
        if (field === 'price') {
            finalValue = formatCurrencyOnInput(value as string);
        }
        setItems(items.map(item => item.id === id ? { ...item, [field]: finalValue } : item));
    };

    const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCustomer(value);
        const exists = contacts.some(c => c.name.toLowerCase() === value.trim().toLowerCase() && c.type === 'Cliente');
        setShowNewContactForm(!exists && value.trim().length > 0);
        if (exists) {
            setNewContactData({ name: '', document: '' });
            setNewContactDocError('');
        } else {
            setNewContactData({ name: value, document: '' });
        }
    };

    const handleNewContactDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatDocument(e.target.value);
        setNewContactData(d => ({...d, document: formattedValue}));
        if (newContactDocError) {
            setNewContactDocError('');
        }
    };

    const handleNewContactDocBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const doc = e.target.value;
        if (doc && !isValidDocument(doc)) {
            setNewContactDocError('CPF/CNPJ inválido.');
        } else {
            setNewContactDocError('');
        }
    };
    
    const handleSaveNewContact = () => {
        if (!newContactData.name.trim() || !newContactData.document.trim()) {
            alert('Nome e Documento são obrigatórios para o novo contato.');
            return;
        }

        if (!isValidDocument(newContactData.document)) {
            setNewContactDocError('O CPF ou CNPJ inserido é inválido. Por favor, verifique.');
            return;
        }

        const newContact: Contact = {
            id: `contact${Date.now()}`,
            name: newContactData.name.trim(),
            document: newContactData.document.trim(),
            type: 'Cliente',
            email: '',
            phone: '',
            address: { street: '', number: '', neighborhood: '', city: '', state: '', zip: '' },
            company: selectedCompany,
            taxRegime: 'Simples Nacional',
        };

        setContacts(prev => [...prev, newContact]);
        setCustomer(newContact.name); // Ensure the input is updated
        setShowNewContactForm(false);
        setNewContactData({ name: '', document: '' });
    };

    const handleAttachmentChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setLoadingMessage('Processando...');
            try {
                const filePromises = Array.from(files).map(file => {
                    return new Promise<NonNullable<Transaction['attachments']>[0]>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = e => {
                            const content = (e.target?.result as string)?.split(',')[1];
                            if (content) {
                                resolve({
                                    fileName: file.name,
                                    fileType: file.type,
                                    fileContent: content,
                                });
                            } else {
                                reject(new Error('Falha ao ler o conteúdo do arquivo.'));
                            }
                        };
                        reader.onerror = error => reject(error);
                        reader.readAsDataURL(file);
                    });
                });
    
                const newAttachments = await Promise.all(filePromises);
                setAttachments(prev => [...(prev || []), ...newAttachments]);
            } catch (error) {
                console.error("Erro ao ler anexos:", error);
                alert("Ocorreu um erro ao ler um dos arquivos.");
            } finally {
                setLoadingMessage('');
                event.target.value = '';
            }
        }
    };


     const handleRemoveAttachment = (fileNameToRemove: string) => {
        setAttachments(prev => prev?.filter(att => att.fileName !== fileNameToRemove) || []);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingMessage('Salvando...');

        try {
            const interestRateValue = applyInterest ? parseFormattedCurrency(interestConfig.rate) || undefined : undefined;
            const fineRateValue = applyFine ? parseFormattedCurrency(fineRate) || undefined : undefined;

            // Handle editing an existing invoice
            if (editingId) {
                const originalReceivable = receivables.find(r => r.id === editingId);
                if (!originalReceivable) {
                    throw new Error("Cobrança original não encontrada para edição.");
                }
                
                const customerContact = contacts.find(c => c.name.toLowerCase() === customer.toLowerCase());
                const finalContactId = customerContact?.id || originalReceivable.contactId;

                const updatedInvoiceData: InvoiceData = {
                    ...(originalReceivable.invoiceDetails || {} as InvoiceData),
                    customer,
                    dueDate,
                    items: items.map(item => ({...item, price: item.price.toString()})), // Ensure price is string
                    total,
                    bank,
                    invoiceType,
                    issuerProvider: isRentalCharge ? '' : issuerProvider,
                    interestRate: interestRateValue,
                    interestType: interestRateValue ? interestConfig.type : undefined,
                    fineRate: fineRateValue,
                };

                const updatedReceivable: Transaction = {
                    ...originalReceivable,
                    description: items[0]?.description || `Cobrança para ${customer}`,
                    amount: total,
                    dueDate: dueDate,
                    paymentDate: isPaid ? paymentDate : undefined,
                    contactId: finalContactId,
                    propertyId: propertyId || undefined,
                    projectId: projectId || undefined,
                    costCenter: costCenter,
                    interestRate: interestRateValue,
                    interestType: interestRateValue ? interestConfig.type : undefined,
                    fineRate: fineRateValue,
                    attachments: attachments || undefined,
                    invoiceDetails: updatedInvoiceData,
                };
                
                setReceivables(receivables.map(r => (r.id === editingId ? updatedReceivable : r)));
                setSubmission({ data: updatedInvoiceData, nfGenerated: !isRentalCharge });
                setLoadingMessage('');
                return; 
            }

            // --- Logic for creating NEW invoices ---
            setLoadingMessage('Enviando...');
            const customerContact = contacts.find(c => c.name.toLowerCase() === customer.toLowerCase());
            
            let apiResponse: ApiResponse | null = null;
            const shouldGenerateNf = !isRentalCharge;

            const installmentDetails: { number: string; dueDate: string; amount: number }[] = [];
            if (applyInstallments && installmentData.count > 1) {
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
                    installmentDetails.push({
                        number: String(i + 1).padStart(3, '0'),
                        dueDate: currentDueDate.toISOString().split('T')[0],
                        amount: installmentAmount,
                    });
                }
            }
            
            if (shouldGenerateNf) {
                 const issuerCompany = companies.find(c => c.name === selectedCompany);
                 if (!customerContact) {
                    alert('Para emitir uma Nota Fiscal, um cliente válido do cadastro deve ser selecionado.');
                    setLoadingMessage('');
                    return;
                }
                if (!issuerCompany) {
                    alert('Empresa emissora não encontrada.');
                    setLoadingMessage('');
                    return;
                }

                const apiPayload = {
                    issuer: issuerCompany,
                    customer: customerContact,
                    total: total,
                    items: items.map(item => ({...item, price: parseFormattedCurrency(item.price).toString()})),
                    dueDate: dueDate,
                    installments: installmentDetails.length > 0 ? installmentDetails : undefined,
                };

                apiResponse = await emitirNFe(apiPayload);

                if (!apiResponse.success) {
                    throw new Error(apiResponse.errorMessage || 'Falha na emissão da NF-e.');
                }
            }

            const baseInvoiceData: InvoiceData = {
                customer,
                dueDate,
                items,
                total,
                bank,
                invoiceType,
                issuerProvider: shouldGenerateNf ? issuerProvider : '',
                interestRate: interestRateValue,
                interestType: interestRateValue ? interestConfig.type : undefined,
                fineRate: fineRateValue,
                issuerProviderTransactionId: apiResponse?.providerId,
                issuerProviderStatus: apiResponse ? 'issued' : undefined,
                cfop: apiResponse?.cfop,
                xmlContent: apiResponse?.xmlContent,
            };

            const baseTransactionDetails = {
                category: isRentalCharge ? 'Aluguéis' : 'Venda de Serviço/Produto',
                status: 'Pendente' as 'Pendente',
                type: 'receita' as 'receita',
                company: selectedCompany,
                costCenter: costCenter,
                bankAccount: MOCK_BANK_ACCOUNTS.find(b => b.company === selectedCompany)?.id || MOCK_BANK_ACCOUNTS[0].id,
                contactId: customerContact?.id,
                propertyId: propertyId || undefined,
                projectId: projectId || undefined,
                interestRate: interestRateValue,
                interestType: interestRateValue ? interestConfig.type : undefined,
                fineRate: fineRateValue,
                attachments: attachments || undefined,
            };

            if (applyInstallments && installmentData.count > 1) {
                const newReceivables: Transaction[] = [];
                installmentDetails.forEach((inst, i) => {
                    const installmentReceivable: Transaction = {
                        ...baseTransactionDetails,
                        id: `r${Date.now() + i}`,
                        description: `${items[0]?.description || 'Cobrança'} (Parcela ${i + 1}/${installmentData.count})`,
                        amount: inst.amount,
                        dueDate: inst.dueDate,
                        invoiceDetails: baseInvoiceData,
                    };
                    newReceivables.push(installmentReceivable);
                });
                setReceivables(prev => [...prev, ...newReceivables]);

            } else {
                const newReceivable: Transaction = {
                    ...baseTransactionDetails,
                    id: `r${Date.now()}`,
                    description: items[0]?.description || `Cobrança para ${customer}`,
                    amount: total,
                    dueDate: dueDate,
                    invoiceDetails: baseInvoiceData,
                };
                setReceivables(prev => [...prev, newReceivable]);
            }
            
            setSubmission({ data: baseInvoiceData, installments: applyInstallments ? installmentData.count : undefined, nfGenerated: shouldGenerateNf });
        } catch (error) {
            console.error("Erro na emissão:", error);
            alert((error as Error).message);
        } finally {
            setLoadingMessage('');
        }
    };
    
    const companyProperties = properties.filter(p => p.company === selectedCompany);
    const receivableToEdit = initialData && 'receivableToEdit' in initialData ? initialData.receivableToEdit : null;


    if (!isOpen) return null;

    if (submission) {
        return <SuccessView submission={submission} onNewInvoice={handleNewInvoice} onClose={onClose} />;
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-4xl flex flex-col h-full max-h-[95vh]" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                     <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center flex-shrink-0">
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{editingId ? "Editar Cobrança" : "Gerar Cobrança e Nota Fiscal"}</h1>
                        <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                             <CloseIcon />
                        </button>
                    </div>
                    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                        <fieldset>
                             <legend className="text-lg font-medium text-gray-900 dark:text-white mb-4">Informações da Cobrança</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label htmlFor="customer" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cliente (Nome ou CNPJ/CPF)</label>
                                    <input
                                        type="text"
                                        id="customer"
                                        name="customer"
                                        placeholder="Busque ou digite um novo nome"
                                        value={customer}
                                        onChange={handleCustomerChange}
                                        list="customers-list"
                                        required
                                        className={`${inputStyle} mt-1`}
                                    />
                                    <datalist id="customers-list">
                                        {contacts.filter(c => c.type === 'Cliente' && c.company === selectedCompany).map(c => <option key={c.id} value={c.name} />)}
                                    </datalist>
                                </div>
                                <div>
                                    <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data de Vencimento</label>
                                    <input type="date" id="dueDate" name="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} required className={`${inputStyle} mt-1`} />
                                </div>
                                {isPaid && (
                                     <div>
                                        <label htmlFor="paymentDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data de Recebimento</label>
                                        <input type="date" id="paymentDate" name="paymentDate" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className={`${inputStyle} mt-1`} />
                                    </div>
                                )}
                                {receivableToEdit?.status === 'Pago' && (
                                     <div>
                                        <label htmlFor="paymentMethod" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Meio de Pagamento</label>
                                        <input type="text" id="paymentMethod" value={receivableToEdit.paymentMethod || 'Não registrado'} disabled className={`${inputStyle} mt-1`} />
                                     </div>
                                )}
                                <div>
                                    <label htmlFor="costCenter" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Centro de Custo</label>
                                    <select id="costCenter" value={costCenter} onChange={e => setCostCenter(e.target.value)} className={`${selectStyle} mt-1`} required disabled={!!projectId}>
                                        {companyCostCenters.length > 0 ? (
                                            companyCostCenters.map(cc => <option key={cc.id} value={cc.name}>{cc.name}</option>)
                                        ) : (
                                            <option value="" disabled>Nenhum centro de custo</option>
                                        )}
                                    </select>
                                </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                                     <div>
                                        <label htmlFor="propertyId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Vincular a Imóvel (Opcional)</label>
                                        <select id="propertyId" value={propertyId} onChange={e => setPropertyId(e.target.value)} className={`${selectStyle} mt-1`}>
                                            <option value="">Nenhum</option>
                                            {companyProperties.map(prop => <option key={prop.id} value={prop.id}>{prop.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="projectId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Vincular a Projeto (Opcional)</label>
                                        <select id="projectId" value={projectId} onChange={e => setProjectId(e.target.value)} className={`${selectStyle} mt-1`}>
                                            <option value="">Nenhum</option>
                                            {companyProjects.map(proj => <option key={proj.id} value={proj.id}>{proj.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            {showNewContactForm && (
                                <div className="mt-4 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50">
                                    <h4 className="font-semibold text-indigo-800 dark:text-indigo-200">Adicionar Novo Cliente</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                                        <div className="sm:col-span-2">
                                            <label htmlFor="new-contact-name" className="text-sm text-slate-600 dark:text-slate-300">Nome do Cliente</label>
                                            <input type="text" id="new-contact-name" value={newContactData.name} onChange={e => setNewContactData(d => ({...d, name: e.target.value}))} className={inputStyle} />
                                        </div>
                                        <div>
                                            <label htmlFor="new-contact-doc" className="text-sm text-slate-600 dark:text-slate-300">CNPJ / CPF</label>
                                            <input type="text" id="new-contact-doc" value={newContactData.document} onChange={handleNewContactDocChange} onBlur={handleNewContactDocBlur} className={`${inputStyle} ${newContactDocError ? '!ring-red-500 focus:!ring-red-500' : ''}`} />
                                            {newContactDocError && <p className="mt-1 text-xs text-red-600">{newContactDocError}</p>}
                                        </div>
                                    </div>
                                    <button type="button" onClick={handleSaveNewContact} disabled={!!newContactDocError} className="mt-3 bg-indigo-600 text-white font-semibold px-4 py-1.5 rounded-md text-sm hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                                        Salvar Cliente
                                    </button>
                                </div>
                            )}
                             {propertyId && (
                                <div className="mt-4 p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
                                     <h3 className="font-semibold text-slate-800 dark:text-slate-200">Detalhes da Cobrança do Imóvel</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="chargeType" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Cobrança</label>
                                            <select id="chargeType" value={chargeType} onChange={e => setChargeType(e.target.value as any)} className={`${selectStyle} mt-1`}>
                                                <option value="rent">Aluguel Mensal</option>
                                                <option value="deposit">Depósito Caução</option>
                                                <option value="prorated">Aluguel Proporcional</option>
                                                <option value="other">Outra Cobrança</option>
                                            </select>
                                        </div>
                                         {chargeType === 'rent' && (
                                            <div className="grid grid-cols-2 gap-2">
                                                 <div>
                                                    <label htmlFor="referenceMonth" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mês de Referência</label>
                                                    <select id="referenceMonth" value={referenceMonth} onChange={e => setReferenceMonth(e.target.value)} className={`${selectStyle} mt-1`}>
                                                        {Array.from({ length: 12 }, (_, i) => <option key={i} value={i}>{new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}</option>)}
                                                    </select>
                                                </div>
                                                 <div>
                                                    <label htmlFor="referenceYear" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Ano</label>
                                                    <select id="referenceYear" value={referenceYear} onChange={e => setReferenceYear(e.target.value)} className={`${selectStyle} mt-1`}>
                                                        {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(year => <option key={year} value={year}>{year}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-2">
                                        <label className={`flex items-center ${!!editingId ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                            <input type="checkbox" disabled={!!editingId} checked={isRentalCharge} onChange={e => setIsRentalCharge(e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed" />
                                            <span className={`ml-2 text-slate-700 dark:text-slate-300 ${!!editingId ? 'text-gray-400 dark:text-gray-500' : ''}`}>
                                                Cobrança de Aluguel (não gera Nota Fiscal)
                                            </span>
                                        </label>
                                        {!!editingId && <p className="text-xs text-gray-400 pl-6">Não é possível alterar a natureza fiscal de uma cobrança existente.</p>}
                                    </div>
                                </div>
                            )}
                        </fieldset>
                        
                        <hr className="my-6 border-slate-200 dark:border-slate-700" />

                        <fieldset>
                             <legend className="text-lg font-medium text-gray-900 dark:text-white mb-4">Itens da Cobrança</legend>
                            <div className="space-y-4">
                               {items.map((item) => (
                                   <div key={item.id} className="flex items-end gap-4">
                                       <div className="flex-1">
                                            <label htmlFor={`item-desc-${item.id}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300">Descrição</label>
                                            <input type="text" id={`item-desc-${item.id}`} value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} placeholder="Ex: Consultoria Financeira" required className={`${inputStyle} mt-1`} />
                                       </div>
                                       <div className="w-24">
                                            <label htmlFor={`item-qty-${item.id}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300">Qtde.</label>
                                            <input type="number" min="1" id={`item-qty-${item.id}`} value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value, 10) || 1)} placeholder="1" required className={`${inputStyle} mt-1`} />
                                       </div>
                                       <div className="w-40">
                                            <label htmlFor={`item-price-${item.id}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300">Valor Unit.</label>
                                            <input type="text" inputMode="decimal" id={`item-price-${item.id}`} value={item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} placeholder="Ex: 1.500,00" required className={`${inputStyle} mt-1`} />
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

                         {calculatedCharges && calculatedCharges.total > total && (
                            <div className="my-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50">
                                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Resumo de Encargos por Atraso</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                                    <div><span className="text-slate-600 dark:text-slate-300">Valor Original:</span><strong className="block text-slate-800 dark:text-slate-100">{formatCurrency(total)}</strong></div>
                                    <div><span className="text-slate-600 dark:text-slate-300">Multa:</span><strong className="block text-slate-800 dark:text-slate-100">{formatCurrency(calculatedCharges.fine)}</strong></div>
                                    <div><span className="text-slate-600 dark:text-slate-300">Juros:</span><strong className="block text-slate-800 dark:text-slate-100">{formatCurrency(calculatedCharges.interest)}</strong></div>
                                    <div><span className="text-slate-600 dark:text-slate-300">Total para Pagamento Hoje:</span><strong className="block text-lg text-green-600 dark:text-green-400">{formatCurrency(calculatedCharges.total)}</strong></div>
                                </div>
                            </div>
                        )}

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
                                 <hr className="my-2 border-slate-200 dark:border-slate-700/50" />
                                <div>
                                    <label className="flex items-center cursor-pointer">
                                        <input type="checkbox" checked={applyInterest} onChange={e => setApplyInterest(e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                        <span className="ml-2 text-slate-700 dark:text-slate-300">Aplicar Juros por Atraso?</span>
                                    </label>
                                    {applyInterest && (
                                        <div className="grid grid-cols-2 gap-4 mt-2 pl-6">
                                            <div>
                                                <label htmlFor="interest-rate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Taxa de Juros (%)</label>
                                                <input type="text" inputMode="decimal" id="interest-rate" value={interestConfig.rate} onChange={e => setInterestConfig(c => ({...c, rate: formatCurrencyOnInput(e.target.value)}))} className={`${inputStyle} mt-1`} />
                                            </div>
                                            <div>
                                                <label htmlFor="interest-type" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Juros</label>
                                                <select id="interest-type" value={interestConfig.type} onChange={e => setInterestConfig(c => ({...c, type: e.target.value as any}))} className={`${selectStyle} mt-1`}>
                                                    <option value="daily">Ao Dia</option>
                                                    <option value="monthly">Ao Mês</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <hr className="my-2 border-slate-200 dark:border-slate-700/50" />
                                <div>
                                    <label className="flex items-center cursor-pointer">
                                        <input type="checkbox" checked={applyFine} onChange={e => setApplyFine(e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                        <span className="ml-2 text-slate-700 dark:text-slate-300">Aplicar Multa por Atraso?</span>
                                    </label>
                                    {applyFine && (
                                        <div className="mt-2 pl-6 md:w-1/2">
                                            <label htmlFor="fine-rate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Taxa de Multa (%)</label>
                                            <input type="text" inputMode="decimal" id="fine-rate" value={fineRate} onChange={e => setFineRate(formatCurrencyOnInput(e.target.value))} className={`${inputStyle} mt-1`} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </fieldset>
                        
                    </div>
                    <div className="px-6 py-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                        <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors">
                           {loadingMessage || (editingId ? 'Salvar Alterações' : 'Gerar Cobrança')}
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

// Icons for SuccessView
const BoletoIcon = () => <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>;
const DanfeIcon = () => <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;
const XmlIcon = () => <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>;
const DownloadIcon = () => <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>;
