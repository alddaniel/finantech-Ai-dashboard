import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Badge } from './ui/Badge';
import { ContactModal } from './ContactModal';
import { ConfirmationModal } from './ConfirmationModal';
import type { Contact, Company, Transaction, ToastMessage } from '../types';
import { IconDisplay } from './ui/IconComponents';
import * as apiService from '../services/apiService';

type ContactFilter = 'all' | 'customer' | 'supplier' | 'owner';

interface ContactsProps {
    contacts: Contact[];
    setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
    selectedCompany: string;
    company?: Company;
    customAvatars: string[];
    setCustomAvatars: React.Dispatch<React.SetStateAction<string[]>>;
    payables: Transaction[];
    receivables: Transaction[];
    addToast: (toast: Omit<ToastMessage, 'id'>) => void;
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

export const Contacts: React.FC<ContactsProps> = ({ contacts, setContacts, selectedCompany, company, customAvatars, setCustomAvatars, payables, receivables, addToast }) => {
    const [filter, setFilter] = useState<ContactFilter>('all');
    const [isModalOpen, setModalOpen] = useState(false);
    const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
    const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);


    const canShowOwner = useMemo(() => company?.enabledModules.includes('properties'), [company]);

    const filteredContacts = useMemo(() => {
        const companyContacts = contacts.filter(c => c.company === selectedCompany);
        if (filter === 'customer') return companyContacts.filter(c => c.type === 'Cliente');
        if (filter === 'supplier') return companyContacts.filter(c => c.type === 'Fornecedor');
        if (filter === 'owner' && canShowOwner) return companyContacts.filter(c => c.type === 'Proprietário');
        return companyContacts;
    }, [contacts, filter, selectedCompany, canShowOwner]);

    const handleOpenModal = (contact: Contact | null = null) => {
        setContactToEdit(contact);
        setModalOpen(true);
    };

    const handleSaveContact = async (contactData: Contact) => {
        let updatedContacts;
        if (contactToEdit) {
            updatedContacts = contacts.map(c => c.id === contactData.id ? contactData : c);
        } else {
            updatedContacts = [...contacts, { ...contactData, id: `contact${Date.now()}` }];
        }
        setContacts(updatedContacts);
        await apiService.saveContacts(updatedContacts);
    };
    
    const handleDeleteRequest = (contact: Contact) => {
        const linkedPayables = payables.filter(p => p.contactId === contact.id).length;
        const linkedReceivables = receivables.filter(r => r.contactId === contact.id).length;
        const totalLinks = linkedPayables + linkedReceivables;

        if (totalLinks > 0) {
            const contactType = contact?.type.toLowerCase();
            addToast({
                type: 'warning',
                title: `Exclusão Bloqueada`,
                description: `Não é possível excluir este ${contactType}. Ele está vinculado a ${totalLinks} transação(ões) financeira(s).`
            });
            return;
        }
        setContactToDelete(contact);
    };

    const handleConfirmDelete = async () => {
        if (!contactToDelete) return;
        setIsDeleting(true);
        try {
            const updatedContacts = contacts.filter(c => c.id !== contactToDelete.id);
            setContacts(updatedContacts);
            await apiService.saveContacts(updatedContacts);
            addToast({
                type: 'success',
                title: 'Contato Excluído!',
                description: `O contato "${contactToDelete.name}" foi removido.`
            });
        } catch (error) {
            addToast({ type: 'warning', title: 'Erro', description: 'Não foi possível excluir o contato.'});
            // Revert state if API call fails
            setContacts(contacts);
        } finally {
            setIsDeleting(false);
            setContactToDelete(null);
        }
    };


    const handleCopyBankDetails = (contact: Contact) => {
        if (!contact.bankDetails) return;
        const details = [
            `Beneficiário: ${contact.name}`,
            `Documento: ${contact.document}`,
            `Banco: ${contact.bankDetails.bankName}`,
            `Agência: ${contact.bankDetails.agency}`,
            `Conta: ${contact.bankDetails.account}`,
        ];
        if (contact.bankDetails.pixKey) {
            details.push(`PIX: ${contact.bankDetails.pixKey}`);
        }
        const textToCopy = details.join('\n');
        navigator.clipboard.writeText(textToCopy).then(() => {
            addToast({type: 'success', title: 'Copiado!', description: 'Dados bancários copiados para a área de transferência.'});
        }, (err) => {
            console.error('Falha ao copiar dados bancários: ', err);
            addToast({type: 'warning', title: 'Falha ao copiar', description: 'Não foi possível copiar os dados.'});
        });
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cadastro de Contatos</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
                Gerencie seus clientes, fornecedores e proprietários em um único lugar.
            </p>

            <Card className="!p-0">
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6">
                    <div className="flex items-center gap-2 flex-wrap">
                        <TabButton label="Todos" active={filter === 'all'} onClick={() => setFilter('all')} />
                        <TabButton label="Clientes" active={filter === 'customer'} onClick={() => setFilter('customer')} />
                        <TabButton label="Fornecedores" active={filter === 'supplier'} onClick={() => setFilter('supplier')} />
                        {canShowOwner && <TabButton label="Proprietários" active={filter === 'owner'} onClick={() => setFilter('owner')} />}
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nome / Tipo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Documento / Regime</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Localização</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Contato</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800/50">
                                {filteredContacts.map(contact => {
                                    const hasBankDetails = contact.bankDetails && contact.bankDetails.bankName && contact.bankDetails.agency && contact.bankDetails.account;
                                    return (
                                        <tr 
                                            key={contact.id} 
                                            className="even:bg-slate-50 dark:even:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">{contact.name}</div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge color={contact.type === 'Cliente' ? 'indigo' : contact.type === 'Fornecedor' ? 'yellow' : 'blue'}>{contact.type}</Badge>
                                                            {contact.type === 'Proprietário' && contact.bankDetails?.bankName && (
                                                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                                    <BankIcon /> {contact.bankDetails.bankName}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0 ml-4">
                                                        <IconDisplay iconName={contact.icon} className="w-10 h-10" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                 <div className="text-gray-800 dark:text-gray-200">{contact.document}</div>
                                                 <div className="text-gray-500 dark:text-gray-400">{contact.taxRegime}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {`${contact.address.city} - ${contact.address.state.toUpperCase()}`}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                 <div className="text-gray-800 dark:text-gray-200">{contact.email}</div>
                                                 <div className="text-gray-500 dark:text-gray-400">{contact.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                                <button onClick={() => handleOpenModal(contact)} className="font-semibold text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                                                    Editar
                                                </button>
                                                <button onClick={() => handleDeleteRequest(contact)} className="font-semibold text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                                    Excluir
                                                </button>
                                                {hasBankDetails && (
                                                    <button onClick={() => handleCopyBankDetails(contact)} className="font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300">
                                                        Copiar Dados
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
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
                canShowOwner={canShowOwner}
                customAvatars={customAvatars}
                setCustomAvatars={setCustomAvatars}
            />
            
            <ConfirmationModal
                isOpen={!!contactToDelete}
                onClose={() => setContactToDelete(null)}
                onConfirm={handleConfirmDelete}
                isConfirming={isDeleting}
                title="Confirmar Exclusão de Contato"
            >
                Você tem certeza que deseja excluir o contato <strong className="text-slate-800 dark:text-slate-100">{contactToDelete?.name}</strong>? Esta ação não pode ser desfeita.
            </ConfirmationModal>
        </div>
    );
};

const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;
const BankIcon = () => <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>;
