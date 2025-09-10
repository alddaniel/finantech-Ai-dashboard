
import React, { useMemo } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import type { User, UserPermissions, ModuleKey, PermissionAction, Company } from '../types';
import { MODULE_PERMISSIONS_MAP } from '../constants';

interface PermissionsManagerProps {
    users: User[];
    currentUser: User;
    onUpdatePermissions: (userId: string, permissions: UserPermissions) => void;
    company: Company;
}

const allPossibleModules: ModuleKey[] = Object.keys(MODULE_PERMISSIONS_MAP) as ModuleKey[];
const actions: PermissionAction[] = ['view', 'edit', 'delete'];
const actionLabels: Record<PermissionAction, string> = {
    view: 'Visualizar',
    edit: 'Criar/Editar',
    delete: 'Excluir'
};

export const PermissionsManager: React.FC<PermissionsManagerProps> = ({ users, currentUser, onUpdatePermissions, company }) => {

    const companyEnabledModules = useMemo(() => {
        // Base modules always available regardless of plan
        const baseModules: ModuleKey[] = [
            'dashboard', 'payable', 'receipts', 'contacts', 
            'bank_accounts', 'reports', 'user_management', 'crm'
        ];

        // Map ModuleType from company.enabledModules to ModuleKey
        const planSpecificModules: ModuleKey[] = (company.enabledModules || []).map(moduleType => {
            if (moduleType === 'fiscal') return 'fiscal_module';
            return moduleType as ModuleKey;
        });
        
        const enabledSet = new Set([...baseModules, ...planSpecificModules]);

        // Filter all possible modules to only include those enabled for the company, maintaining original order.
        return allPossibleModules.filter(m => enabledSet.has(m));

    }, [company]);


    const handlePermissionChange = (userId: string, module: ModuleKey, action: PermissionAction, value: boolean) => {
        const userToUpdate = users.find(u => u.id === userId);
        if (!userToUpdate) return;
        
        const newPermissions: UserPermissions = {
            ...userToUpdate.permissions,
            [module]: {
                view: userToUpdate.permissions?.[module]?.view ?? false,
                edit: userToUpdate.permissions?.[module]?.edit ?? false,
                delete: userToUpdate.permissions?.[module]?.delete ?? false,
                [action]: value,
            }
        };

        // Logic: if edit or delete is enabled, view must be enabled.
        if ((action === 'edit' || action === 'delete') && value) {
            newPermissions[module]!.view = true;
        }

        // Logic: if view is disabled, edit and delete must be disabled.
        if (action === 'view' && !value) {
            newPermissions[module]!.edit = false;
            newPermissions[module]!.delete = false;
        }


        onUpdatePermissions(userId, newPermissions);
    };

    return (
        <Card className="!p-0">
            <CardHeader className="p-6">
                <h2 className="text-xl font-semibold">Gerenciar Permissões de Usuários</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Defina o que cada usuário pode ver, editar ou excluir em cada módulo do sistema.
                </p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th className="sticky left-0 bg-gray-50 dark:bg-gray-900/50 px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-300 uppercase z-10">Usuário</th>
                            {companyEnabledModules.map(module => (
                                <th key={module} colSpan={3} className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-300 uppercase border-l border-gray-200 dark:border-gray-700">
                                    {MODULE_PERMISSIONS_MAP[module]}
                                </th>
                            ))}
                        </tr>
                        <tr>
                            <th className="sticky left-0 bg-gray-50 dark:bg-gray-900/50 px-4 py-3 z-10"></th>
                            {companyEnabledModules.map(module => (
                                <React.Fragment key={module}>
                                    {actions.map(action => (
                                        <th key={`${module}-${action}`} className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-gray-700">
                                            {actionLabels[action]}
                                        </th>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {users.map(user => {
                            const isCurrentUserAdmin = user.id === currentUser.id;
                            return (
                                <tr key={user.id} className={isCurrentUserAdmin ? "bg-slate-100 dark:bg-slate-800" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"}>
                                    <td className={`sticky left-0 px-4 py-3 font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap z-10 ${isCurrentUserAdmin ? "bg-slate-100 dark:bg-slate-800" : "bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50"}`}>
                                        {user.name}
                                        {isCurrentUserAdmin && <span className="text-xs font-normal text-gray-400"> (Você)</span>}
                                    </td>
                                    {companyEnabledModules.map(module => (
                                        <React.Fragment key={`${user.id}-${module}`}>
                                            {actions.map(action => (
                                                <td key={`${user.id}-${module}-${action}`} className="px-2 py-2 text-center border-l border-gray-200 dark:border-gray-700">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        checked={user.permissions?.[module]?.[action] ?? false}
                                                        onChange={(e) => handlePermissionChange(user.id, module, action, e.target.checked)}
                                                        disabled={isCurrentUserAdmin || user.role === 'Admin'}
                                                        aria-label={`Permissão para ${user.name} - ${MODULE_PERMISSIONS_MAP[module]} - ${actionLabels[action]}`}
                                                    />
                                                </td>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {users.length === 0 && (
                    <p className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum usuário para gerenciar permissões nesta empresa.</p>
                )}
            </CardContent>
        </Card>
    );
};
