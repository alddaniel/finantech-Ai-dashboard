import React, { useState, useEffect } from 'react';
import type { View, Company, User, Role, Notification } from '../types';
import { VIEWS } from '../constants';


interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  selectedCompany: string;
  setSelectedCompany: (company: string) => void;
  companies: Company[];
  company?: Company;
  currentUser: User;
  onLogout: () => void;
  className?: string;
  isAccountantModuleEnabled: boolean;
  onOpenInvoiceModal: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  notifications: Notification[];
  setIsNotificationsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMobileOpen: boolean;
  setMobileOpen: (isOpen: boolean) => void;
}

type SubMenuType = 'main' | 'pagamentos' | 'recebimentos' | 'projetos';

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

export const Sidebar: React.FC<SidebarProps> = ({ 
    activeView, setActiveView, selectedCompany, setSelectedCompany, companies, 
    company, currentUser, onLogout, className, isAccountantModuleEnabled, 
    onOpenInvoiceModal, isFullscreen, onToggleFullscreen,
    notifications, setIsNotificationsOpen, isMobileOpen, setMobileOpen
}) => {
  const [activeSubMenu, setActiveSubMenu] = useState<SubMenuType>('main');

  const unreadNotificationsCount = notifications.filter(n => !n.isRead && n.company === selectedCompany).length;
  
  const handleNavigation = (logic: () => void) => {
    logic();
    setMobileOpen(false); // Always close on navigation
  };

  const recebimentosSubItems: Array<{ label: string; view?: View; action?: () => void; activeChecks: View[]; icon: React.ReactNode; }> = [
      { label: 'Lançar/Baixar Receita', view: VIEWS.RECEIPTS, activeChecks: [VIEWS.RECEIPTS], icon: <MoneyInIcon /> },
      { label: 'Agenda de Recebimentos', view: VIEWS.RECEIVABLE_SCHEDULE, activeChecks: [VIEWS.RECEIVABLE_SCHEDULE], icon: <CalendarClockIcon /> },
      { label: 'Nova Cobrança/Fatura', action: onOpenInvoiceModal, activeChecks: [], icon: <CalendarPlusIcon /> },
      { label: 'Faturas Emitidas', view: VIEWS.GENERATED_INVOICES, activeChecks: [VIEWS.GENERATED_INVOICES], icon: <DocumentStackIcon /> },
      { label: 'Recorrências', view: VIEWS.RECURRENCES, activeChecks: [VIEWS.RECURRENCES], icon: <SubMenuRepeatIcon /> },
  ];

  const pagamentosSubItems: Array<{ label: string; view: View; activeChecks: View[]; icon: React.ReactNode; }> = [
      { label: 'Pagar', view: VIEWS.PAYABLE, activeChecks: [VIEWS.PAYABLE], icon: <MoneyOutIcon /> },
      { label: 'Agendar', view: VIEWS.PAYMENT_SCHEDULE, activeChecks: [VIEWS.PAYMENT_SCHEDULE], icon: <CalendarClockIcon /> },
      { label: 'Recorrências', view: VIEWS.PAYABLE_RECURRENCES, activeChecks: [VIEWS.PAYABLE_RECURRENCES], icon: <SubMenuRepeatIcon /> },
  ];
  
  const projetosSubItems: Array<{ label: string; view: View; activeChecks: View[]; icon: React.ReactNode; module?: 'projects' }> = [
    { label: 'Propostas', view: VIEWS.PROPOSALS, activeChecks: [VIEWS.PROPOSALS], icon: <ProposalIcon />, module: 'projects' },
    { label: 'Projetos', view: VIEWS.PROJECTS, activeChecks: [VIEWS.PROJECTS], icon: <ProjectsIcon />, module: 'projects' },
    { label: 'Central de Cobrança (CRM)', view: VIEWS.CRM, activeChecks: [VIEWS.CRM], icon: <FunnelIcon /> },
  ];

  const settingsRelatedViews: View[] = [
      VIEWS.SETTINGS, VIEWS.COMPANY_PROFILE, VIEWS.USER_MANAGEMENT, 
      VIEWS.COST_CENTERS, VIEWS.BANK_ACCOUNTS, 
      VIEWS.PLAN_SUBSCRIPTION, VIEWS.CATEGORIES, VIEWS.INDEXES
  ];

  const isSubMenuActive = (baseView: 'pagamentos' | 'recebimentos' | 'projetos') => {
    if (baseView === 'pagamentos') {
        return pagamentosSubItems.some(i => i.view === activeView);
    }
    if (baseView === 'recebimentos') {
        return recebimentosSubItems.some(i => i.activeChecks.includes(activeView));
    }
    if (baseView === 'projetos') {
        return projetosSubItems.some(i => i.activeChecks.includes(activeView));
    }
    return false;
  }

  const menuItems: Array<{ label: string; view: View; icon: React.ReactNode; roles?: Role[]; module?: 'accountant' | 'properties' | 'fiscal' | 'ai_advisor' | 'integrations' }> = [
    { label: 'Imóveis', view: VIEWS.PROPERTIES, icon: <PropertyIcon />, module: 'properties' },
    { label: 'Módulo Fiscal', view: VIEWS.FISCAL_MODULE, icon: <FiscalIcon />, module: 'fiscal' },
    { label: 'Integrações', view: VIEWS.INTEGRATIONS, icon: <IntegrationsIcon /> },
    { label: 'Relatórios', view: VIEWS.REPORTS, icon: <ReportsIcon /> },
    { label: 'Painel Contador', view: VIEWS.ACCOUNTANT_PANEL, icon: <AccountantIcon />, roles: ['Admin', 'Contador'], module: 'accountant' },
    { label: 'Consultor IA', view: VIEWS.AI_ADVISOR, icon: <AIIcon />, module: 'ai_advisor' },
  ];
  
  const accessibleCompanies = companies.filter(c => currentUser.accessibleCompanies.includes(c.name));

  const renderSubMenu = () => {
    let title = '';
    let items: Array<{ label: string; view?: View; action?: () => void; activeChecks?: View[]; icon: React.ReactNode; roles?: Role[]; module?: string }> = [];

    if (activeSubMenu === 'pagamentos') {
      title = 'Pagamentos';
      items = pagamentosSubItems;
    } else if (activeSubMenu === 'recebimentos') {
      title = 'Recebimentos';
      items = recebimentosSubItems;
    } else if (activeSubMenu === 'projetos') {
      title = 'Projetos & Comercial';
      items = projetosSubItems.filter(item => {
          if (item.module === 'projects' && !company?.enabledModules.includes('projects')) {
              return false;
          }
          return true;
      });
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
              icon={item.icon}
              isActive={item.view ? activeView === item.view : false}
              onClick={() => handleNavigation(() => {
                if (item.view) setActiveView(item.view);
                if (item.action) item.action();
              })}
            />
          ))}
        </ul>
      </div>
    );
  }

  return (
    <>
        <div
            className={`fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity ${
                isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
        />
        <aside className={`fixed top-0 left-0 h-full w-72 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-4 flex flex-col border-r border-slate-900/5 dark:border-white/10 z-30 transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} ${className || ''}`}>
          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="bg-indigo-600 p-2.5 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 12h2v6H8v-6zm3-3h2v9h-2V9zm3-4h2v13h-2V5z"/>
              </svg>
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
                  onClick={() => handleNavigation(() => setActiveView(VIEWS.DASHBOARD))}
                />
                <NavItem
                    key={VIEWS.BANK_RECONCILIATION}
                    label="Conciliação Bancária"
                    icon={<ReconciliationIcon />}
                    isActive={activeView === VIEWS.BANK_RECONCILIATION}
                    onClick={() => handleNavigation(() => setActiveView(VIEWS.BANK_RECONCILIATION))}
                />
                <NavItem
                    key={VIEWS.CONTACTS}
                    label="Contatos"
                    icon={<AddressBookIcon />}
                    isActive={activeView === VIEWS.CONTACTS}
                    onClick={() => handleNavigation(() => setActiveView(VIEWS.CONTACTS))}
                />
                <div className="px-2.5 py-3">
                    <div className="border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <NavItem
                  key="projetos"
                  label="Projetos & Comercial"
                  icon={<ProjectsIcon />}
                  isActive={isSubMenuActive('projetos')}
                  onClick={() => setActiveSubMenu('projetos')}
                  hasSubMenu
                />
                <NavItem
                  key="pagamentos"
                  label="Pagamentos"
                  icon={<PayableIcon />}
                  isActive={isSubMenuActive('pagamentos')}
                  onClick={() => setActiveSubMenu('pagamentos')}
                  hasSubMenu
                />
                <NavItem
                  key="recebimentos"
                  label="Recebimentos"
                  icon={<ReceivableIcon />}
                  isActive={isSubMenuActive('recebimentos')}
                  onClick={() => setActiveSubMenu('recebimentos')}
                  hasSubMenu
                />
                <NavItem
                  key={VIEWS.CASH_FLOW_RECORDS}
                  label="Extrato de Caixa"
                  icon={<CashFlowRecordsIcon />}
                  isActive={activeView === VIEWS.CASH_FLOW_RECORDS}
                  onClick={() => handleNavigation(() => setActiveView(VIEWS.CASH_FLOW_RECORDS))}
                />
                <div className="px-2.5 py-3">
                    <div className="border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                {menuItems.map(item => {
                  if (item.module === 'accountant' && !isAccountantModuleEnabled) return null;
                  if (item.module === 'properties' && !company?.enabledModules.includes('properties')) return null;
                  if (item.module === 'fiscal' && !company?.enabledModules.includes('fiscal')) return null;
                  if (item.view === VIEWS.INTEGRATIONS && !company?.enabledModules.includes('integrations')) return null;
                  if (item.module === 'ai_advisor' && !company?.enabledModules.includes('ai_advisor')) return null;
                  if (item.roles && !item.roles.includes(currentUser.role)) return null;
                  
                  return (
                    <NavItem
                      key={item.view}
                      label={item.label}
                      view={item.view}
                      icon={item.icon}
                      isActive={activeView === item.view}
                      onClick={() => handleNavigation(() => setActiveView(item.view))}
                    />
                  );
                })}

                {/* Settings Section */}
                <div className="px-2.5 py-3">
                    <div className="border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <NavItem
                    key={VIEWS.SETTINGS}
                    label="Configurações"
                    icon={<SettingsIcon />}
                    isActive={settingsRelatedViews.includes(activeView)}
                    onClick={() => handleNavigation(() => setActiveView(VIEWS.SETTINGS))}
                />
                <NavItem
                    key={VIEWS.HELP}
                    label="Ajuda"
                    icon={<HelpIcon />}
                    isActive={activeView === VIEWS.HELP}
                    onClick={() => handleNavigation(() => setActiveView(VIEWS.HELP))}
                />
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
            <div className="border-t border-gray-200/50 dark:border-gray-800/50 pt-4 flex items-center justify-between">
                <div className="flex items-center p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-slate-800/50">
                    <img className="w-10 h-10 rounded-full" src={currentUser.avatar} alt="User" />
                    <div className="ml-3">
                        <p className="font-semibold text-sm text-gray-800 dark:text-white">{currentUser.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.role}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onToggleFullscreen}
                        title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
                        className="p-2.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenEnterIcon />}
                    </button>
                    <button
                        onClick={() => setIsNotificationsOpen(prev => !prev)}
                        title="Notificações"
                        className="relative p-2.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-slate-800/50 transition-colors"
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
                        className="p-2.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-red-50/50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                        <LogoutIcon />
                    </button>
                </div>
            </div>
          </div>
        </aside>
    </>
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
const ReconciliationIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>;
const ReportsIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>;
const AIIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const FiscalIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-4m-3 4h.01M9 14h.01M5 7h.01M5 11h.01M5 15h.01M19 7h-.01M19 11h-.01M19 15h.01M12 21a9 9 0 110-18 9 9 0 010 18z"></path></svg>;
const IntegrationsIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>;
const UserGroupIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;
const AddressBookIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;
const TagIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 8V5a2 2 0 012-2z"></path></svg>;
const PropertyIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V10a2 2 0 00-2-2H7a2 2 0 00-2 2v11m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 21v-6a2 2 0 012-2h2a2 2 0 012 2v6"></path></svg>;
const ProjectsIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>;
const HelpIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const LogoutIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>;
const AccountantIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;
const SchemaGeneratorIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>;
const ChevronRightIcon = () => <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>;
const ChevronLeftIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>;
const FullscreenEnterIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1v4m0 0h-4m4 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 1v-4m0 0h-4m4 0l-5 5"></path></svg>;
const FullscreenExitIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 14h4v4m-4-4l5 5m11-5h-4v4m4-4l-5 5M4 10h4V6m-4 4l5-5m11 5h-4V6m4 4l-5-5"></path></svg>;
const BellIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const CompanyProfileIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-4h1m-1 4h1m-1-8h1m-5 8h.01M12 3h.01M12 7h.01M12 11h.01M12 15h.01" /></svg>;
const PlanSubscriptionIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>;
const SettingsIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;
const PercentageIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7l6 10M9 17l6-10M19 5a2 2 0 11-4 0 2 2 0 014 0zM5 19a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>;

// --- Sub-menu Icons ---
const MoneyOutIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>;
const CalendarClockIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 12.75h.008v.008H12v-.008zm0 4.5h.008v.008H12v-.008zm4.5-4.5h.008v.008H16.5v-.008zm0 4.5h.008v.008H16.5v-.008zm-9-4.5h.008v.008H7.5v-.008zm0 4.5h.008v.008H7.5v-.008z" /></svg>;
const SubMenuRepeatIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.18-3.182m0-11.664a8.25 8.25 0 00-11.664 0L2.985 7.982" /></svg>;
const MoneyInIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>;
const CalendarPlusIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
const BarcodeIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5v15m16.5-15v15m-12.75-15h3.75m-3.75 15h3.75M9 4.5v15m3.75-15v15m3-15h3.75m-3.75 15h3.75" /></svg>;
const DocumentStackIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5-.124m7.5 10.375h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>;
const FunnelIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.572a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" /></svg>;
const BriefcaseIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>;
const ProposalIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;