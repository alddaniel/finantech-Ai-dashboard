import React, { useState, useEffect } from 'react';
import type { View, Company, User, Role, Notification } from '../types';
import { VIEWS } from '../constants';

type PrimaryCategory = 'dashboard' | 'financeiro' | 'projetos' | 'relatorios' | 'configuracoes';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  selectedCompany: string;
  setSelectedCompany: (company: string) => void;
  companies: Company[];
  company?: Company;
  currentUser: User;
  onLogout: () => void;
  isAccountantModuleEnabled: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

const PrimaryNavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  category: PrimaryCategory;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li>
    <button
      onClick={onClick}
      className={`w-full flex flex-col items-center p-3 rounded-lg transition-colors duration-200 group relative ${isActive ? 'bg-indigo-100 dark:bg-indigo-500/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
      aria-label={label}
      title={label}
    >
      <div className={`transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`}>
        {icon}
      </div>
      <span className={`mt-1 text-[10px] font-bold transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'}`}>
        {label}
      </span>
    </button>
  </li>
);

const SecondaryNavItem: React.FC<{
  label: string;
  view?: View;
  action?: () => void;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group ${isActive ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'}`}
    >
        <span className="truncate">{label}</span>
    </a>
);

export const Sidebar: React.FC<SidebarProps> = ({ 
    activeView, setActiveView, selectedCompany, setSelectedCompany, companies, 
    company, currentUser, onLogout, isAccountantModuleEnabled, 
    isCollapsed, onToggleCollapse, isMobileOpen, setIsMobileOpen
}) => {
    
    const [activePrimaryCategory, setActivePrimaryCategory] = useState<PrimaryCategory>('dashboard');
    
    useEffect(() => {
        // Automatically open the correct primary category when the view changes from another source
        const financeViews: View[] = ['payable', 'receipts', 'bank_reconciliation', 'payment_schedule', 'receivable_schedule', 'cash_flow_records', 'payable_recurrences', 'recurrences', 'price_quotations'];
        const projectViews: View[] = ['projects', 'proposals', 'crm', 'properties'];
        const reportViews: View[] = ['reports', 'generated_invoices'];
        const settingsViews: View[] = ['settings', 'user_management', 'contacts', 'bank_accounts', 'company_profile', 'plan_subscription', 'cost_centers', 'categories', 'indexes', 'integrations'];

        if (financeViews.includes(activeView)) setActivePrimaryCategory('financeiro');
        else if (projectViews.includes(activeView)) setActivePrimaryCategory('projetos');
        else if (reportViews.includes(activeView)) setActivePrimaryCategory('relatorios');
        else if (settingsViews.includes(activeView)) setActivePrimaryCategory('configuracoes');
        else setActivePrimaryCategory('dashboard');
    }, [activeView]);

    const handlePrimaryNavClick = (category: PrimaryCategory) => {
        if (category === activePrimaryCategory && !isCollapsed) {
            onToggleCollapse();
        } else {
            setActivePrimaryCategory(category);
            if (isCollapsed) {
                onToggleCollapse(); // Expand if it was collapsed
            }
        }
        
        if (category === 'dashboard' && activeView !== VIEWS.DASHBOARD) {
            setActiveView(VIEWS.DASHBOARD);
        }
    };

    const handleSecondaryNavClick = (view: View) => {
        setActiveView(view);
        setIsMobileOpen(false); // Close sidebar on mobile after navigation
    };
    
    const mainNavItems = [
        { category: 'dashboard' as PrimaryCategory, label: 'Dashboard', icon: <DashboardIcon />, view: VIEWS.DASHBOARD },
        { category: 'financeiro' as PrimaryCategory, label: 'Financeiro', icon: <CashManagementIcon /> },
        { category: 'projetos' as PrimaryCategory, label: 'Projetos', icon: <ProjectsIcon /> },
        { category: 'relatorios' as PrimaryCategory, label: 'Relatórios', icon: <ReportsIcon /> },
        { category: 'configuracoes' as PrimaryCategory, label: 'Ajustes', icon: <SettingsIcon /> },
    ];
    
    const secondaryNavItems: Record<PrimaryCategory, { label: string; view: View; }[]> = {
        dashboard: [],
        financeiro: [
            { label: 'Contas a Pagar', view: VIEWS.PAYABLE },
            { label: 'Contas a Receber', view: VIEWS.RECEIPTS },
            { label: 'Cotação de Preços', view: VIEWS.PRICE_QUOTATIONS },
            { label: 'Conciliação Bancária', view: VIEWS.BANK_RECONCILIATION },
            { label: 'Extrato de Caixa', view: VIEWS.CASH_FLOW_RECORDS },
        ],
        projetos: [
            { label: 'Projetos', view: VIEWS.PROJECTS },
            { label: 'Propostas', view: VIEWS.PROPOSALS },
            { label: 'CRM de Cobrança', view: VIEWS.CRM },
            { label: 'Imóveis', view: VIEWS.PROPERTIES },
        ],
        relatorios: [
            { label: 'Relatórios Gerais', view: VIEWS.REPORTS },
            { label: 'Faturas Emitidas', view: VIEWS.GENERATED_INVOICES },
        ],
        configuracoes: [
            { label: 'Geral', view: VIEWS.SETTINGS },
            { label: 'Contatos', view: VIEWS.CONTACTS },
            { label: 'Contas Bancárias', view: VIEWS.BANK_ACCOUNTS },
            { label: 'Centros de Custo', view: VIEWS.COST_CENTERS },
        ]
    };

  return (
    <>
    {/* Overlay for mobile */}
    {isMobileOpen && <div onClick={() => setIsMobileOpen(false)} className="fixed inset-0 bg-black/30 z-20 md:hidden"></div>}

    <div className={`fixed top-0 left-0 h-full flex z-30 transition-transform duration-300 md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Primary Icon Bar */}
      <div className="w-20 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="flex-shrink-0 p-4 h-20 flex items-center">
           <div className="bg-indigo-600 p-2 rounded-lg">
             <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 12h2v6H8v-6zm3-3h2v9h-2V9zm3-4h2v13h-2V5z"/></svg>
           </div>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
            <ul>
                {mainNavItems.map(item => (
                    <PrimaryNavItem 
                        key={item.category}
                        {...item}
                        isActive={activePrimaryCategory === item.category}
                        onClick={() => handlePrimaryNavClick(item.category)}
                    />
                ))}
            </ul>
        </nav>
      </div>

      {/* Secondary Panel */}
      <div className={`w-52 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ${isCollapsed && activePrimaryCategory !== 'dashboard' ? 'opacity-0 -translate-x-full hidden' : 'opacity-100 translate-x-0'}`}>
        <div className="flex-shrink-0 p-4 flex items-center justify-between h-20">
          <div>
            <h2 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">{mainNavItems.find(i => i.category === activePrimaryCategory)?.label}</h2>
          </div>
          <button onClick={onToggleCollapse} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hidden md:inline-flex" title="Recolher menu">
              <ChevronLeftIcon />
          </button>
        </div>
        <nav className="flex-1 px-4 py-2 space-y-1">
            {secondaryNavItems[activePrimaryCategory]?.map(item => (
                <SecondaryNavItem 
                    key={item.view}
                    label={item.label}
                    view={item.view}
                    isActive={activeView === item.view}
                    onClick={() => handleSecondaryNavClick(item.view)}
                />
            ))}
        </nav>
      </div>
    </div>
    </>
  );
};


// SVG Icons
const iconSize = "w-6 h-6";
const DashboardIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>;
const CashManagementIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>;
const ProjectsIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>;
const ReportsIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>;
const SettingsIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;

const FullscreenEnterIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1v4m0 0h-4m4 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 1v-4m0 0h-4m4 0l-5 5"></path></svg>;
const FullscreenExitIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 14h4v4m-4-4l5 5m11-5h-4v4m4-4l-5 5M4 10h4V6m-4 4l5-5m11 5h-4V6m4 4l-5-5"></path></svg>;
const BellIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const LogoutIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>;
const ChevronLeftIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>;