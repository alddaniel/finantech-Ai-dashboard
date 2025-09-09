

import React, { useState, useEffect } from 'react';
import type { Company, Address, PlanType, ModuleType } from '../types';

interface CompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (company: Company) => void;
    companyToEdit: Company | null;
    companies: Company[];
    isSuperAdmin: boolean;
}

const isValidDocument = (doc: string): boolean => {
    // This function will validate both CPF and CNPJ, but in this context, only CNPJ is relevant.
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

const formatCnpj = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned
        .slice(0, 14)
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};

const defaultAddress: Address = { street: '', number: '', neighborhood: '', city: '', state: '', zip: '' };
const defaultCompany: Omit<Company, 'id'> = {
    name: '',
    cnpj: '',
    address: defaultAddress,
    plan: 'Basic',
    enabledModules: [],
};

const inputStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";
const selectStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 pl-3 pr-10 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm disabled:opacity-50 disabled:bg-slate-200 dark:disabled:bg-slate-800/50";


export const CompanyModal: React.FC<CompanyModalProps> = ({ isOpen, onClose, onSave, companyToEdit, companies, isSuperAdmin }) => {
    const [formData, setFormData] = useState<Omit<Company, 'id'> & { id?: string }>(defaultCompany);
    const [error, setError] = useState('');
    const [cnpjError, setCnpjError] = useState('');

    useEffect(() => {
        setError('');
        setCnpjError('');
        if (companyToEdit) {
            setFormData({
                ...companyToEdit,
                plan: companyToEdit.plan || 'Basic',
                enabledModules: companyToEdit.enabledModules || [],
            });
        } else {
            setFormData(defaultCompany);
        }
    }, [companyToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

     const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatCnpj(e.target.value);
        setFormData(prev => ({ ...prev, cnpj: formattedValue }));
        if (cnpjError) {
            setCnpjError('');
        }
    };

    const handleCnpjBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const doc = e.target.value;
        if (doc && !isValidDocument(doc)) {
            setCnpjError('CNPJ inválido.');
        } else {
            setCnpjError('');
        }
    };
    
    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [name]: value,
            }
        }));
    };
    
    const handleModuleChange = (module: ModuleType) => {
        setFormData(prev => {
            const currentModules = prev.enabledModules || [];
            const newModules = currentModules.includes(module)
                ? currentModules.filter(m => m !== module)
                : [...currentModules, module];
            return { ...prev, enabledModules: newModules };
        });
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (formData.cnpj && !isValidDocument(formData.cnpj)) {
            setCnpjError('CNPJ inválido.');
            return;
        }

        const processedName = formData.name.trim();
        const isDuplicate = companies.some(
            c => c.name.toLowerCase() === processedName.toLowerCase() && c.id !== formData.id
        );

        if (isDuplicate) {
            setError('Já existe uma empresa com este nome.');
            return;
        }

        // Trim all text inputs and standardize state abbreviation
        const processedData = {
            ...formData,
            name: processedName,
            cnpj: formData.cnpj.trim(),
            address: {
                ...formData.address,
                street: formData.address.street.trim(),
                number: formData.address.number.trim(),
                neighborhood: formData.address.neighborhood.trim(),
                city: formData.address.city.trim(),
                state: formData.address.state.trim().toUpperCase(),
                zip: formData.address.zip.trim(),
            },
        };

        onSave(processedData as Company);
        onClose();
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" aria-modal="true" role="dialog">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-2xl my-8" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {companyToEdit ? 'Editar Empresa' : 'Adicionar Nova Empresa'}
                        </h2>
                    </div>
                    <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome da Empresa</label>
                                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputStyle} />
                                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                            </div>
                            <div>
                                <label htmlFor="cnpj" className="block text-sm font-medium text-slate-700 dark:text-slate-300">CNPJ</label>
                                <input type="text" name="cnpj" id="cnpj" value={formData.cnpj} onChange={handleCnpjChange} onBlur={handleCnpjBlur} required className={inputStyle} />
                                {cnpjError && <p className="mt-2 text-sm text-red-600">{cnpjError}</p>}
                            </div>
                        </div>
                        
                        <fieldset className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                             <legend className="text-sm font-semibold text-slate-600 dark:text-slate-400">Endereço</legend>
                             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                 <div className="md:col-span-2">
                                     <label htmlFor="street" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Rua / Logradouro</label>
                                     <input type="text" name="street" id="street" value={formData.address.street} onChange={handleAddressChange} required className={inputStyle} />
                                 </div>
                                  <div>
                                     <label htmlFor="number" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Número</label>
                                     <input type="text" name="number" id="number" value={formData.address.number} onChange={handleAddressChange} required className={inputStyle} />
                                 </div>
                                  <div>
                                     <label htmlFor="neighborhood" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Bairro</label>
                                     <input type="text" name="neighborhood" id="neighborhood" value={formData.address.neighborhood} onChange={handleAddressChange} required className={inputStyle} />
                                 </div>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                     <label htmlFor="city" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cidade</label>
                                     <input type="text" name="city" id="city" value={formData.address.city} onChange={handleAddressChange} required className={inputStyle} />
                                 </div>
                                  <div>
                                     <label htmlFor="state" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Estado (UF)</label>
                                     <input type="text" name="state" id="state" maxLength={2} value={formData.address.state} onChange={handleAddressChange} required className={inputStyle} />
                                 </div>
                                  <div>
                                     <label htmlFor="zip" className="block text-sm font-medium text-slate-700 dark:text-slate-300">CEP</label>
                                     <input type="text" name="zip" id="zip" value={formData.address.zip} onChange={handleAddressChange} required className={inputStyle} />
                                 </div>
                             </div>
                        </fieldset>

                         <fieldset className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                             <legend className="text-sm font-semibold text-slate-600 dark:text-slate-400">Configurações do Plano e Módulos</legend>
                              {!isSuperAdmin && (
                                <div className="bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-300 p-3 rounded-md text-sm">
                                    Apenas o Super Administrador do sistema pode alterar o plano e os módulos.
                                </div>
                             )}
                             <div>
                                <label htmlFor="plan" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Plano</label>
                                <select name="plan" id="plan" value={formData.plan} onChange={handleChange} className={selectStyle} disabled={!isSuperAdmin}>
                                    <option value="Basic">Basic</option>
                                    <option value="Pro">Pro</option>
                                    <option value="Enterprise">Enterprise</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Módulos Ativos</label>
                                <div className="mt-2 space-y-2 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                    <label className="flex items-center">
                                        <input type="checkbox" disabled={!isSuperAdmin} checked={formData.enabledModules?.includes('properties')} onChange={() => handleModuleChange('properties')} className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                                        <span className="ml-3 text-slate-700 dark:text-slate-200">Gestão de Imóveis</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="checkbox" disabled={!isSuperAdmin} checked={formData.enabledModules?.includes('projects')} onChange={() => handleModuleChange('projects')} className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                                        <span className="ml-3 text-slate-700 dark:text-slate-200">Gestão de Projetos</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="checkbox" disabled={!isSuperAdmin} checked={formData.enabledModules?.includes('fiscal')} onChange={() => handleModuleChange('fiscal')} className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                                        <span className="ml-3 text-slate-700 dark:text-slate-200">Módulo Fiscal Inteligente</span>
                                    </label>
                                     <label className="flex items-center">
                                        <input type="checkbox" disabled={!isSuperAdmin} checked={formData.enabledModules?.includes('integrations')} onChange={() => handleModuleChange('integrations')} className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                                        <span className="ml-3 text-slate-700 dark:text-slate-200">Integrações Bancárias</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="checkbox" disabled={!isSuperAdmin} checked={formData.enabledModules?.includes('ai_advisor')} onChange={() => handleModuleChange('ai_advisor')} className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                                        <span className="ml-3 text-slate-700 dark:text-slate-200">Consultor Financeiro IA</span>
                                    </label>
                                </div>
                            </div>
                        </fieldset>
                    </div>
                    <div className="px-6 py-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                        <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors">
                            Salvar Empresa
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};