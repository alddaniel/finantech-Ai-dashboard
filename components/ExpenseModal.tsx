
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Transaction, Contact, Property, ParsedNFeData, BankAccount, CostCenter, ToastMessage, Category, Project } from '../types';
import { MOCK_PAYMENT_METHODS } from '../constants';
import { parseNFeXmlForExpense } from '../services/xmlParserService';
import { XmlDetailsModal } from './XmlDetailsModal';
import { AttachmentPreviewModal } from './AttachmentPreviewModal';

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


interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (expense: Transaction) => void;
    onSaveMultiple: (expenses: Omit<Transaction, 'id'>[]) => void;
    addToast: (toast: Omit<ToastMessage, 'id'>) => void;
    expenseToEdit: Transaction | null;
    selectedCompany: string;
    contacts: Contact[];
    setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
    properties: Property[];
    projects: Project[];
    bankAccounts: BankAccount[];
    costCenters: CostCenter[];
    categories: Category[];
}

const inputStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";
const selectStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 pl-3 pr-10 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";
const checkboxLabelStyle = "flex items-center text-sm font-medium text-slate-700 dark:text-slate-300";
const checkboxStyle = "h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500";

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

const base64ToBlob = (base64: string, mimeType: string): Blob | null => {
    try {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    } catch (e) {
        console.error("Error decoding base64:", e);
        return null;
    }
};

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, onSave, onSaveMultiple, addToast, expenseToEdit, selectedCompany, contacts, setContacts, properties, projects, bankAccounts, costCenters, categories }) => {
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getInitialState = useCallback((): Transaction => {
        const defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + 7);
        const defaultDueDateStr = defaultDueDate.toISOString().split('T')[0];

        if (expenseToEdit) {
            const convertToInputDate = (dateStr: string | undefined): string | undefined => {
                if (!dateStr) return undefined;
                if (dateStr.includes('/')) {
                    const [day, month, year] = dateStr.split('/');
                    return `${year}-${month}-${day}`;
                }
                return dateStr;
            };
            
            return {
                ...expenseToEdit,
                dueDate: convertToInputDate(expenseToEdit.dueDate) || defaultDueDateStr,
                paymentDate: convertToInputDate(expenseToEdit.paymentDate)
            };
        }
        
        const companyCostCenters = costCenters.filter(c => c.company === selectedCompany);

        return {
            id: '',
            description: '',
            category: categories.find(c => c.type === 'despesa')?.name || '',
            amount: 0,
            dueDate: defaultDueDateStr,
            status: 'Pendente',
            type: 'despesa',
            company: selectedCompany,
            costCenter: companyCostCenters[0]?.name || '',
            bankAccount: bankAccounts.find(a => a.company === selectedCompany)?.id || '',
            paymentMethod: MOCK_PAYMENT_METHODS[0],
            fixedOrVariable: 'variável',
        };
    }, [expenseToEdit, selectedCompany, bankAccounts, costCenters, categories]);
    
    const [formData, setFormData] = useState<Transaction>(getInitialState());
    const [amountString, setAmountString] = useState('');
    const [interestRateString, setInterestRateString] = useState('');
    const [fineRateString, setFineRateString] = useState('');
    const [hasRecurrence, setHasRecurrence] = useState(!!expenseToEdit?.recurrence);
    const [hasCharges, setHasCharges] = useState(!!expenseToEdit?.interestRate || !!expenseToEdit?.fineRate);
    const [xmlContent, setXmlContent] = useState<string | null>(null);
    const [parsedXmlData, setParsedXmlData] = useState<ParsedNFeData | null>(null);
    const [isXmlDetailsModalOpen, setIsXmlDetailsModalOpen] = useState(false);
    const [attachments, setAttachments] = useState<Transaction['attachments']>([]);
    const [viewingAttachment, setViewingAttachment] = useState<NonNullable<Transaction['attachments']>[0] | null>(null);
    
    const [supplierName, setSupplierName] = useState('');
    const [showNewContactForm, setShowNewContactForm] = useState(false);
    const [newContactData, setNewContactData] = useState({ name: '', document: '', taxRegime: 'Simples Nacional', ie: '' });
    const [newContactDocError, setNewContactDocError] = useState('');

    useEffect(() => {
        if (isOpen) {
            const initialState = getInitialState();
            setFormData(initialState);
            setAmountString(initialState.amount > 0 ? initialState.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '');
            setInterestRateString(initialState.interestRate ? initialState.interestRate.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '');
            setFineRateString(initialState.fineRate ? initialState.fineRate.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '');
            setHasRecurrence(!!initialState.recurrence);
            setHasCharges(!!initialState.interestRate || !!initialState.fineRate);
            setXmlContent(initialState.purchaseXmlContent || null);
            setParsedXmlData(null);
            setIsXmlDetailsModalOpen(false);
            setAttachments(initialState.attachments || []);
            setShowNewContactForm(false);
            setNewContactData({ name: '', document: '', taxRegime: 'Simples Nacional', ie: '' });
            setNewContactDocError('');
            
            const initialSupplier = contacts.find(c => c.id === initialState.contactId);
            setSupplierName(initialSupplier?.name || '');
        }
    }, [isOpen, expenseToEdit, getInitialState]);
    
    useEffect(() => {
        if (formData.projectId) {
            const selectedProject = projects.find(p => p.id === formData.projectId);
            if (selectedProject && selectedProject.costCenterName !== formData.costCenter) {
                setFormData(prev => ({
                    ...prev,
                    costCenter: selectedProject.costCenterName
                }));
            }
        }
    }, [formData.projectId, projects]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
    
        if (!file || !file.name.toLowerCase().endsWith('.xml')) {
            if (file) addToast({ type: 'warning', title: 'Arquivo Inválido', description: 'Por favor, selecione um arquivo .xml válido.'});
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }
    
        try {
            const content = await file.text();
            setXmlContent(content);
            const parsedData = await parseNFeXmlForExpense(content);
            
            let supplier = contacts.find(c => 
                c.document.replace(/\D/g, '') === parsedData.supplier.cnpj.replace(/\D/g, '')
            );
            let supplierId = supplier?.id;
    
            if (!supplier && parsedData.supplier.cnpj) {
                const newSupplier: Contact = {
                    id: `contact${Date.now()}`,
                    name: parsedData.supplier.name,
                    type: 'Fornecedor',
                    document: formatDocument(parsedData.supplier.cnpj),
                    email: '',
                    phone: '',
                    company: selectedCompany,
                    address: parsedData.supplier.address,
                    taxRegime: parsedData.supplier.taxRegime,
                    ie: parsedData.supplier.ie,
                };
                setContacts(prev => [...prev, newSupplier]);
                supplierId = newSupplier.id;
                addToast({
                    type: 'success',
                    title: 'Fornecedor Cadastrado',
                    description: `Novo fornecedor "${newSupplier.name}" cadastrado automaticamente.`
                });
            }
    
            if (parsedData.installments.length > 1) {
                const newExpenses: Omit<Transaction, 'id'>[] = parsedData.installments.map((inst, index) => ({
                    description: `NF-e: ${parsedData.supplier.name} - Parcela ${index + 1}/${parsedData.installments.length}`,
                    amount: inst.amount,
                    dueDate: inst.dueDate || '',
                    contactId: supplierId,
                    status: 'Pendente',
                    type: 'despesa',
                    category: categories.find(c => c.type === 'despesa')?.name || 'Despesas Operacionais',
                    company: selectedCompany,
                    costCenter: costCenters.find(c => c.company === selectedCompany)?.name || 'Administrativo',
                    bankAccount: '',
                    purchaseXmlContent: content,
                    paymentMethod: parsedData.paymentMethod || undefined,
                }));
                onSaveMultiple(newExpenses);
                addToast({
                    type: 'success',
                    title: 'Importação Concluída',
                    description: `${newExpenses.length} parcelas foram importadas e salvas com sucesso.`
                });
                onClose();
                return;
            }
            
            const singleInstallment = parsedData.installments[0];
            setFormData(prev => ({
                ...prev,
                description: `NF-e Importada - ${parsedData.supplier.name}`,
                dueDate: singleInstallment?.dueDate || prev.dueDate,
                contactId: supplierId || prev.contactId,
                status: parsedData.status || prev.status,
                paymentDate: parsedData.paymentDate || prev.paymentDate,
                paymentMethod: parsedData.paymentMethod || prev.paymentMethod,
            }));
            
            setAmountString((singleInstallment?.amount || parsedData.totalAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
            setSupplierName(parsedData.supplier.name);
            setParsedXmlData(parsedData);
            setIsXmlDetailsModalOpen(true);
    
        } catch (error) {
            console.error("Failed to parse XML", error);
            addToast({
                type: 'warning',
                title: 'Erro na Importação',
                description: `Não foi possível processar o arquivo XML: ${(error as Error).message}`
            });
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    
    const handleSupplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSupplierName(value);

        const existingContact = contacts.find(c => c.name.toLowerCase() === value.trim().toLowerCase() && c.type === 'Fornecedor');
        if (existingContact) {
            setFormData(prev => ({ ...prev, contactId: existingContact.id }));
            setShowNewContactForm(false);
            setNewContactDocError('');
        } else {
            setFormData(prev => ({ ...prev, contactId: undefined }));
            setShowNewContactForm(value.trim().length > 0);
            setNewContactData(prev => ({ ...prev, name: value }));
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
            alert('Nome e Documento são obrigatórios para o novo fornecedor.');
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
            type: 'Fornecedor',
            email: '', phone: '',
            address: { street: '', number: '', neighborhood: '', city: '', state: '', zip: '' },
            company: selectedCompany,
            taxRegime: newContactData.taxRegime as any,
            ie: newContactData.ie,
        };

        setContacts(prev => [...prev, newContact]);
        setFormData(prev => ({ ...prev, contactId: newContact.id }));
        setSupplierName(newContact.name);
        setShowNewContactForm(false);
        setNewContactData({ name: '', document: '', taxRegime: 'Simples Nacional', ie: '' });
    };

    const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
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

            Promise.all(filePromises)
                .then(newAttachments => {
                    setAttachments(prev => [...(prev || []), ...newAttachments]);
                })
                .catch(error => {
                    console.error("Erro ao ler anexos:", error);
                    alert("Ocorreu um erro ao ler um dos arquivos.");
                });
        }
    };

    const handleRemoveAttachment = (fileNameToRemove: string) => {
        setAttachments(prev => prev?.filter(att => att.fileName !== fileNameToRemove) || []);
    };
    
    const handleViewAttachment = (attachment: NonNullable<Transaction['attachments']>[0]) => {
        const blob = base64ToBlob(attachment.fileContent, attachment.fileType);
        if (!blob) {
            alert('Não foi possível carregar o anexo. O arquivo pode estar corrompido.');
            return;
        }

        if (attachment.fileType === 'application/pdf') {
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } else {
            setViewingAttachment(attachment);
        }
    };

    const handleDownloadAttachment = (attachment: NonNullable<Transaction['attachments']>[0]) => {
        const blob = base64ToBlob(attachment.fileContent, attachment.fileType);
        if (!blob) {
            alert('Não foi possível baixar o anexo. O arquivo pode estar corrompido.');
            return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = attachment.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value }));
    };

    const handleRecurrenceChange = <K extends keyof NonNullable<Transaction['recurrence']>>(
        field: K,
        value: NonNullable<Transaction['recurrence']>[K]
    ) => {
        setFormData(p => ({
            ...p,
            recurrence: {
                ...p.recurrence,
                interval: 'monthly', // default
                [field]: value,
            },
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const finalData = { 
            ...formData, 
            amount: parseFormattedCurrency(amountString),
            interestRate: hasCharges ? parseFormattedCurrency(interestRateString) : undefined,
            fineRate: hasCharges ? parseFormattedCurrency(fineRateString) : undefined,
            purchaseXmlContent: xmlContent || undefined,
            attachments: attachments || undefined,
            projectId: formData.projectId || undefined,
        };

        if (!hasRecurrence) {
            delete finalData.recurrence;
        }
        if (!hasCharges) {
            delete finalData.interestRate;
            delete finalData.interestType;
            delete finalData.fineRate;
        }
        
        onSave(finalData);
    };

    if (!isOpen) return null;

    const companySuppliers = contacts.filter(c => c.type === 'Fornecedor' && c.company === selectedCompany);
    const companyBankAccounts = bankAccounts.filter(a => a.company === selectedCompany);
    const companyProperties = properties.filter(p => p.company === selectedCompany);
    const companyProjects = projects.filter(p => p.company === selectedCompany);
    const companyCostCenters = costCenters.filter(c => c.company === selectedCompany);
    const companyCategories = categories.filter(c => c.type === 'despesa' && c.company === selectedCompany);

    return (
        <>
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" aria-modal="true" role="dialog">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-4xl my-8 flex flex-col max-h-[95vh]" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center flex-shrink-0">
                         <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {expenseToEdit ? 'Editar Despesa' : 'Adicionar Nova Despesa'}
                        </h2>
                        <div className="flex items-center gap-2">
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xml" className="hidden" />
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-semibold px-4 py-2 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors flex items-center gap-2 text-sm"
                            >
                                <UploadIcon />
                                Importar XML
                            </button>
                             <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                                <CloseIcon />
                            </button>
                        </div>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto flex-1">
                        
                         <div className="pt-2">
                            <label htmlFor="attachment-upload" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Anexar Arquivos (PDF, Imagem, TXT)</label>
                            <input 
                                type="file" 
                                id="attachment-upload" 
                                onChange={handleAttachmentChange} 
                                accept=".pdf,.txt,.jpg,.jpeg,.png"
                                multiple
                                className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/50 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900" 
                            />
                            {attachments && attachments.length > 0 && (
                                <div className="mt-2 space-y-2">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Anexos Carregados:</p>
                                    <ul className="space-y-1 max-h-28 overflow-y-auto">
                                        {attachments.map((att, index) => (
                                            <li key={index} className="flex items-center justify-between p-1.5 bg-slate-100 dark:bg-slate-800 rounded-md text-sm">
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 truncate">
                                                    <FileIcon />
                                                    <span className="font-medium truncate" title={att.fileName}>{att.fileName}</span>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <button type="button" onClick={() => handleViewAttachment(att)} title="Visualizar" className="p-1 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
                                                        <ViewIcon />
                                                    </button>
                                                    <button type="button" onClick={() => handleDownloadAttachment(att)} title="Baixar" className="p-1 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
                                                        <DownloadIcon />
                                                    </button>
                                                    <button type="button" onClick={() => handleRemoveAttachment(att.fileName)} title="Remover" className="p-1 text-red-500 hover:text-red-700">
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Descrição</label>
                            <input type="text" name="description" id="description" value={formData.description} onChange={handleChange} required className={inputStyle} />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Valor (R$)</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    name="amount"
                                    id="amount"
                                    value={amountString}
                                    onChange={e => setAmountString(formatCurrencyOnInput(e.target.value))}
                                    required
                                    className={inputStyle}
                                    placeholder="0,00"
                                />
                            </div>
                             <div>
                                <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data de Vencimento</label>
                                <input type="date" name="dueDate" id="dueDate" value={formData.dueDate} onChange={handleChange} required className={inputStyle} />
                            </div>
                        </div>

                        {formData.status === 'Pago' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="paymentDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data da Baixa (Pagamento)</label>
                                    <input 
                                        type="date" 
                                        name="paymentDate" 
                                        id="paymentDate" 
                                        value={formData.paymentDate || ''} 
                                        onChange={handleChange} 
                                        required 
                                        className={inputStyle} 
                                    />
                                </div>
                                <div>
                                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Meio de Pagamento</label>
                                    <input 
                                        type="text"
                                        name="paymentMethod" 
                                        id="paymentMethod" 
                                        value={formData.paymentMethod || 'Não registrado'}
                                        disabled
                                        className={`${inputStyle} disabled:cursor-not-allowed disabled:bg-slate-200 dark:disabled:bg-slate-800/60`}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Categoria</label>
                                <select name="category" id="category" value={formData.category} onChange={handleChange} required className={selectStyle}>
                                    {companyCategories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="supplierName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fornecedor (Opcional)</label>
                                <input
                                    type="text"
                                    id="supplierName"
                                    list="suppliers-list"
                                    value={supplierName}
                                    onChange={handleSupplierChange}
                                    className={inputStyle}
                                    placeholder="Digite o nome do fornecedor"
                                />
                                <datalist id="suppliers-list">
                                    {companySuppliers.map(sup => <option key={sup.id} value={sup.name} />)}
                                </datalist>
                            </div>
                        </div>

                        {showNewContactForm && (
                            <div className="mt-4 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50">
                                <h4 className="font-semibold text-indigo-800 dark:text-indigo-200">Adicionar Novo Fornecedor</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                                    <div className="sm:col-span-2 lg:col-span-1">
                                        <label htmlFor="new-contact-name" className="text-sm text-slate-600 dark:text-slate-300">Nome</label>
                                        <input type="text" id="new-contact-name" value={newContactData.name} onChange={e => setNewContactData(d => ({...d, name: e.target.value}))} className={inputStyle} />
                                    </div>
                                    <div>
                                        <label htmlFor="new-contact-doc" className="text-sm text-slate-600 dark:text-slate-300">CNPJ / CPF</label>
                                        <input type="text" id="new-contact-doc" value={newContactData.document} onChange={handleNewContactDocChange} onBlur={handleNewContactDocBlur} className={`${inputStyle} ${newContactDocError ? '!ring-red-500 focus:!ring-red-500' : ''}`} />
                                        {newContactDocError && <p className="mt-1 text-xs text-red-600">{newContactDocError}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="new-contact-ie" className="text-sm text-slate-600 dark:text-slate-300">Inscrição Estadual</label>
                                        <input type="text" id="new-contact-ie" value={newContactData.ie} onChange={e => setNewContactData(d => ({...d, ie: e.target.value}))} className={inputStyle} />
                                    </div>
                                    <div>
                                        <label htmlFor="new-contact-taxRegime" className="text-sm text-slate-600 dark:text-slate-300">Regime Tributário</label>
                                        <select id="new-contact-taxRegime" value={newContactData.taxRegime} onChange={e => setNewContactData(d => ({...d, taxRegime: e.target.value as any}))} className={selectStyle}>
                                            <option>Simples Nacional</option>
                                            <option>Lucro Presumido</option>
                                            <option>Lucro Real</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="button" onClick={handleSaveNewContact} disabled={!!newContactDocError} className="mt-3 bg-indigo-600 text-white font-semibold px-4 py-1.5 rounded-md text-sm hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                                    Salvar Fornecedor
                                </button>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div>
                                <label htmlFor="costCenter" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Centro de Custo</label>
                                <select name="costCenter" id="costCenter" value={formData.costCenter} onChange={handleChange} required className={selectStyle} disabled={!!formData.projectId}>
                                    <option value="" disabled>Selecione</option>
                                    {companyCostCenters.map(cc => <option key={cc.id} value={cc.name}>{cc.name}</option>)}
                                </select>
                                {!!formData.projectId && (
                                    <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">
                                        O centro de custo é definido pelo projeto selecionado.
                                    </p>
                                )}
                            </div>
                             <div>
                                <label htmlFor="propertyId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Vincular a Imóvel (Opcional)</label>
                                <select name="propertyId" id="propertyId" value={formData.propertyId || ''} onChange={handleChange} className={selectStyle}>
                                    <option value="">Nenhum</option>
                                    {companyProperties.map(prop => <option key={prop.id} value={prop.id}>{prop.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="projectId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Vincular a Projeto (Opcional)</label>
                                <select name="projectId" id="projectId" value={formData.projectId || ''} onChange={handleChange} className={selectStyle}>
                                    <option value="">Nenhum</option>
                                    {companyProjects.map(proj => <option key={proj.id} value={proj.id}>{proj.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="md:w-1/2">
                            <label htmlFor="bankAccount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Conta p/ Débito (Opcional)</label>
                            <select name="bankAccount" id="bankAccount" value={formData.bankAccount} onChange={handleChange} className={selectStyle}>
                                <option value="">Não especificado</option>
                                {companyBankAccounts.map(acc => <option key={acc.id} value={acc.id}>{`${acc.name} (${acc.agency}/${acc.account})`}</option>)}
                            </select>
                        </div>

                         <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                            <div>
                                <label className={checkboxLabelStyle}>
                                    <input type="checkbox" checked={hasRecurrence} onChange={e => setHasRecurrence(e.target.checked)} className={checkboxStyle} />
                                    <span className="ml-2">É uma despesa recorrente?</span>
                                </label>
                                {hasRecurrence && (
                                    <div className="grid grid-cols-2 gap-4 mt-2 pl-6">
                                        <div>
                                            <label htmlFor="recurrence-interval" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Frequência</label>
                                            <select 
                                                id="recurrence-interval" 
                                                value={formData.recurrence?.interval || 'monthly'} 
                                                onChange={e => handleRecurrenceChange('interval', e.target.value as any)} 
                                                className={selectStyle}
                                            >
                                                <option value="monthly">Mensal</option>
                                                <option value="yearly">Anual</option>
                                            </select>
                                        </div>
                                         <div>
                                            <label htmlFor="recurrence-endDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data Final (Opcional)</label>
                                            <input 
                                                type="date" 
                                                id="recurrence-endDate" 
                                                value={formData.recurrence?.endDate || ''} 
                                                onChange={e => handleRecurrenceChange('endDate', e.target.value)}
                                                className={inputStyle} 
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                             <div>
                                <label className={checkboxLabelStyle}>
                                    <input type="checkbox" checked={hasCharges} onChange={e => setHasCharges(e.target.checked)} className={checkboxStyle} />
                                    <span className="ml-2">Aplicar juros/multa por atraso?</span>
                                </label>
                                {hasCharges && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 pl-6">
                                         <div>
                                            <label htmlFor="interestRate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Taxa Juros (%)</label>
                                            <input type="text" inputMode="decimal" id="interestRate" value={interestRateString} onChange={e => setInterestRateString(formatCurrencyOnInput(e.target.value))} className={inputStyle} />
                                        </div>
                                         <div>
                                            <label htmlFor="interestType" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo Juros</label>
                                            <select id="interestType" name="interestType" value={formData.interestType || 'daily'} onChange={handleChange} className={selectStyle}>
                                                <option value="daily">Ao dia</option>
                                                <option value="monthly">Ao mês</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="fineRate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Multa (%)</label>
                                            <input type="text" inputMode="decimal" id="fineRate" value={fineRateString} onChange={e => setFineRateString(formatCurrencyOnInput(e.target.value))} className={inputStyle} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>


                    </div>
                    <div className="px-6 py-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                        <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors">
                            Salvar Despesa
                        </button>
                    </div>
                </form>
            </div>
        </div>
        {isXmlDetailsModalOpen && (
            <XmlDetailsModal 
                isOpen={isXmlDetailsModalOpen}
                onClose={() => setIsXmlDetailsModalOpen(false)}
                data={parsedXmlData}
            />
        )}
        {viewingAttachment && (
            <AttachmentPreviewModal
                attachment={viewingAttachment}
                onClose={() => setViewingAttachment(null)}
            />
        )}
        </>
    );
};

const UploadIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>;
const FileIcon = () => <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;
const TrashIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const ViewIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>;
const DownloadIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>;