import React from 'react';
import type { View, User, Notification } from '../types';
import { VIEWS } from '../constants';

interface HeaderProps {
    onToggleSidebar: () => void;
    activeView: View;
    currentUser: User;
    onLogout: () => void;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    notifications: Notification[];
    setIsNotificationsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onOpenInvoiceModal: () => void;
}

// FIX: Corrected the type definition to satisfy Record<View, string> by including all possible keys.
const viewTitles: Record<View, string> = {
    [VIEWS.DASHBOARD]: 'Dashboard',
    [VIEWS.PAYABLE]: 'Contas a Pagar',
    [VIEWS.RECEIPTS]: 'Contas a Receber',
    [VIEWS.REPORTS]: 'Relatórios',
    [VIEWS.AI_ADVISOR]: 'Consultor IA',
    [VIEWS.CRM]: 'CRM Financeiro',
    [VIEWS.CONTACTS]: 'Contatos',
    [VIEWS.USER_MANAGEMENT]: 'Administração',
    [VIEWS.GENERATED_INVOICES]: 'Faturas Geradas',
    [VIEWS.ACCOUNTANT_PANEL]: 'Painel do Contador',
    [VIEWS.BANK_ACCOUNTS]: 'Contas Bancárias',
    [VIEWS.BANK_RECONCILIATION]: 'Conciliação Bancária',
    [VIEWS.RECURRENCES]: 'Recorrências de Receitas',
    [VIEWS.PAYABLE_RECURRENCES]: 'Recorrências de Despesas',
    [VIEWS.PAYMENT_SCHEDULE]: 'Agenda de Pagamentos',
    [VIEWS.RECEIVABLE_SCHEDULE]: 'Agenda de Recebimentos',
    [VIEWS.CASH_FLOW_RECORDS]: 'Extrato de Caixa',
    [VIEWS.PROPERTIES]: 'Gestão de Imóveis',
    [VIEWS.PROJECTS]: 'Gestão de Projetos',
    [VIEWS.PROPOSALS]: 'Funil de Propostas',
    [VIEWS.PRICE_QUOTATIONS]: 'Cotações de Preços',
    [VIEWS.SETTINGS]: 'Configurações',
    [VIEWS.HELP]: 'Central de Ajuda',
    [VIEWS.COMPANY_PROFILE]: 'Perfil da Empresa',
    [VIEWS.PLAN_SUBSCRIPTION]: 'Plano e Assinatura',
    [VIEWS.COST_CENTERS]: 'Centros de Custo',
    [VIEWS.CATEGORIES]: 'Categorias',
    [VIEWS.INDEXES]: 'Índices de Reajuste',
    [VIEWS.INTEGRATIONS]: 'Integrações',
    [VIEWS.FISCAL_MODULE]: 'Módulo Fiscal',
    [VIEWS.SCHEMA_GENERATOR]: 'Gerador de Schema',
    [VIEWS.CASH_MANAGEMENT]: 'Gestão de Caixa',
};

export const Header: React.FC<HeaderProps> = ({
    onToggleSidebar,
    activeView,
    currentUser,
    onLogout,
    isFullscreen,
    onToggleFullscreen,
    notifications,
    setIsNotificationsOpen,
    onOpenInvoiceModal
}) => {
    const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

    return (
        <header className="flex-shrink-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={onToggleSidebar} className="md:hidden p-2 text-slate-500 dark:text-slate-400">
                    <MenuIcon />
                </button>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{viewTitles[activeView] || 'Dashboard'}</h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
                <button
                    onClick={onOpenInvoiceModal}
                    className="hidden sm:flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors text-sm"
                >
                    <PlusIcon />
                    <span>Nova Cobrança</span>
                </button>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onToggleFullscreen}
                        title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
                        className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenEnterIcon />}
                    </button>
                    <button
                        onClick={() => setIsNotificationsOpen(prev => !prev)}
                        title="Notificações"
                        className="relative p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                        <BellIcon />
                        {unreadNotificationsCount > 0 && (
                            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {unreadNotificationsCount}
                            </span>
                        )}
                    </button>
                     <button
                        onClick={onLogout}
                        title="Sair"
                        className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-red-50/50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                        <LogoutIcon />
                    </button>
                    <div className="flex items-center p-2 rounded-lg">
                        <img className="w-9 h-9 rounded-full" src={currentUser.avatar} alt="User" />
                        <div className="ml-3 hidden sm:block">
                            <p className="font-semibold text-sm text-gray-800 dark:text-white">{currentUser.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.role}</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

const iconSize = "w-6 h-6";
const MenuIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>;
const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;
const FullscreenEnterIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1v4m0 0h-4m4 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 1v-4m0 0h-4m4 0l-5 5"></path></svg>;
const FullscreenExitIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 14h4v4m-4-4l5 5m11-5h-4v4m4-4l-5 5M4 10h4V6m-4 4l5-5m11 5h-4V6m4 4l-5-5"></path></svg>;
const BellIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const LogoutIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>;