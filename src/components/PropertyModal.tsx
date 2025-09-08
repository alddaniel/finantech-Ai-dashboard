import React, { useState, useEffect, useRef } from 'react';
import type { Property, Address, Contact, AdjustmentIndex } from '../types';
import { PROPERTY_AVATARS } from '../constants';
import { IconDisplay } from './ui/IconComponents';

interface PropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (property: Property) => void;
    propertyToEdit: Property | null;
    contacts: Contact[];
    selectedCompany: string;
    adjustmentIndexes: AdjustmentIndex[];
    customAvatars: string[];
    setCustomAvatars: React.Dispatch<React.SetStateAction<string[]>>;
}

const defaultAddress: Address = { street: '', number: '', neighborhood: '', city: '', state: '', zip: '' };
const defaultProperty: Omit<Property, 'id' | 'company'> = {
    name: '',
    address: defaultAddress,
    type: 'Apartamento',
    status: 'Disponível',
    ownerId: '',
    iptuAmount: 0,
    condoAmount: 0,
    iptuDueDate: 10,
    condoDueDate: 5,
    icon: PROPERTY_AVATARS[0],
};

const inputStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";
const selectStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 pl-3 pr-10 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";

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

export const PropertyModal: React.FC<PropertyModalProps> = ({ isOpen, onClose, onSave, propertyToEdit, contacts, selectedCompany, adjustmentIndexes, customAvatars, setCustomAvatars }) => {
    const [formData, setFormData] = useState<Omit<Property, 'id'> & { id?: string }>(() => ({ ...defaultProperty, company: selectedCompany }));
    const [rentAmountString, setRentAmountString] = useState('');
    const [salePriceString, setSalePriceString] = useState('');
    const [iptuAmountString, setIptuAmountString] = useState('');
    const [condoAmountString, setCondoAmountString] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (propertyToEdit) {
            const initialData = {
                ...defaultProperty,
                ...propertyToEdit,
                rentalDetails: propertyToEdit.rentalDetails || { tenantId: '', rentAmount: 0, contractStart: '', contractEnd: '', paymentDay: 1, adjustmentIndexId: '' },
                saleDetails: propertyToEdit.saleDetails || { price: 0 }
            };
            setFormData(initialData);
            setRentAmountString(propertyToEdit.rentalDetails?.rentAmount ? propertyToEdit.rentalDetails.rentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '');
            setSalePriceString(propertyToEdit.saleDetails?.price ? propertyToEdit.saleDetails.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '');
            setIptuAmountString(propertyToEdit.iptuAmount ? propertyToEdit.iptuAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '');
            setCondoAmountString(propertyToEdit.condoAmount ? propertyToEdit.condoAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '');
        } else {
            setFormData({ ...defaultProperty, company: selectedCompany });
            setRentAmountString('');
            setSalePriceString('');
            setIptuAmountString('');
            setCondoAmountString('');
        }
    }, [propertyToEdit, isOpen, selectedCompany]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            if (name === 'status') {
                if (value === 'Alugado' && !newState.rentalDetails) {
                    newState.rentalDetails = { tenantId: '', rentAmount: 0, contractStart: '', contractEnd: '', paymentDay: 1 };
                } else if (value !== 'Alugado') {
                    setRentAmountString('');
                }
                
                if (value === 'À Venda' && !newState.saleDetails) {
                    newState.saleDetails = { price: 0 };
                } else if (value !== 'À Venda') {
                    setSalePriceString('');
                }
            }
            return newState;
        });
    };
    
    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            address: { ...prev.address, [name]: value, }
        }));
    };

    const handleRentalDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            rentalDetails: { ...prev.rentalDetails!, [name]: value }
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
        const finalData = {
            ...formData,
            rentalDetails: formData.rentalDetails ? {
                ...formData.rentalDetails,
                rentAmount: parseFormattedCurrency(rentAmountString)
            } : undefined,
            saleDetails: formData.saleDetails ? {
                ...formData.saleDetails,
                price: parseFormattedCurrency(salePriceString)
            } : undefined,
            iptuAmount: parseFormattedCurrency(iptuAmountString),
            condoAmount: parseFormattedCurrency(condoAmountString),
        }
        onSave(finalData as Property);
        onClose();
    };

    if (!isOpen) return null;
    
    const companyContacts = contacts.filter(c => c.company === selectedCompany);
    const companyIndexes = adjustmentIndexes.filter(i => i.company === selectedCompany);

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" role="dialog">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-5xl my-8" onClick={e => e.stopPropagation()}>
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {propertyToEdit ? 'Editar Imóvel' : 'Adicionar Novo Imóvel'}
                            </h2>
                        </div>
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            <fieldset className="space-y-4">
                                <legend className="text-lg font-semibold text-slate-800 dark:text-slate-200">Informações Gerais</legend>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Imagem do Imóvel</label>
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
                                                            className={`p-0.5 rounded-lg transition-all duration-200 aspect-square ${
                                                                formData.icon === url
                                                                    ? 'ring-2 ring-offset-2 ring-indigo-500 ring-offset-white dark:ring-offset-slate-900'
                                                                    : 'hover:ring-2 hover:ring-indigo-300'
                                                            }`}
                                                            aria-label="Selecionar imagem"
                                                            aria-pressed={formData.icon === url}
                                                        >
                                                            <img src={url} alt="Opção de imagem customizada" className="w-full h-full object-cover rounded-lg" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Imagens Padrão</h4>
                                            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                                                {PROPERTY_AVATARS.map((url) => (
                                                    <button
                                                        key={url}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, icon: url }))}
                                                        className={`p-0.5 rounded-lg transition-all duration-200 aspect-square ${
                                                            formData.icon === url
                                                                ? 'ring-2 ring-offset-2 ring-indigo-500 ring-offset-white dark:ring-offset-slate-900'
                                                                : 'hover:ring-2 hover:ring-indigo-300'
                                                        }`}
                                                        aria-label="Selecionar imagem"
                                                        aria-pressed={formData.icon === url}
                                                    >
                                                        <img src={url} alt="Opção de imagem padrão" className="w-full h-full object-cover rounded-lg" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome de Identificação</label>
                                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputStyle} placeholder="Ex: Apto 101, Ed. Central" />
                                    </div>
                                    <div>
                                        <label htmlFor="ownerId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Proprietário</label>
                                        <select name="ownerId" id="ownerId" value={formData.ownerId} onChange={handleChange} required className={selectStyle}>
                                            <option value="">Selecione um contato</option>
                                            {companyContacts.filter(c => c.type === 'Proprietário').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Imóvel</label>
                                        <select name="type" id="type" value={formData.type} onChange={handleChange} className={selectStyle}>
                                            <option>Apartamento</option>
                                            <option>Casa</option>
                                            <option>Terreno</option>
                                            <option>Comercial</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                                        <select name="status" id="status" value={formData.status} onChange={handleChange} className={selectStyle}>
                                            <option>Disponível</option>
                                            <option>Alugado</option>
                                            <option>À Venda</option>
                                            <option>Vendido</option>
                                        </select>
                                    </div>
                                </div>
                            </fieldset>

                            <fieldset className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <legend className="text-lg font-semibold text-slate-800 dark:text-slate-200">Endereço do Imóvel</legend>
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
                                <legend className="text-lg font-semibold text-slate-800 dark:text-slate-200">Despesas Fixas</legend>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="condoAmount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Condomínio (R$)</label>
                                        <input type="text" inputMode="decimal" id="condoAmount" value={condoAmountString} onChange={e => setCondoAmountString(formatCurrencyOnInput(e.target.value))} className={inputStyle} placeholder="0,00" />
                                    </div>
                                    <div>
                                        <label htmlFor="condoDueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Dia Venc. Condomínio</label>
                                        <input type="number" min="1" max="31" name="condoDueDate" id="condoDueDate" value={formData.condoDueDate || ''} onChange={handleChange} className={inputStyle} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="iptuAmount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">IPTU (R$)</label>
                                        <input type="text" inputMode="decimal" id="iptuAmount" value={iptuAmountString} onChange={e => setIptuAmountString(formatCurrencyOnInput(e.target.value))} className={inputStyle} placeholder="0,00" />
                                    </div>
                                    <div>
                                        <label htmlFor="iptuDueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Dia Venc. IPTU</label>
                                        <input type="number" min="1" max="31" name="iptuDueDate" id="iptuDueDate" value={formData.iptuDueDate || ''} onChange={handleChange} className={inputStyle} />
                                    </div>
                                </div>
                            </fieldset>

                            {formData.status === 'Alugado' && (
                                <fieldset className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                    <legend className="text-lg font-semibold text-slate-800 dark:text-slate-200">Detalhes do Aluguel</legend>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="md:col-span-2">
                                            <label htmlFor="tenantId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Inquilino</label>
                                            <select name="tenantId" id="tenantId" value={formData.rentalDetails?.tenantId || ''} onChange={handleRentalDetailsChange} required className={selectStyle}>
                                                <option value="">Selecione um inquilino</option>
                                                {companyContacts.filter(c => c.type === 'Cliente').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="rentAmount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Valor do Aluguel (R$)</label>
                                            <input type="text" inputMode="decimal" id="rentAmount" value={rentAmountString} onChange={e => setRentAmountString(formatCurrencyOnInput(e.target.value))} required className={inputStyle} placeholder="0,00" />
                                        </div>
                                        <div>
                                            <label htmlFor="paymentDay" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Dia do Vencimento</label>
                                            <input type="number" min="1" max="31" name="paymentDay" id="paymentDay" value={formData.rentalDetails?.paymentDay || ''} onChange={handleRentalDetailsChange} required className={inputStyle} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label htmlFor="contractStart" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Início do Contrato</label>
                                            <input type="date" name="contractStart" id="contractStart" value={formData.rentalDetails?.contractStart || ''} onChange={handleRentalDetailsChange} required className={inputStyle} />
                                        </div>
                                        <div>
                                            <label htmlFor="contractEnd" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fim do Contrato</label>
                                            <input type="date" name="contractEnd" id="contractEnd" value={formData.rentalDetails?.contractEnd || ''} onChange={handleRentalDetailsChange} required className={inputStyle} />
                                        </div>
                                        <div>
                                            <label htmlFor="adjustmentIndexId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Índice de Reajuste</label>
                                            <select name="adjustmentIndexId" id="adjustmentIndexId" value={formData.rentalDetails?.adjustmentIndexId || ''} onChange={handleRentalDetailsChange} className={selectStyle}>
                                                <option value="">Nenhum</option>
                                                {companyIndexes.map(idx => <option key={idx.id} value={idx.id}>{idx.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </fieldset>
                            )}
                            
                            {formData.status === 'À Venda' && (
                                <fieldset className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                    <legend className="text-lg font-semibold text-slate-800 dark:text-slate-200">Detalhes da Venda</legend>
                                    <div>
                                        <label htmlFor="price" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Preço de Venda (R$)</label>
                                        <input type="text" inputMode="decimal" id="price" value={salePriceString} onChange={e => setSalePriceString(formatCurrencyOnInput(e.target.value))} required className={`${inputStyle} md:w-1/3`} placeholder="0,00"/>
                                    </div>
                                </fieldset>
                            )}

                        </div>
                        <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
                                Salvar Imóvel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

const UploadIcon = ({className}: {className?: string}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>;