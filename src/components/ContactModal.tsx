
import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Contact, Address, ContactBankDetails } from '../types';
import { CONTACT_AVATARS, COMPANY_AVATARS } from '../constants';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (contact: Contact) => void;
    contactToEdit: Contact | null;
    selectedCompany: string;
    canShowOwner: boolean;
    customAvatars: string[];
    setCustomAvatars: React.Dispatch<React.SetStateAction<string[]>>;
}

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

const defaultAddress: Address = { street: '', number: '', neighborhood: '', city: '', state: '', zip: '' };
const defaultBankDetails: ContactBankDetails = { bankName: '', agency: '', account: '', pixKey: ''};
const defaultContact: Omit<Contact, 'id' | 'company'> = {
    name: '',
    type: 'Cliente',
    document: '',
    email: '',
    phone: '',
    address: defaultAddress,
    taxRegime: 'Simples Nacional',
    bankDetails: defaultBankDetails,
    ie: '',
    icon: CONTACT_AVATARS[0],
};

const inputStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";
const selectStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 pl-3 pr-10 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";


export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, onSave, contactToEdit, selectedCompany, canShowOwner, customAvatars, setCustomAvatars }) => {
    const [formData, setFormData] = useState<Omit<Contact, 'id'> & { id?: string }>(() => ({ ...defaultContact, company: selectedCompany }));
    const [documentError, setDocumentError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isCnpj = useMemo(() => formData.document.replace(/\D/g, '').length === 14, [formData.document]);
    
    const availableAvatars = useMemo(() => {
        return isCnpj || formData.type === 'Fornecedor' ? COMPANY_AVATARS : CONTACT_AVATARS;
    }, [isCnpj, formData.type]);

    useEffect(() => {
        setDocumentError('');
        if (contactToEdit) {
            setFormData(contactToEdit);
        } else {
            setFormData({ ...defaultContact, company: selectedCompany, icon: CONTACT_AVATARS[0] });
        }
    }, [contactToEdit, isOpen, selectedCompany]);
    
    useEffect(() => {
        // Automatically switch default icon for new contacts based on document type or contact type
        if (isOpen && !contactToEdit) {
            // Check if the current icon is from the "wrong" category
            const currentIconIsPerson = CONTACT_AVATARS.includes(formData.icon || '');
            const currentIconIsCompany = COMPANY_AVATARS.includes(formData.icon || '');
            const isCustom = !currentIconIsPerson && !currentIconIsCompany;

            if (isCustom) return; // Don't change a custom uploaded icon

            if (availableAvatars === COMPANY_AVATARS && currentIconIsPerson) {
                setFormData(prev => ({ ...prev, icon: COMPANY_AVATARS[0] }));
            } else if (availableAvatars === CONTACT_AVATARS && currentIconIsCompany) {
                 setFormData(prev => ({ ...prev, icon: CONTACT_AVATARS[0] }));
            }
        }
    }, [availableAvatars, isOpen, contactToEdit, formData.icon]);

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as Contact['type'];
        setFormData(prev => {
            const newState = { ...prev, type: newType };
            if (newType === 'Proprietário' && !newState.bankDetails) {
                newState.bankDetails = { bankName: '', agency: '', account: '', pixKey: '' };
            }
            return newState;
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatDocument(e.target.value);
        setFormData(prev => ({ ...prev, document: formattedValue }));
        if (documentError) {
            setDocumentError('');
        }
    };

    const handleDocumentBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const doc = e.target.value;
        if (doc && !isValidDocument(doc)) {
            setDocumentError('CPF/CNPJ inválido.');
        } else {
            setDocumentError('');
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
    
    const handleBankDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            bankDetails: {
                ...prev.bankDetails!,
                [name]: value,
            }
        }));
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            alert('Formato de arquivo inválido. Por favor, selecione uma imagem JPG, PNG ou WEBP.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert('Arquivo muito grande. Selecione uma imagem com menos de 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            if (result) {
                setCustomAvatars(prev => [result, ...prev]);
                setFormData(prev => ({ ...prev, icon: result }));
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.document && !isValidDocument(formData.document)) {
            setDocumentError('CPF/CNPJ inválido.');
            return;
        }

        const finalData = { ...formData };
        if (finalData.type !== 'Proprietário') {
            delete finalData.bankDetails;
        }
        onSave(finalData as Contact);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" aria-modal="true" role="dialog">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-3xl my-8" onClick={e => e.stopPropagation()}>
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {contactToEdit ? 'Editar Contato' : 'Adicionar Novo Contato'}
                            </h2>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                           <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Avatar</label>
                                <div className="mt-2 space-y-4">
                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-sm flex items-center gap-2"
                                        >
                                            <UploadIcon className="w-5 h-5" />
                                            Carregar Imagem
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/png, image/jpeg, image/webp"
                                            className="hidden"
                                        />
                                    </div>
                                     {customAvatars.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Suas Imagens</h4>
                                            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                                                {customAvatars.map((url) => (
                                                    <button
                                                        key={url}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, icon: url }))}
                                                        className={`p-0.5 rounded-full transition-all duration-200 aspect-square ${
                                                            formData.icon === url
                                                                ? 'ring-2 ring-offset-2 ring-indigo-500 ring-offset-white dark:ring-offset-slate-900'
                                                                : 'hover:ring-2 hover:ring-indigo-300'
                                                        }`}
                                                        aria-label="Selecionar avatar"
                                                        aria-pressed={formData.icon === url}
                                                    >
                                                        <img src={url} alt="Opção de avatar customizado" className="w-full h-full object-cover rounded-full" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                     <div>
                                        <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Avatares Padrão</h4>
                                        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                                            {availableAvatars.map((url) => (
                                                <button
                                                    key={url}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, icon: url }))}
                                                    className={`p-0.5 rounded-full transition-all duration-200 aspect-square ${
                                                        formData.icon === url
                                                            ? 'ring-2 ring-offset-2 ring-indigo-500 ring-offset-white dark:ring-offset-slate-900'
                                                            : 'hover:ring-2 hover:ring-indigo-300'
                                                    }`}
                                                    aria-label="Selecionar avatar"
                                                    aria-pressed={formData.icon === url}
                                                >
                                                    <img src={url} alt="Opção de avatar padrão" className="w-full h-full object-cover rounded-full" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome / Razão Social</label>
                                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputStyle} />
                                </div>
                                <div>
                                    <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo</label>
                                    <select name="type" id="type" value={formData.type} onChange={handleTypeChange} className={selectStyle}>
                                        <option>Cliente</option>
                                        <option>Fornecedor</option>
                                        {canShowOwner && <option>Proprietário</option>}
                                    </select>
                                </div>
                            </div>
                            <div className={`grid grid-cols-1 ${isCnpj ? 'sm:grid-cols-3' : 'sm:grid-cols-1'} gap-4`}>
                                <div>
                                    <label htmlFor="document" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Documento (CNPJ/CPF)</label>
                                    <input type="text" name="document" id="document" value={formData.document} onChange={handleDocumentChange} onBlur={handleDocumentBlur} required className={`${inputStyle} ${documentError ? '!ring-red-500 focus:!ring-red-500' : ''}`} />
                                    {documentError && <p className="mt-2 text-sm text-red-600">{documentError}</p>}
                                </div>
                                {isCnpj && (
                                    <>
                                        <div>
                                            <label htmlFor="ie" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Inscrição Estadual</label>
                                            <input type="text" name="ie" id="ie" value={formData.ie || ''} onChange={handleChange} className={inputStyle} />
                                        </div>
                                        <div>
                                            <label htmlFor="taxRegime" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Regime Tributário</label>
                                            <select name="taxRegime" id="taxRegime" value={formData.taxRegime} onChange={handleChange} className={selectStyle}>
                                                <option>Simples Nacional</option>
                                                <option>Lucro Presumido</option>
                                                <option>Lucro Real</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">E-mail</label>
                                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className={inputStyle} />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Telefone</label>
                                    <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className={inputStyle} />
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

                            {formData.type === 'Proprietário' && (
                                <fieldset className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                    <legend className="text-sm font-semibold text-slate-600 dark:text-slate-400">Dados Bancários para Repasse</legend>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-1">
                                            <label htmlFor="bankName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Banco</label>
                                            <input type="text" name="bankName" id="bankName" value={formData.bankDetails?.bankName || ''} onChange={handleBankDetailsChange} className={inputStyle} />
                                        </div>
                                        <div className="md:col-span-1">
                                            <label htmlFor="agency" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Agência</label>
                                            <input type="text" name="agency" id="agency" value={formData.bankDetails?.agency || ''} onChange={handleBankDetailsChange} className={inputStyle} />
                                        </div>
                                        <div className="md:col-span-1">
                                            <label htmlFor="account" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Conta c/ Dígito</label>
                                            <input type="text" name="account" id="account" value={formData.bankDetails?.account || ''} onChange={handleBankDetailsChange} className={inputStyle} />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="pixKey" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Chave PIX (Opcional)</label>
                                        <input type="text" name="pixKey" id="pixKey" value={formData.bankDetails?.pixKey || ''} onChange={handleBankDetailsChange} className={inputStyle} />
                                    </div>
                                </fieldset>
                            )}
                        </div>
                        <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" disabled={!!documentError} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed">
                                Salvar Contato
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

const UploadIcon = ({className}: {className?: string}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>;
