
import React from 'react';
import type { View } from '../types';

// FIX: Explicitly define all keys for VIEW_TITLES to satisfy Record<View, string> and fix the TypeScript error.
const VIEW_TITLES: Record<View, string> = {
  'dashboard': 'Dashboard',
  'payable': 'Contas a Pagar',
  'payable_recurrences': 'Recorrências de Pagamento',
  'payment_schedule': 'Agenda de Pagamentos',
  'receipts': 'Contas a Receber',
  'recurrences': 'Recorrências de Recebimento',
  'receivable_schedule': 'Agenda de Recebimentos',
  'cash_management': 'Gestão de Caixa',
  'cash_flow_records': 'Extrato de Caixa',
  'bank_accounts': 'Contas Bancárias',
  'bank_reconciliation': 'Conciliação Bancária',
  'reports': 'Relatórios',
  'generated_invoices': 'Faturas Emitidas',
  'ai_advisor': 'Consultor IA',
  'fiscal_module': 'Módulo Fiscal',
  'crm': 'CRM de Cobrança',
  'integrations': 'Integrações',
  'user_management': 'Administração',
  'contacts': 'Contatos',
  'help': 'Ajuda',
  'accountant_panel': 'Painel do Contador',
  'properties': 'Imóveis',
  'projects': 'Projetos',
  'proposals': 'Propostas',
  'schema_generator': 'Gerador de Schema',
  'cost_centers': 'Centros de Custo',
  'company_profile': 'Perfil da Empresa',
  'plan_subscription': 'Plano e Assinatura',
  'settings': 'Configurações',
  'categories': 'Categorias',
  'indexes': 'Índices de Reajuste',
};

interface HeaderProps {
    activeView: View;
    onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeView, onMenuClick }) => {
    const title = VIEW_TITLES[activeView] || 'FinanTech AI';
    return (
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl flex-shrink-0 z-10">
            <button onClick={onMenuClick} className="p-2 -ml-2 text-slate-600 dark:text-slate-300">
                <MenuIcon />
            </button>
            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h1>
            <div className="w-8"></div> {/* Spacer to balance the title */}
        </header>
    );
};

const MenuIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
    </svg>
);
