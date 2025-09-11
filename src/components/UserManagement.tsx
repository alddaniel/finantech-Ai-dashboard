import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Badge } from './ui/Badge';
import { CompanyModal } from './CompanyModal';
import { UserModal } from './UserModal';
import { PermissionsManager } from './PermissionsManager';
import { ROLE_PERMISSIONS, VIEWS } from '../constants';
import type { Company, User, AuditLog, Role, UserPermissions, View, ToastMessage } from '../types';

type UserManagementTab = 'companyData' | 'users' | 'permissions' | 'audit';

interface UserManagementProps {
    companies: Company[];
    setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    auditLogs: AuditLog[];
    isAccountantModuleEnabled: boolean;
    selectedCompany: string;
    currentUser: User;
    setActiveView: (view: View) => void;
    addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

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

const PermissionsView: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Object.keys(ROLE_PERMISSIONS) as Role[]).map((role) => (
            <Card key={role}>
                <CardHeader className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{role}</h3>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 list-disc pl-5">
                        {ROLE_PERMISSIONS[role].map((perm, index) => <li key={index}>{perm}</li>)}
                    </ul>
                </CardContent>
            </Card>
        ))}
    </div>
);

const CompanyDataView: React.FC<{ company: Company | undefined; onEdit: () => void; isCurrentUserAdmin: boolean; }> = ({ company, onEdit, isCurrentUserAdmin }) => {
    if (!company) {
        return <Card><CardContent><p>Empresa não encontrada.</p></CardContent></Card>;
    }
    return (
        <Card>
            <CardHeader className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Dados da Empresa</h2>
                {isCurrentUserAdmin && (
                    <button onClick={onEdit} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                        Editar
                    </button>
                )}
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Razão Social</h3>
                    <p>{company.name}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">CNPJ</h3>
                    <p>{company.cnpj}</p>
                </div>
                <div className="md:col-span-2">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Endereço</h3>
                    <p>{`${company.address.street}, ${company.address.number} - ${company.address.neighborhood}, ${company.address.city}, ${company.address.state}`}</p>
                </div>
            </CardContent>
        </Card>
    );
};

