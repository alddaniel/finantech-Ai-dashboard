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

// FIX: This object was missing keys required by the `View` type, causing a TypeScript error.
// It has been updated to include a title for every possible view.
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
        <header className="flex-shrink-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between h-20">
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
                {/* User actions are now part of the sidebar's primary column for better consistency */}
            </div>
        </header>
    );
};

const iconSize = "w-6 h-6";
const MenuIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>;
const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;