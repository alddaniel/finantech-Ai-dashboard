
import React, { useState, useEffect } from 'react';
import type { Contact } from '../types';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (contact: Contact) => void;
    contactToEdit: Contact | null;
    selectedCompany: string;
}

const defaultContact: Omit<Contact, 'id' | 'company'> = {
    name: '',
    type: 'Cliente',
    document: '',
    email: '',
    phone: '',
};

const inputStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";
const selectStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 pl-3 pr-10 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";


export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, onSave, contactToEdit, selectedCompany }) => {
    const [formData, setFormData] = useState<Omit<Contact, 'id'> & { id?: string }>(() => ({ ...defaultContact, company: selectedCompany }));

    useEffect(() => {
        if (contactToEdit) {
            setFormData(contactToEdit);
        } else {
            setFormData({ ...defaultContact, company: selectedCompany });
        }
    }, [contactToEdit, isOpen, selectedCompany]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Contact);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {contactToEdit ? 'Editar Contato' : 'Adicionar Novo Contato'}
                        </h2>
                    </div>
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome / Razão Social</label>
                                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputStyle} />
                            </div>
                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo</label>
                                <select name="type" id="type" value={formData.type} onChange={handleChange} className={selectStyle}>
                                    <option>Cliente</option>
                                    <option>Fornecedor</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="document" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Documento (CNPJ/CPF)</label>
                            <input type="text" name="document" id="document" value={formData.document} onChange={handleChange} required className={inputStyle} />
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
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
                            Salvar Contato
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