const AuditLogView: React.FC<{ logs: AuditLog[]; users: User[]; selectedCompany: string; }> = ({ logs, users, selectedCompany }) => {
    const companyLogs = logs.filter(log => log.company === selectedCompany);
    return (
        <Card className="!p-0">
            <CardHeader className="p-6">
                <h2 className="text-xl font-semibold">Logs de Auditoria</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Últimas ações realizadas pelos usuários nesta empresa.</p>
            </CardHeader>
            <CardContent>
                <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                    {companyLogs.map(log => (
                        <li key={log.id} className="py-4 flex items-center">
                             <img className="h-10 w-10 rounded-full" src={log.userAvatar} alt="" />
                             <div className="ml-3">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    <span className="font-bold text-gray-900 dark:text-white">{log.userName}</span> {log.action}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{log.timestamp}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};


export const UserManagement: React.FC<UserManagementProps> = ({ companies, setCompanies, users, setUsers, auditLogs, isAccountantModuleEnabled, selectedCompany, currentUser, setActiveView, addToast }) => {
    const [activeTab, setActiveTab] = useState<UserManagementTab>('users');
    const [isCompanyModalOpen, setCompanyModalOpen] = useState(false);
    const [isUserModalOpen, setUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    const activeCompany = useMemo(() => companies.find(c => c.name === selectedCompany), [companies, selectedCompany]);

    const superAdmin = useMemo(() => {
        // A super admin is defined as a user with the 'Admin' role who has access to all registered companies.
        return users.find(u => u.role === 'Admin' && u.accessibleCompanies.length === companies.length);
    }, [users, companies]);

    const companyUsers = useMemo(() => {
        return users.filter(u => {
            const hasAccess = u.accessibleCompanies.includes(selectedCompany);
            // Ensure the super admin is not listed in the company's user management panel.
            const isNotSuperAdmin = !superAdmin || u.id !== superAdmin.id;
            return hasAccess && isNotSuperAdmin;
        });
    }, [users, selectedCompany, superAdmin]);

    const isCurrentUserAdmin = currentUser.role === 'Admin';
    
    const handleOpenUserModal = (user: User | null = null) => {
        setUserToEdit(user);
        setUserModalOpen(true);
    };

    const handleSaveUser = (userData: User) => {
        if (userToEdit) {
            setUsers(users.map(u => u.id === userData.id ? userData : u));
        } else {
            setUsers([...users, { ...userData, id: `user${Date.now()}` }]);
        }
        // FIX: Add toast notification
        addToast({
            type: 'success',
            title: userToEdit ? 'Usuário Atualizado!' : 'Usuário Adicionado!',
            description: `O usuário "${userData.name}" foi salvo com sucesso.`
        });
    };

    const handleDeleteUser = (id: string) => {
        if(id === currentUser.id) {
            // FIX: Corrected typo "не" to "não" in the alert message.
            alert("Você não pode excluir sua própria conta.");
            return;
        }
        if (window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
            const userToDelete = users.find(u => u.id === id);
            setUsers(prev => prev.filter(u => u.id !== id));
            // FIX: Add toast notification
            if (userToDelete) {
                addToast({
                    type: 'success',
                    title: 'Usuário Excluído!',
                    description: `O usuário "${userToDelete.name}" foi removido com sucesso.`
                });
            }
        }
    };

    const handleUpdatePermissions = (userId: string, permissions: UserPermissions) => {
        setUsers(currentUsers =>
            currentUsers.map(user =>
                user.id === userId ? { ...user, permissions } : user
            )
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'companyData':
                return <CompanyDataView company={activeCompany} onEdit={() => setCompanyModalOpen(true)} isCurrentUserAdmin={isCurrentUserAdmin} />;
            case 'users':
                return (
                    <Card className="!p-0">
                        <CardHeader className="p-6 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-semibold">Usuários</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie os usuários com acesso a <span className="font-bold">{selectedCompany}</span>.</p>
                            </div>
                            {isCurrentUserAdmin && (
                                <button onClick={() => handleOpenUserModal()} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm">
                                    <PlusIcon /> Adicionar Usuário
                                </button>
                            )}
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Usuário</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Perfil</th>
                                        <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900">
                                    {companyUsers.map(user => (
                                        <tr key={user.id} className="even:bg-gray-50 dark:even:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                                                    <div className="ml-4">
                                                        <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge color={user.role === 'Admin' ? 'purple' : user.role === 'Manager' ? 'indigo' : user.role === 'Contador' ? 'blue' : 'yellow'}>{user.role}</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium space-x-4">
                                                 {isCurrentUserAdmin && (
                                                     <>
                                                        <button onClick={() => handleOpenUserModal(user)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Editar</button>
                                                        <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Excluir</button>
                                                     </>
                                                 )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {companyUsers.length === 0 && <p className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum usuário com acesso a esta empresa.</p>}
                        </CardContent>
                    </Card>
                );
            case 'permissions':
                 if (!activeCompany) {
                    return <Card><CardContent><p>Selecione uma empresa para gerenciar as permissões.</p></CardContent></Card>;
                }
                return (
                    <PermissionsManager 
                        users={companyUsers}
                        currentUser={currentUser}
                        onUpdatePermissions={handleUpdatePermissions}
                        company={activeCompany}
                    />
                );
            case 'audit':
                return <AuditLogView logs={auditLogs} users={users} selectedCompany={selectedCompany} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                 <button
                    onClick={() => setActiveView(VIEWS.SETTINGS)}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Voltar para Configurações
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Administração do Sistema</h1>
            </div>
            
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <TabButton label="Dados da Empresa" active={activeTab === 'companyData'} onClick={() => setActiveTab('companyData')} icon={<CompanyIcon />}/>
                    <TabButton label="Usuários" active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<UsersIcon />} />
                    <TabButton label="Permissões" active={activeTab === 'permissions'} onClick={() => setActiveTab('permissions')} icon={<PermissionsIcon />} />
                    <TabButton label="Auditoria" active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} icon={<AuditLogIcon />} />
                </nav>
            </div>
            
            <div>
                {renderTabContent()}
            </div>
            
            <CompanyModal 
                isOpen={isCompanyModalOpen} 
                onClose={() => setCompanyModalOpen(false)} 
                companyToEdit={activeCompany || null}
                onSave={(companyData) => {
                     setCompanies(companies.map(c => c.id === companyData.id ? companyData : c));
                }}
                companies={companies}
                isSuperAdmin={false} // Company admin cannot change plan
            />

             <UserModal
                isOpen={isUserModalOpen}
                onClose={() => setUserModalOpen(false)}
                onSave={handleSaveUser}
                userToEdit={userToEdit}
                companies={companies}
                isAccountantModuleEnabled={isAccountantModuleEnabled}
                users={users}
                currentUser={currentUser}
                isSuperAdminContext={false}
            />
        </div>
    );
};

const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;
const CompanyIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-4h1m-1 4h1m-1-8h1m-5 8h.01M12 3h.01M12 7h.01M12 11h.01M12 15h.01" /></svg>;
const UsersIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const PermissionsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const AuditLogIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>;
