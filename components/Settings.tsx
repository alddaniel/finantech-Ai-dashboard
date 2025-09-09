
import React from 'react';
import type { View, User, Role, Property, Transaction, AdjustmentIndex, ToastMessage } from '../types';
import { VIEWS } from '../constants';
import { Card, CardContent, CardHeader } from './ui/Card';

const iconSize = "w-8 h-8";

const CompanyProfileIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-4h1m-1 4h1m-1-8h1m-5 8h.01M12 3h.01M12 7h.01M12 11h.01M12 15h.01" /></svg>;
const UserGroupIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;
const TagIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 8V5a2 2 0 012-2z"></path></svg>;
const BankAccountsIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>;
const IntegrationsIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>;
const PlanSubscriptionIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>;
const CategoryIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 16l4-4-4-4M19 16l-4-4 4-4"></path></svg>;
const PercentageIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7l6 10M9 17l6-10M19 5a2 2 0 11-4 0 2 2 0 014 0zM5 19a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>;

const settingsItems: Array<{ label: string; view: View; icon: React.ReactNode; description: string; roles?: Role[] }> = [
    { label: 'Perfil da Empresa', view: VIEWS.COMPANY_PROFILE, icon: <CompanyProfileIcon />, description: 'Visualize e edite os dados cadastrais da sua empresa.', roles: ['Admin', 'Manager'] },
    { label: 'Usuários & Permissões', view: VIEWS.USER_MANAGEMENT, icon: <UserGroupIcon />, description: 'Adicione, remova e gerencie os usuários e suas permissões.', roles: ['Admin'] },
    { label: 'Centros de Custo', view: VIEWS.COST_CENTERS, icon: <TagIcon />, description: 'Organize suas despesas e receitas em centros de custo.', roles: ['Admin', 'Manager'] },
    { label: 'Categorias', view: VIEWS.CATEGORIES, icon: <CategoryIcon />, description: 'Gerencie as categorias de receitas e despesas.', roles: ['Admin', 'Manager'] },
    { label: 'Índices de Reajuste', view: VIEWS.INDEXES, icon: <PercentageIcon />, description: 'Gerencie os índices para correção de contratos de aluguel.', roles: ['Admin', 'Manager'] },
    { label: 'Contas Bancárias', view: VIEWS.BANK_ACCOUNTS, icon: <BankAccountsIcon />, description: 'Cadastre e gerencie as contas bancárias da sua empresa.', roles: ['Admin', 'Manager'] },
    { label: 'Integrações', view: VIEWS.INTEGRATIONS, icon: <IntegrationsIcon />, description: 'Conecte o sistema a outros serviços e módulos.', roles: ['Admin'] },
    { label: 'Plano & Assinatura', view: VIEWS.PLAN_SUBSCRIPTION, icon: <PlanSubscriptionIcon />, description: 'Visualize os detalhes do seu plano e módulos ativos.', roles: ['Admin', 'Manager'] },
];

interface SettingsProps {
    setActiveView: (view: View) => void;
    currentUser: User;
    properties: Property[];
    receivables: Transaction[];
    setReceivables: React.Dispatch<React.SetStateAction<Transaction[]>>;
    adjustmentIndexes: AdjustmentIndex[];
    setAdjustmentIndexes: React.Dispatch<React.SetStateAction<AdjustmentIndex[]>>;
    addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

export const Settings: React.FC<SettingsProps> = (props) => {
    const { setActiveView, currentUser } = props;
    const accessibleItems = settingsItems.filter(item => !item.roles || item.roles.includes(currentUser.role));
    
    // A bit of a hack to pass down all the other props to Indexes
    const { setActiveView: _setActiveView, currentUser: _currentUser, ...restForIndexes } = props;


    const renderView = (view: View) => {
        // Find the component to render based on the view
        const item = settingsItems.find(i => i.view === view);
        if (!item) return null;

        // Special case for Indexes to pass down extra props
        if (view === VIEWS.INDEXES && 'adjustmentIndexes' in props) {
            return (
                <div 
                    key={item.view}
                    onClick={() => setActiveView(item.view)}
                    className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer group"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setActiveView(item.view)}
                >
                    <div className="text-indigo-500 dark:text-indigo-400 mb-4 transition-transform group-hover:scale-110">{item.icon}</div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{item.label}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.description}</p>
                </div>
            )
        }
        
         return (
            <div 
                key={item.view}
                onClick={() => setActiveView(item.view)}
                className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer group"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setActiveView(item.view)}
            >
                <div className="text-indigo-500 dark:text-indigo-400 mb-4 transition-transform group-hover:scale-110">{item.icon}</div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{item.label}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.description}</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">Gerencie todos os aspectos da sua conta e empresa.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <h2 className="text-xl font-semibold">Configurações da Conta</h2>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accessibleItems.map(item => renderView(item.view))}
                </CardContent>
            </Card>
        </div>
    );
}
