

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Badge } from './ui/Badge';
import { ContactModal } from './ContactModal';
import type { Contact } from '../types';

type ContactFilter = 'all' | 'customer' | 'supplier';

interface ContactsProps {
    contacts: Contact[];
    setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
    selectedCompany: string;
}

const TabButton: React.FC<{label: string, active: boolean, onClick: () => void}> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            active
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
        }`}
    >
        {label}
    </button>
);

export const Contacts: React.FC<ContactsProps> = ({ contacts, setContacts, selectedCompany }) => {
    const [filter, setFilter] = useState<ContactFilter>('all');
    const [isModalOpen, setModalOpen] = useState(false);
    const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);

    const filteredContacts = useMemo(() => {
        const companyContacts = contacts.filter(c => c.company === selectedCompany);
        if (filter === 'customer') return companyContacts.filter(c => c.type === 'Cliente');
        if (filter === 'supplier') return companyContacts.filter(c => c.type === 'Fornecedor');
        return companyContacts;
    }, [contacts, filter, selectedCompany]);

    const handleOpenModal = (contact: Contact | null = null) => {
        setContactToEdit(contact);
        setModalOpen(true);
    };

    const handleSaveContact = (contactData: Contact) => {
        if (contactToEdit) {
            setContacts(contacts.map(c => c.id === contactData.id ? contactData : c));
        } else {
            setContacts([...contacts, { ...contactData, id: `contact${Date.now()}` }]);
        }
    };

    const handleDeleteContact = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este contato?')) {
            setContacts(contacts.filter(c => c.id !== id));
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cadastro de Contatos</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
                Gerencie seus clientes e fornecedores em um único lugar.
            </p>

            <Card className="!p-0">
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6">
                    <div className="flex items-center gap-2">
                        <TabButton label="Todos" active={filter === 'all'} onClick={() => setFilter('all')} />
                        <TabButton label="Clientes" active={filter === 'customer'} onClick={() => setFilter('customer')} />
                        <TabButton label="Fornecedores" active={filter === 'supplier'} onClick={() => setFilter('supplier')} />
                    </div>
                     <button onClick={() => handleOpenModal()} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm">
                        <PlusIcon /> Adicionar Contato
                    </button>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nome</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tipo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Documento (CNPJ/CPF)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">E-mail</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Telefone</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800/50">
                                {filteredContacts.map(contact => (
                                    <tr key={contact.id} className="even:bg-slate-50 dark:even:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{contact.name}</td>
                                        <td className="px-6 py-4">
                                            <Badge color={contact.type === 'Cliente' ? 'indigo' : 'yellow'}>{contact.type}</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{contact.document}</td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{contact.email}</td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{contact.phone}</td>
                                        <td className="px-6 py-4 text-right text-sm font-medium space-x-4 whitespace-nowrap">
                                            <button onClick={() => handleOpenModal(contact)} className="font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">Editar</button>
                                            <button onClick={() => handleDeleteContact(contact.id)} className="font-semibold text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">Excluir</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         {filteredContacts.length === 0 && (
                            <p className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum contato encontrado para esta empresa.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <ContactModal 
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSaveContact}
                contactToEdit={contactToEdit}
                selectedCompany={selectedCompany}
            />
        </div>
    );
};

const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;