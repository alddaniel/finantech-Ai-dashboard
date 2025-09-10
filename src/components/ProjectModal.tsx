import React, { useState, useEffect, useMemo } from 'react';
import type { Project, Contact, BudgetItem, ProjectStage, CostCenter, Proposal, Transaction } from '../types';
import { AttachmentPreviewModal } from './AttachmentPreviewModal';
import { IconDisplay } from './ui/IconComponents';

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (project: Project, generateInvoice: boolean) => void;
    projectToEdit: Project | null;
    proposalForProject?: Proposal | null;
    contacts: Contact[];
    setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
    selectedCompany: string;
    costCenters: CostCenter[];
    setCostCenters: React.Dispatch<React.SetStateAction<CostCenter[]>>;
}

const inputStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";
const selectStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 pl-3 pr-10 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";

const isValidDocument = (doc: string): boolean => {
    const cleaned = doc.replace(/\D/g, '');

    if (cleaned.length === 11) { // CPF
        if (/^(\d)\1+$/.test(cleaned)) return false;
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
  return numberValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const parseFormattedCurrency = (value: string): number => {
    if (typeof value !== 'string' || !value) return 0;
    const cleanedValue = value.replace(/R\$\s?/, '').replace(/\./g, '');
    const numericString = cleanedValue.replace(',', '.');
    return parseFloat(numericString) || 0;
};
// --- End Currency Formatting Utilities ---

const defaultProject: Omit<Project, 'id' | 'company'> = {
    name: '',
    type: 'Residencial',
    status: 'Planejamento',
    clientId: '',
    budget: [],
    stages: [],
    totalArea: 0,
    builtArea: 0,
    allocationMethod: 'none',
    costCenterName: '',
};

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

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSave, projectToEdit, proposalForProject, contacts, setContacts, selectedCompany, costCenters, setCostCenters }) => {
    const [formData, setFormData] = useState<Omit<Project, 'id'> & { id?: string }>(() => ({ ...defaultProject, company: selectedCompany }));
    const [generateFirstInvoice, setGenerateFirstInvoice] = useState(false);
    const [clientName, setClientName] = useState('');
    const [showNewClientForm, setShowNewClientForm] = useState(false);
    const [newClientData, setNewClientData] = useState({ name: '', document: '' });
    const [newClientDocError, setNewClientDocError] = useState('');
    const [viewingAttachment, setViewingAttachment] = useState<NonNullable<ProjectStage['deliverables']>[0] | null>(null);

    const companyCostCenters = useMemo(() => costCenters.filter(c => c.company === selectedCompany), [costCenters, selectedCompany]);

    const selectedClient = useMemo(() => {
        return contacts.find(c => c.id === formData.clientId);
    }, [formData.clientId, contacts]);

    useEffect(() => {
        if (projectToEdit) {
            setFormData({
                ...projectToEdit,
                budget: projectToEdit.budget || [],
                stages: projectToEdit.stages || [],
                allocationMethod: projectToEdit.allocationMethod || 'none',
            });
            const client = contacts.find(c => c.id === projectToEdit.clientId);
            setClientName(client?.name || '');
            setShowNewClientForm(false);
            setGenerateFirstInvoice(false);
        } else if (proposalForProject) {
             const budgetItemsFromProposal: BudgetItem[] = proposalForProject.items.map(item => ({
                id: `b_prop_${item.id}`,
                description: item.description,
                type: 'Serviços',
                cost: item.value,
            }));
             setFormData({
                ...defaultProject,
                name: proposalForProject.name,
                clientId: proposalForProject.clientId,
                budget: budgetItemsFromProposal,
                company: selectedCompany,
                costCenterName: `Proj. ${proposalForProject.name}` // Pre-fill cost center name
             });
            const client = contacts.find(c => c.id === proposalForProject.clientId);
            setClientName(client?.name || '');
            setShowNewClientForm(false);
            setGenerateFirstInvoice(true);
        }
        else {
            setFormData({ ...defaultProject, company: selectedCompany, budget: [], stages: [] });
            setClientName('');
            setShowNewClientForm(false);
            setGenerateFirstInvoice(false);
        }
    }, [projectToEdit, proposalForProject, isOpen, selectedCompany, contacts]);
    
    // Auto-update cost center name when project name changes for NEW projects
    useEffect(() => {
        if (!projectToEdit) { // Only for new projects
            const suggestedName = formData.name ? `Proj. ${formData.name}` : '';
            setFormData(prev => ({
                ...prev,
                costCenterName: suggestedName
            }));
        }
    }, [formData.name, projectToEdit]);


    const totalBudget = useMemo(() => {
        return formData.budget.reduce((sum, item) => sum + item.cost, 0);
    }, [formData.budget]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Budget Handlers
    const addBudgetItem = () => {
        const newItem: BudgetItem = { id: `b${Date.now()}`, description: '', type: 'Insumos', cost: 0 };
        setFormData(prev => ({ ...prev, budget: [...(prev.budget || []), newItem] }));
    };
    const removeBudgetItem = (id: string) => {
        setFormData(prev => ({ ...prev, budget: prev.budget.filter(item => item.id !== id) }));
    };
    const handleBudgetChange = (id: string, field: keyof Omit<BudgetItem, 'id'>, value: string) => {
        setFormData(prev => ({
            ...prev,
            budget: prev.budget.map(item =>
                item.id === id ? { ...item, [field]: field === 'cost' ? parseFormattedCurrency(value) : value } : item
            )
        }));
    };

    // Stages Handlers
    const addStage = () => {
        const newStage: ProjectStage = { id: `s${Date.now()}`, name: '', dueDate: new Date().toISOString().split('T')[0], status: 'Pendente', deliverables: [] };
        setFormData(prev => ({ ...prev, stages: [...(prev.stages || []), newStage] }));
    };
    const removeStage = (id: string) => {
        setFormData(prev => ({ ...prev, stages: prev.stages.filter(stage => stage.id !== id) }));
    };
    const handleStageChange = (id: string, field: keyof Omit<ProjectStage, 'id' | 'deliverables'>, value: string) => {
        setFormData(prev => {
            const newStages = prev.stages.map(stage =>
                stage.id === id ? { ...stage, [field]: value } : stage
            );

            let newProjectStatus = prev.status;
            const allStagesCompleted = newStages.length > 0 && newStages.every(s => s.status === 'Concluído');

            if (allStagesCompleted) {
                newProjectStatus = 'Concluído';
            } else {
                if (prev.status === 'Concluído' && newStages.length > 0) {
                    newProjectStatus = 'Em Execução';
                }
            }

            return {
                ...prev,
                stages: newStages,
                status: newProjectStatus,
            };
        });
    };
    
    const handleAttachmentChangeForStage = async (stageId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            try {
                const filePromises = Array.from(files).map(file => {
                    return new Promise<{ fileName: string; fileType: string; fileContent: string; }>((resolve, reject) => {
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
                
                setFormData(prev => ({
                    ...prev,
                    stages: prev.stages.map(stage => 
                        stage.id === stageId 
                            ? { ...stage, deliverables: [...(stage.deliverables || []), ...newAttachments] }
                            : stage
                    )
                }));
            } catch (error) {
                console.error("Erro ao ler anexos:", error);
                alert("Ocorreu um erro ao ler um dos arquivos.");
            } finally {
                event.target.value = ''; // Reset file input
            }
        }
    };

    const handleRemoveAttachmentForStage = (stageId: string, fileNameToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            stages: prev.stages.map(stage => 
                stage.id === stageId 
                    ? { ...stage, deliverables: stage.deliverables?.filter(att => att.fileName !== fileNameToRemove) }
                    : stage
            )
        }));
    };
    
    const handleViewAttachment = (attachment: NonNullable<ProjectStage['deliverables']>[0]) => {
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

    const handleDownloadAttachment = (attachment: NonNullable<ProjectStage['deliverables']>[0]) => {
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

    // Client Handlers
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
            setNewClientData(prev => ({ ...prev, name: value }));
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
        onSave(formData as Project, generateFirstInvoice);
        onClose();
    };

    if (!isOpen) return null;
    
    const companyContacts = contacts.filter(c => c.company === selectedCompany && c.type === 'Cliente');

    return (
        <>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" role="dialog">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-5xl my-8" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {projectToEdit ? 'Editar Projeto' : 'Adicionar Novo Projeto'}
                        </h2>
                    </div>
                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                         <fieldset className="space-y-4">
                            <legend className="text-lg font-semibold text-slate-800 dark:text-slate-200">Informações Gerais</legend>
                            <div className="flex items-start gap-4">
                                {selectedClient && (
                                    <div className="pt-1">
                                        <label className="block text-sm font-medium text-transparent dark:text-transparent select-none">Avatar</label>
                                        <IconDisplay iconName={selectedClient.icon} className="w-10 h-10 flex-shrink-0" />
                                    </div>
                                )}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome do Projeto</label>
                                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputStyle} />
                                    </div>
                                    <div>
                                        <label htmlFor="clientName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cliente</label>
                                        <input type="text" id="clientName" value={clientName} onChange={handleClientChange} list="clients-list" required className={inputStyle} placeholder="Digite o nome do cliente" />
                                        <datalist id="clients-list">
                                            {companyContacts.map(c => <option key={c.id} value={c.name} />)}
                                        </datalist>
                                    </div>
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
                                    <button type="button" onClick={handleSaveNewClient} className="mt-3 bg-indigo-600 text-white font-semibold px-4 py-1.5 rounded-md text-sm hover:bg-indigo-700">
                                        Salvar Cliente
                                    </button>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Projeto</label>
                                    <select name="type" id="type" value={formData.type} onChange={handleChange} className={selectStyle}>
                                        <option>Residencial</option>
                                        <option>Comercial</option>
                                        <option>Industrial</option>
                                    </select>
                                </div>
                                 <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                                    <select name="status" id="status" value={formData.status} onChange={handleChange} className={selectStyle}>
                                        <option>Planejamento</option>
                                        <option>Em Execução</option>
                                        <option>Concluído</option>
                                    </select>
                                </div>
                                 <div>
                                    <label htmlFor="costCenterName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Centro de Custo Vinculado</label>
                                    <select 
                                        name="costCenterName" 
                                        id="costCenterName" 
                                        value={formData.costCenterName} 
                                        onChange={handleChange}
                                        className={selectStyle}
                                    >
                                        {!companyCostCenters.some(cc => cc.name === `Proj. ${formData.name}`) && formData.name && (
                                            <option value={`Proj. ${formData.name}`}>
                                                {`Criar novo: "Proj. ${formData.name}"`}
                                            </option>
                                        )}
                                        {companyCostCenters.map(cc => (
                                            <option key={cc.id} value={cc.name}>{cc.name}</option>
                                        ))}
                                    </select>
                                     <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">
                                        { !companyCostCenters.some(cc => cc.name === formData.costCenterName)
                                            ? 'Um novo centro de custo será criado com este projeto.'
                                            : 'Este projeto será associado ao centro de custo existente.'
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="totalArea" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Área Total (m²)</label>
                                    <input type="number" name="totalArea" id="totalArea" value={formData.totalArea || ''} onChange={handleChange} className={inputStyle} />
                                </div>
                                <div>
                                    <label htmlFor="builtArea" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Área Construída (m²)</label>
                                    <input type="number" name="builtArea" id="builtArea" value={formData.builtArea || ''} onChange={handleChange} className={inputStyle} />
                                </div>
                            </div>
                             <div>
                                <label htmlFor="allocationMethod" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Método de Rateio de Custos</label>
                                <select name="allocationMethod" id="allocationMethod" value={formData.allocationMethod} onChange={handleChange} className={selectStyle}>
                                    <option value="none">Não Ratear</option>
                                    <option value="totalArea">Por Área Total (m²)</option>
                                    <option value="builtArea">Por Área Construída (m²)</option>
                                    <option value="stages">Por Etapas do Projeto</option>
                                </select>
                            </div>
                        </fieldset>

                        <fieldset className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <legend className="text-lg font-semibold text-slate-800 dark:text-slate-200">Orçamento do Projeto</legend>
                             <div className="space-y-3">
                                {formData.budget.map((item, index) => (
                                    <div key={item.id} className="grid grid-cols-12 gap-x-3 items-end">
                                        <div className="col-span-5">
                                            <label htmlFor={`b-desc-${index}`} className="block text-xs font-medium text-slate-700 dark:text-slate-300">Descrição do Item</label>
                                            <input type="text" id={`b-desc-${index}`} value={item.description} onChange={e => handleBudgetChange(item.id, 'description', e.target.value)} className={inputStyle} />
                                        </div>
                                        <div className="col-span-3">
                                            <label htmlFor={`b-type-${index}`} className="block text-xs font-medium text-slate-700 dark:text-slate-300">Tipo</label>
                                            <select id={`b-type-${index}`} value={item.type} onChange={e => handleBudgetChange(item.id, 'type', e.target.value)} className={selectStyle}>
                                                <option>Serviços</option>
                                                <option>Insumos</option>
                                                <option>Mão de Obra</option>
                                                <option>Terceiros</option>
                                                <option>Taxas</option>
                                            </select>
                                        </div>
                                        <div className="col-span-3">
                                            <label htmlFor={`b-cost-${index}`} className="block text-xs font-medium text-slate-700 dark:text-slate-300">Custo (R$)</label>
                                            <input type="text" inputMode="decimal" id={`b-cost-${index}`} value={item.cost > 0 ? item.cost.toLocaleString('pt-BR', {minimumFractionDigits: 2}) : ''} onChange={e => handleBudgetChange(item.id, 'cost', formatCurrencyOnInput(e.target.value))} className={inputStyle} />
                                        </div>
                                        <div className="col-span-1">
                                            <button type="button" onClick={() => removeBudgetItem(item.id)} className="h-10 w-10 flex items-center justify-center text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md transition-colors">
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                                 <button type="button" onClick={addBudgetItem} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
                                    <PlusIcon /> Adicionar Item ao Orçamento
                                </button>
                                <div>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Custo Total do Orçamento: </span>
                                    <span className="font-bold text-lg text-slate-800 dark:text-slate-200">{totalBudget.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</span>
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <legend className="text-lg font-semibold text-slate-800 dark:text-slate-200">Etapas e Entregáveis</legend>
                             <div className="space-y-4">
                                {formData.stages.map((stage, index) => (
                                    <div key={stage.id} className="grid grid-cols-12 gap-x-3 items-start p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
                                        <div className="col-span-11 grid grid-cols-11 gap-x-3">
                                            <div className="col-span-4">
                                                <label htmlFor={`s-name-${index}`} className="block text-xs font-medium text-slate-700 dark:text-slate-300">Nome da Etapa</label>
                                                <input type="text" id={`s-name-${index}`} value={stage.name} onChange={e => handleStageChange(stage.id, 'name', e.target.value)} className={inputStyle} />
                                            </div>
                                            <div className="col-span-3">
                                                <label htmlFor={`s-date-${index}`} className="block text-xs font-medium text-slate-700 dark:text-slate-300">Prazo Final</label>
                                                <input type="date" id={`s-date-${index}`} value={stage.dueDate} onChange={e => handleStageChange(stage.id, 'dueDate', e.target.value)} className={inputStyle} />
                                            </div>
                                            <div className="col-span-4">
                                                <label htmlFor={`s-status-${index}`} className="block text-xs font-medium text-slate-700 dark:text-slate-300">Status</label>
                                                <select id={`s-status-${index}`} value={stage.status} onChange={e => handleStageChange(stage.id, 'status', e.target.value)} className={selectStyle}>
                                                    <option>Pendente</option>
                                                    <option>Aprovado Cliente</option>
                                                    <option>Aprovado Órgão Público</option>
                                                    <option>Concluído</option>
                                                </select>
                                            </div>
                                            <div className="col-span-11 mt-2">
                                                <label htmlFor={`s-deliverables-upload-${stage.id}`} className="block text-xs font-medium text-slate-700 dark:text-slate-300">Adicionar Entregáveis (PDF, Imagem, Doc)</label>
                                                <input 
                                                    type="file" 
                                                    id={`s-deliverables-upload-${stage.id}`}
                                                    onChange={(e) => handleAttachmentChangeForStage(stage.id, e)} 
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                    multiple
                                                    className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/50 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900"
                                                />
                                                {stage.deliverables && stage.deliverables.length > 0 && (
                                                    <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                                                        {stage.deliverables.map((att, attIndex) => (
                                                            <div key={attIndex} className="flex items-center justify-between p-1.5 bg-slate-100 dark:bg-slate-800 rounded-md text-xs">
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
                                                                    <button type="button" onClick={() => handleRemoveAttachmentForStage(stage.id, att.fileName)} title="Remover" className="p-1 text-red-500 hover:text-red-700">
                                                                        <TrashIcon />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-span-1 flex items-center justify-end h-full pt-5">
                                            <button type="button" onClick={() => removeStage(stage.id)} className="h-10 w-10 flex items-center justify-center text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md transition-colors">
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                                 <button type="button" onClick={addStage} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
                                    <PlusIcon /> Adicionar Etapa
                                </button>
                            </div>
                        </fieldset>
                        {proposalForProject && !projectToEdit && (
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                                <label className="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        checked={generateFirstInvoice} 
                                        onChange={e => setGenerateFirstInvoice(e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <span className="ml-2 text-slate-700 dark:text-slate-300">
                                        Gerar primeira fatura com o valor total da proposta?
                                    </span>
                                </label>
                            </div>
                        )}
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
                            Salvar Projeto
                        </button>
                    </div>
                </form>
            </div>
        </div>
        {viewingAttachment && (
            <AttachmentPreviewModal
                attachment={viewingAttachment}
                onClose={() => setViewingAttachment(null)}
            />
        )}
        </>
    );
};

const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;
const TrashIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const FileIcon = () => <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;
const ViewIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>;
const DownloadIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>;
const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;