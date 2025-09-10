import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { CompanyModal } from './CompanyModal';
import { UserModal } from './UserModal';
import { Badge } from './ui/Badge';
import { SchemaGenerator } from './SchemaGenerator';
import { AIFinancialAdvisor } from './AIFinancialAdvisor';
import type { Company, User, ModuleType, Transaction, ToastMessage } from '../types';

interface AdminPanelProps {
    companies: Company[];
    setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    onLogout: () => void;
    currentUser: User;
    payables: Transaction[];
    receivables: Transaction[];
    addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

type AdminTab = 'companies' | 'users' | 'schema' | 'ai';

const TabButton: React.FC<{label: string, active: boolean, onClick: () => void, icon: React.ReactNode}> = ({ label, active, onClick, icon }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
            active
                ? 'text-indigo-600 border-indigo-600'
                : 'text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
    >
        {icon}
        {label}
    </button>
);


const CompaniesView: React.FC<{companies: Company[], onAdd: () => void, onEdit: (c: Company) => void, onDelete: (id: string) => void}> = ({ companies, onAdd, onEdit, onDelete }) => (
    <Card className="!p-0">
        <CardHeader className="flex justify-between items-center p-6">
            <h2 className="text-xl font-semibold">Empresas Cadastradas</h2>
            <button onClick={onAdd} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm">
                <PlusIcon /> Adicionar Empresa
            </button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
            <table className="min-w-full">
                <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nome da Empresa</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Plano</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Módulos Ativos</th>
                        <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900">
                    {companies.map(c => (
                        <tr key={c.id} className="even:bg-gray-50 dark:even:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <td className="px-6 py-4">
                               <p className="font-medium text-gray-900 dark:text-white">{c.name}</p>
                               <p className="text-sm text-gray-500 dark:text-gray-400">{c.cnpj}</p>
                            </td>
                            <td className="px-6 py-4">
                                <Badge color={c.plan === 'Pro' ? 'indigo' : c.plan === 'Enterprise' ? 'purple' : 'yellow'}>{c.plan}</Badge>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                    {c.enabledModules.length > 0 ? c.enabledModules.map(module => {
                                        const moduleLabels: Record<ModuleType, string> = {
                                            'properties': 'Imóveis',
                                            'fiscal': 'Fiscal',
                                            'integrations': 'Integrações',
                                            'ai_advisor': 'Consultor IA',
                                            'projects': 'Projetos'
                                        };
                                        return <Badge key={module} color="blue">{moduleLabels[module]}</Badge>
                                    }) : <span className="text-xs text-gray-500 italic">Nenhum</span>}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-medium space-x-4">
                                <button onClick={() => onEdit(c)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Editar</button>
                                <button onClick={() => onDelete(c.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Excluir</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </CardContent>
    </Card>
);

const UsersView: React.FC<{users: User[], onAdd: () => void, onEdit: (u: User) => void, onDelete: (id: string) => void}> = ({ users, onAdd, onEdit, onDelete }) => (
    <Card className="!p-0">
        <CardHeader className="flex justify-between items-center p-6">
            <h2 className="text-xl font-semibold">Usuários do Sistema</h2>
            <button onClick={onAdd} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm">
                <PlusIcon /> Adicionar Usuário
            </button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
             <table className="min-w-full">
                <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Usuário</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Perfil</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Acesso (Empresas)</th>
                        <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900">
                    {users.map(u => (
                        <tr key={u.id} className="even:bg-gray-50 dark:even:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <img className="h-10 w-10 rounded-full" src={u.avatar} alt="" />
                                    <div className="ml-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{u.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{u.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <Badge color={u.role === 'Admin' ? 'purple' : u.role === 'Manager' ? 'indigo' : u.role === 'Contador' ? 'blue' : 'yellow'}>{u.role}</Badge>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate" title={u.accessibleCompanies.join(', ')}>
                                {u.accessibleCompanies.join(', ')}
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-medium space-x-4">
                                <button onClick={() => onEdit(u)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Editar</button>
                                <button onClick={() => onDelete(u.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Excluir</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </CardContent>
    </Card>
);

const AIFinancialAdvisorForAdmin: React.FC<{ companies: Company[], payables: Transaction[], receivables: Transaction[] }> = ({ companies, payables, receivables }) => {
    const [selectedCompany, setSelectedCompany] = useState<string>(companies[0]?.name || '');

    if (companies.length === 0) {
        return <Card><CardContent><p className="text-center py-8">Nenhuma empresa cadastrada para analisar.</p></CardContent></Card>;
    }

    return (
        <Card>
            <CardHeader>
                 <div className="flex items-center gap-4">
                    <label htmlFor="admin-ai-company-select" className="text-sm font-medium text-gray-600 dark:text-gray-300">Analisar Empresa:</label>
                    <select 
                        id="admin-ai-company-select"
                        value={selectedCompany} 
                        onChange={e => setSelectedCompany(e.target.value)}
                        className="block rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2 pl-3 pr-10 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    >
                        {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
            </CardHeader>
            <CardContent>
                <AIFinancialAdvisor 
                    payables={payables}
                    receivables={receivables}
                    selectedCompany={selectedCompany}
                />
            </CardContent>
        </Card>
    );
}


export const AdminPanel: React.FC<AdminPanelProps> = ({ companies, setCompanies, users, setUsers, onLogout, currentUser, payables, receivables, addToast }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('companies');
    
    const [isCompanyModalOpen, setCompanyModalOpen] = useState(false);
    const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);

    const [isUserModalOpen, setUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    // Company handlers
    const handleOpenCompanyModal = (company: Company | null = null) => {
        setCompanyToEdit(company);
        setCompanyModalOpen(true);
    };
    
    const handleSaveCompany = (companyData: Company) => {
        if (companyToEdit) {
            const oldCompanyName = companyToEdit.name;
            const newCompanyName = companyData.name;

            setCompanies(prevCompanies => 
                prevCompanies.map(c => c.id === companyData.id ? companyData : c)
            );

            if (oldCompanyName !== newCompanyName) {
                setUsers(prevUsers => 
                    prevUsers.map(user => {
                        if (user.accessibleCompanies.includes(oldCompanyName)) {
                            return {
                                ...user,
                                accessibleCompanies: user.accessibleCompanies.map(companyName => 
                                    companyName === oldCompanyName ? newCompanyName : companyName
                                )
                            };
                        }
                        return user;
                    })
                );
            }
        } else {
            setCompanies(prevCompanies => [...prevCompanies, { ...companyData, id: `comp${Date.now()}` }]);
        }
        // FIX: Add toast notification on save
        addToast({
            type: 'success',
            title: companyToEdit ? 'Empresa Atualizada!' : 'Empresa Adicionada!',
            description: `A empresa "${companyData.name}" foi salva com sucesso.`
        });
    };
    
    const handleDeleteCompany = (id: string) => {
        const companyToDelete = companies.find(c => c.id === id);
        if (!companyToDelete) return;
    
        if (window.confirm(`Tem certeza que deseja excluir a empresa "${companyToDelete.name}"? Isso removerá o acesso de todos os usuários a esta empresa.`)) {
            // Use functional updates to ensure atomicity
            setCompanies(prevCompanies => prevCompanies.filter(c => c.id !== id));
    
            setUsers(prevUsers => 
                prevUsers.map(user => {
                    if (user.accessibleCompanies.includes(companyToDelete.name)) {
                        return {
                            ...user,
                            accessibleCompanies: user.accessibleCompanies.filter(
                                companyName => companyName !== companyToDelete.name
                            )
                        };
                    }
                    return user;
                })
            );
            // FIX: Add toast notification on delete
            addToast({
                type: 'success',
                title: 'Empresa Excluída!',
                description: `A empresa "${companyToDelete.name}" e seus vínculos foram removidos.`
            });
        }
    };
    
    // User handlers
    const handleOpenUserModal = (user: User | null = null) => {
        setUserToEdit(user);
        setUserModalOpen(true);
    };

    const handleSaveUser = (userData: User) => {
        if (userToEdit) {
            setUsers(prevUsers => prevUsers.map(u => u.id === userData.id ? userData : u));
        } else {
            setUsers(prevUsers => [...prevUsers, { ...userData, id: `user${Date.now()}` }]);
        }
        // FIX: Add toast notification on save
        addToast({
            type: 'success',
            title: userToEdit ? 'Usuário Atualizado!' : 'Usuário Adicionado!',
            description: `O usuário "${userData.name}" foi salvo com sucesso.`
        });
    };

    const handleDeleteUser = (id: string) => {
         if (id === currentUser.id) {
            alert("Você не pode excluir sua própria conta de Super Administrador.");
            return;
        }
         if (window.confirm('Tem certeza que deseja excluir este usuário do sistema? Esta ação não pode ser desfeita.')) {
            const userToDelete = users.find(u => u.id === id);
            setUsers(prev => prev.filter(u => u.id !== id));
            // FIX: Add toast notification on delete
            if (userToDelete) {
                addToast({
                    type: 'success',
                    title: 'Usuário Excluído!',
                    description: `O usuário "${userToDelete.name}" foi removido com sucesso.`
                });
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                     <button
                        onClick={onLogout}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-slate-800/50"
                    >
                        <ChevronLeftIcon />
                        Voltar e Sair
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Logado como: <strong className="text-gray-800 dark:text-gray-200">{currentUser.name}</strong></span>
                        <button onClick={() => handleOpenUserModal(currentUser)} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                            Editar Meu Perfil
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Painel de Administração do Sistema</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Gerencie as empresas, usuários e ferramentas avançadas da plataforma FinanTech AI.
                    </p>

                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex flex-wrap" aria-label="Tabs">
                            <TabButton label="Empresas" active={activeTab === 'companies'} onClick={() => setActiveTab('companies')} icon={<CompanyIcon />}/>
                            <TabButton label="Usuários / Admins" active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<UsersIcon />} />
                            <TabButton label="Gerador de Schema" active={activeTab === 'schema'} onClick={() => setActiveTab('schema')} icon={<SchemaGeneratorIcon />} />
                            <TabButton label="Consultor IA" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon={<AIIcon />} />
                        </nav>
                    </div>

                    {activeTab === 'companies' && (
                         <CompaniesView 
                            companies={companies} 
                            onAdd={() => handleOpenCompanyModal()} 
                            onEdit={handleOpenCompanyModal} 
                            onDelete={handleDeleteCompany} 
                        />
                    )}
                    {activeTab === 'users' && (
                        <UsersView
                            users={users}
                            onAdd={() => handleOpenUserModal()}
                            onEdit={handleOpenUserModal}
                            onDelete={handleDeleteUser}
                        />
                    )}
                    {activeTab === 'schema' && <SchemaGenerator />}
                    {activeTab === 'ai' && <AIFinancialAdvisorForAdmin companies={companies} payables={payables} receivables={receivables} />}
                </div>

                 <CompanyModal 
                    isOpen={isCompanyModalOpen} 
                    onClose={() => setCompanyModalOpen(false)} 
                    onSave={handleSaveCompany}
                    companyToEdit={companyToEdit}
                    companies={companies}
                    isSuperAdmin={true}
                />
                
                <UserModal
                    isOpen={isUserModalOpen}
                    onClose={() => setUserModalOpen(false)}
                    onSave={handleSaveUser}
                    userToEdit={userToEdit}
                    companies={companies}
                    users={users}
                    isAccountantModuleEnabled={true}
                    currentUser={currentUser}
                    isSuperAdminContext={true}
                />
            </div>
        </div>
    );
};

const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;
const ChevronLeftIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>;
const CompanyIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-4h1m-1 4h1m-1-8h1m-5 8h.01M12 3h.01M12 7h.01M12 11h.01M12 15h.01" /></svg>;
const UsersIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const SchemaGeneratorIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>;
const AIIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
