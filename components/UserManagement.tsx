import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Badge } from './ui/Badge';
import { CompanyModal } from './CompanyModal';
import { UserModal } from './UserModal';
import { ROLE_PERMISSIONS } from '../constants';
import type { Company, User, AuditLog, Role } from '../types';

type UserManagementTab = 'companies' | 'users' | 'permissions' | 'audit';

interface UserManagementProps {
    companies: Company[];
    setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    auditLogs: AuditLog[];
    isAccountantModuleEnabled: boolean;
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
                    <ul className="space-y-2">
                        {ROLE_PERMISSIONS[role].map((permission, index) => (
                            <li key={index} className="flex items-start">
                                <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
                                <span className="text-sm text-gray-600 dark:text-gray-300">{permission}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        ))}
    </div>
);

const AuditView: React.FC<{logs: AuditLog[]}> = ({ logs }) => (
    <Card>
        <CardHeader className="p-6">
            <h2 className="text-xl font-semibold">Log de Auditoria</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ações recentes realizadas no sistema.</p>
        </CardHeader>
        <CardContent className="p-6 pt-0">
            <ul className="space-y-4">
                {logs.map(log => (
                    <li key={log.id} className="flex items-center gap-4 py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                        <img className="h-10 w-10 rounded-full" src={log.userAvatar} alt={log.userName} />
                        <div className="flex-1">
                            <p className="text-sm text-gray-800 dark:text-gray-200">
                                <span className="font-bold">{log.userName}</span> {log.action}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </CardContent>
    </Card>
);


export const UserManagement: React.FC<UserManagementProps> = ({ companies, setCompanies, users, setUsers, auditLogs, isAccountantModuleEnabled }) => {
    const [activeTab, setActiveTab] = useState<UserManagementTab>('companies');
    
    const [isCompanyModalOpen, setCompanyModalOpen] = useState(false);
    const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);

    const [isUserModalOpen, setUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    const handleOpenCompanyModal = (company: Company | null = null) => {
        setCompanyToEdit(company);
        setCompanyModalOpen(true);
    };
    
    const handleSaveCompany = (companyData: Company) => {
        if (companyToEdit) {
            setCompanies(companies.map(c => c.id === companyData.id ? companyData : c));
        } else {
            setCompanies([...companies, { ...companyData, id: `comp${Date.now()}` }]);
        }
    };
    
    const handleDeleteCompany = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta empresa?')) {
            setCompanies(companies.filter(c => c.id !== id));
        }
    }
    
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
    };

    const handleDeleteUser = (id: string) => {
         if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestão de Acessos</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
                Administre empresas, usuários, permissões e monitore todas as ações no sistema.
            </p>

            <div className="border-b border-gray-200 dark:border-gray-700 flex space-x-2">
                <TabButton label="Empresas" active={activeTab === 'companies'} onClick={() => setActiveTab('companies')} icon={<CompanyIcon />}/>
                <TabButton label="Usuários" active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<UsersIcon />} />
                <TabButton label="Perfis e Permissões" active={activeTab === 'permissions'} onClick={() => setActiveTab('permissions')} icon={<ShieldIcon />} />
                <TabButton label="Auditoria de Ações" active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} icon={<AuditIcon />} />
            </div>

            <div>
                {activeTab === 'companies' && <CompaniesView companies={companies} onAdd={() => handleOpenCompanyModal()} onEdit={handleOpenCompanyModal} onDelete={handleDeleteCompany} />}
                {activeTab === 'users' && <UsersView users={users} onAdd={() => handleOpenUserModal()} onEdit={handleOpenUserModal} onDelete={handleDeleteUser} />}
                {activeTab === 'permissions' && <PermissionsView />}
                {activeTab === 'audit' && <AuditView logs={auditLogs} />}
            </div>
            
            <CompanyModal 
                isOpen={isCompanyModalOpen} 
                onClose={() => setCompanyModalOpen(false)} 
                onSave={handleSaveCompany}
                companyToEdit={companyToEdit}
            />
            <UserModal
                isOpen={isUserModalOpen}
                onClose={() => setUserModalOpen(false)}
                onSave={handleSaveUser}
                userToEdit={userToEdit}
                companies={companies}
                isAccountantModuleEnabled={isAccountantModuleEnabled}
            />

        </div>
    );
};

// Sub-components for each tab
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">CNPJ</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Endereço</th>
                        <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900">
                    {companies.map(c => (
                        <tr key={c.id} className="even:bg-gray-50 dark:even:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{c.name}</td>
                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{c.cnpj}</td>
                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{c.address}</td>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Acesso</th>
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
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{u.accessibleCompanies.join(', ')}</td>
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

const iconSize = "w-5 h-5";
const CompanyIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-4h1m-1 4h1m-1-8h1m-5 8h.01M12 3h.01M12 7h.01M12 11h.01M12 15h.01" /></svg>;
const UsersIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ShieldIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944L12 22l9-1.056v-5.555a12.062 12.062 0 00-4.382-9.048z" /></svg>;
const AuditIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const PlusIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;
const CheckIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>;