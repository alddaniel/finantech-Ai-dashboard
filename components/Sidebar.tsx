

import React, { useState } from 'react';
import type { View, Company, User, Role } from '../types';
import { VIEWS } from '../constants';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  selectedCompany: string;
  setSelectedCompany: (company: string) => void;
  companies: Company[];
  currentUser: User;
  onLogout: () => void;
  className?: string;
  isAccountantModuleEnabled: boolean;
  onOpenInvoiceModal: () => void;
}

type SubMenuType = 'main' | 'pagamentos' | 'recebimentos';

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  view?: View;
  isActive: boolean;
  onClick: () => void;
  hasSubMenu?: boolean;
}> = ({ icon, label, isActive, onClick, hasSubMenu = false }) => {
  const clickHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
  };

  return (
    <li>
      <a
        href="#"
        onClick={clickHandler}
        className={`flex items-center justify-between p-2.5 rounded-lg transition-colors duration-200 group relative ${
          isActive
            ? 'bg-indigo-50 dark:bg-indigo-500/10'
            : 'hover:bg-gray-100/50 dark:hover:bg-slate-800/50'
        }`}
        aria-current={isActive ? 'page' : undefined}
      >
        <div className="flex items-center">
          {isActive && <div className="absolute left-0 top-0 h-full w-1 bg-indigo-600 rounded-r-full"></div>}
           {icon && <div className={`transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'}`}>
              {icon}
          </div>}
          <span className={`ml-3 font-medium transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100'}`}>{label}</span>
        </div>
        {hasSubMenu && <ChevronRightIcon />}
      </a>
    </li>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, selectedCompany, setSelectedCompany, companies, currentUser, onLogout, className, isAccountantModuleEnabled, onOpenInvoiceModal }) => {
  const [activeSubMenu, setActiveSubMenu] = useState<SubMenuType>('main');

  const recebimentosSubItems: Array<{ label: string; view?: View; action?: () => void; activeChecks: View[] }> = [
      { label: 'Receber', view: VIEWS.RECEIPTS, activeChecks: [VIEWS.RECEIPTS] },
      { label: 'Agendar Cobrança', action: onOpenInvoiceModal, activeChecks: [] },
      { label: 'Boletos e NFS-e', action: onOpenInvoiceModal, activeChecks: [] },
      { label: 'Cobranças Emitidas', view: VIEWS.GENERATED_INVOICES, activeChecks: [VIEWS.GENERATED_INVOICES] },
      { label: 'Central de Cobrança', view: VIEWS.CRM, activeChecks: [VIEWS.CRM] },
      { label: 'Recorrências', view: VIEWS.RECURRENCES, activeChecks: [VIEWS.RECURRENCES] },
  ];

  const pagamentosSubItems: Array<{ label: string; view: View; activeChecks: View[] }> = [
      { label: 'Pagar', view: VIEWS.PAYABLE, activeChecks: [VIEWS.PAYABLE] },
      { label: 'Agendar', view: VIEWS.PAYMENT_SCHEDULE, activeChecks: [VIEWS.PAYMENT_SCHEDULE] },
      { label: 'Recorrências', view: VIEWS.PAYABLE_RECURRENCES, activeChecks: [VIEWS.PAYABLE_RECURRENCES] },
  ];
  
  const isSubMenuActive = (baseView: View) => {
    if (baseView === 'payable') {
        return pagamentosSubItems.some(i => i.view === activeView);
    }
    if (baseView === 'receipts') {
        return recebimentosSubItems.some(i => i.activeChecks.includes(activeView));
    }
    return false;
  }

  const menuItems: Array<{ label: string; view: View; icon: React.ReactNode; roles?: Role[]; module?: string }> = [
    { label: 'Dashboard', view: VIEWS.DASHBOARD, icon: <DashboardIcon /> },
    { label: 'Contas Bancárias', view: VIEWS.BANK_ACCOUNTS, icon: <BankAccountsIcon /> },
    { label: 'Contatos', view: VIEWS.CONTACTS, icon: <AddressBookIcon /> },
    { label: 'Módulo Fiscal', view: VIEWS.FISCAL_MODULE, icon: <FiscalIcon /> },
    { label: 'Relatórios e Indicadores de Pagamentos', view: VIEWS.REPORTS, icon: <ReportsIcon /> },
    { label: 'Integrações', view: VIEWS.INTEGRATIONS, icon: <IntegrationsIcon /> },
    { label: 'Gestão de Acessos', view: VIEWS.USER_MANAGEMENT, icon: <UserGroupIcon />, roles: ['Admin'] },
    { label: 'Painel Contador', view: VIEWS.ACCOUNTANT_PANEL, icon: <AccountantIcon />, roles: ['Admin', 'Contador'], module: 'accountant' },
    { label: 'Consultor IA', view: VIEWS.AI_ADVISOR, icon: <AIIcon /> },
    { label: 'Ajuda', view: VIEWS.HELP, icon: <HelpIcon /> },
  ];
  
  const accessibleCompanies = companies.filter(c => currentUser.accessibleCompanies.includes(c.name));

  const renderSubMenu = () => {
    let title = '';
    let items: Array<{ label: string; view?: View; action?: () => void, activeChecks: View[] }> = [];

    if (activeSubMenu === 'pagamentos') {
      title = 'Pagamentos';
      items = pagamentosSubItems as any;
    } else if (activeSubMenu === 'recebimentos') {
      title = 'Recebimentos';
      items = recebimentosSubItems;
    } else {
      return null;
    }

    return (
      <div className="flex flex-col h-full">
        <div className="p-2.5">
          <button onClick={() => setActiveSubMenu('main')} className="flex items-center text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4 p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-slate-800/50 w-full">
            <ChevronLeftIcon />
            <span className="ml-2">Voltar</span>
          </button>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white px-2">{title}</h2>
        </div>
        <ul className="space-y-1 mt-4 flex-1 px-2.5">
          {items.map(item => (
            <NavItem
              key={item.label}
              label={item.label}
              icon={<div className="w-6"></div>} // Placeholder for alignment
              isActive={item.view ? activeView === item.view : false}
              onClick={() => {
                  if(item.view) setActiveView(item.view);
                  if(item.action) item.action();
              }}
            />
          ))}
        </ul>
      </div>
    );
  }

  return (
    <aside className={`w-72 flex-shrink-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-4 flex flex-col border-r border-slate-900/5 dark:border-white/10 z-20 overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/30 ${className || ''}`}>
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="bg-indigo-600 p-2.5 rounded-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
        </div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-tighter">FinanTech AI</h1>
      </div>
      <nav className="flex-1 relative">
        {/* Main Menu Panel */}
        <div className={`absolute top-0 left-0 w-full h-full transition-transform duration-300 ease-in-out ${activeSubMenu !== 'main' ? '-translate-x-full' : 'translate-x-0'}`}>
          <ul className="space-y-1">
            <NavItem
              key={VIEWS.DASHBOARD}
              label="Dashboard"
              icon={<DashboardIcon />}
              isActive={activeView === VIEWS.DASHBOARD}
              onClick={() => setActiveView(VIEWS.DASHBOARD)}
            />
             <NavItem
              key="pagamentos"
              label="Pagamentos"
              icon={<PayableIcon />}
              isActive={isSubMenuActive('payable')}
              onClick={() => setActiveSubMenu('pagamentos')}
              hasSubMenu
            />
             <NavItem
              key="recebimentos"
              label="Recebimentos"
              icon={<ReceivableIcon />}
              isActive={isSubMenuActive('receipts')}
              onClick={() => setActiveSubMenu('recebimentos')}
              hasSubMenu
            />
            <NavItem
              key={VIEWS.CASH_MANAGEMENT}
              label="Gestão de Caixa"
              icon={<CashManagementIcon />}
              isActive={activeView === VIEWS.CASH_MANAGEMENT}
              onClick={() => setActiveView(VIEWS.CASH_MANAGEMENT)}
            />
            <NavItem
              key={VIEWS.CASH_FLOW_RECORDS}
              label="Registros do Fluxo de Caixa"
              icon={<CashFlowRecordsIcon />}
              isActive={activeView === VIEWS.CASH_FLOW_RECORDS}
              onClick={() => setActiveView(VIEWS.CASH_FLOW_RECORDS)}
            />
            {menuItems.slice(1).map(item => {
              if (item.module === 'accountant' && !isAccountantModuleEnabled) return null;
              if (item.roles && !item.roles.includes(currentUser.role)) return null;
              
              return (
                <NavItem
                  key={item.view}
                  label={item.label}
                  view={item.view}
                  icon={item.icon}
                  isActive={activeView === item.view}
                  onClick={() => setActiveView(item.view)}
                />
              );
            })}
          </ul>
        </div>

        {/* Sub-Menu Panel */}
        <div className={`absolute top-0 left-0 w-full h-full transition-transform duration-300 ease-in-out bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl ${activeSubMenu !== 'main' ? 'translate-x-0' : 'translate-x-full'}`}>
          {renderSubMenu()}
        </div>
      </nav>
      <div className="mt-auto pt-4 space-y-4">
        <div>
          <label htmlFor="company-select" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 px-1">Empresa Ativa</label>
            <select
              id="company-select"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 pl-3 pr-10 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
            >
              {accessibleCompanies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
        </div>
        <div className="border-t border-gray-200/50 dark:border-gray-800/50 pt-4 flex flex-col space-y-2">
            <div className="flex items-center p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-slate-800/50">
                <img className="w-10 h-10 rounded-full" src={currentUser.avatar} alt="User" />
                <div className="ml-3">
                    <p className="font-semibold text-sm text-gray-800 dark:text-white">{currentUser.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.role}</p>
                </div>
            </div>
             <button
                onClick={onLogout}
                className="w-full flex items-center justify-center p-2.5 rounded-lg transition-colors duration-200 text-gray-500 hover:text-red-600 dark:text-gray-400 hover:bg-red-50/50 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              >
                <LogoutIcon />
                <span className="ml-2 font-medium text-sm">Sair</span>
              </button>
        </div>
      </div>
    </aside>
  );
};

// SVG Icons
const iconSize = "w-6 h-6";
const DashboardIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>;
const PayableIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>;
const ReceivableIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>;
const CashManagementIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>;
const CashFlowRecordsIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>;
const BankAccountsIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>;
const ReportsIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>;
const AIIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const FiscalIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-4m-3 4h.01M9 14h.01M5 7h.01M5 11h.01M5 15h.01M19 7h-.01M19 11h-.01M19 15h-.01M12 21a9 9 0 110-18 9 9 0 010 18z"></path></svg>;
const IntegrationsIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>;
const UserGroupIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;
const AddressBookIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;
const HelpIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const LogoutIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>;
const AccountantIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;
const ChevronRightIcon = () => <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>;
const ChevronLeftIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>;