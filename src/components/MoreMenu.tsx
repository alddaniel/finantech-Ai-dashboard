import React from 'react';
import type { View, Company, User, Role } from '../types';
import { VIEWS } from '../constants';

interface MoreMenuProps {
    isOpen: boolean;
    onClose: () => void;
    activeView: View;
    setActiveView: (view: View) => void;
    company?: Company;
    currentUser: User;
    isAccountantModuleEnabled: boolean;
    onOpenInvoiceModal: () => void;
    installPromptEvent: any;
    onInstallClick: () => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}> = ({ icon, label, onClick }) => {
    const clickHandler = (e: React.MouseEvent) => {
        e.preventDefault();
        onClick();
    };

    return (
        <li>
            <a href="#" onClick={clickHandler} className="flex items-center p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="text-slate-500 dark:text-slate-400">{icon}</div>
                <span className="ml-4 font-semibold text-slate-700 dark:text-slate-200">{label}</span>
            </a>
        </li>
    );
};


export const MoreMenu: React.FC<MoreMenuProps> = ({
    isOpen, onClose, activeView, setActiveView, company, currentUser, isAccountantModuleEnabled, onOpenInvoiceModal, installPromptEvent, onInstallClick
}) => {

    const handleNavigation = (view: View) => {
        setActiveView(view);
        onClose();
    };
    
    const handleInstall = () => {
        onInstallClick();
        onClose();
    };

    const menuItems: Array<{ label: string; view: View; icon: React.ReactNode; roles?: Role[]; module?: 'accountant' | 'properties' | 'fiscal' | 'ai_advisor' | 'integrations' } | 'divider' | 'install_app'> = [
        { label: 'Contatos', view: VIEWS.CONTACTS, icon: <AddressBookIcon /> },
        { label: 'Conciliação Bancária', view: VIEWS.BANK_RECONCILIATION, icon: <ReconciliationIcon /> },
        { label: 'Extrato de Caixa', view: VIEWS.CASH_FLOW_RECORDS, icon: <CashFlowRecordsIcon /> },
        'divider',
        { label: 'Imóveis', view: VIEWS.PROPERTIES, icon: <PropertyIcon />, module: 'properties' },
        { label: 'Contratos', view: VIEWS.CONTRACTS, icon: <ContractIcon />, module: 'properties' },
        'divider',
        { label: 'Relatórios', view: VIEWS.REPORTS, icon: <ReportsIcon /> },
        { label: 'Módulo Fiscal', view: VIEWS.FISCAL_MODULE, icon: <FiscalIcon />, module: 'fiscal' },
        { label: 'Painel Contador', view: VIEWS.ACCOUNTANT_PANEL, icon: <AccountantIcon />, roles: ['Admin', 'Contador'], module: 'accountant' },
        { label: 'Consultor IA', view: VIEWS.AI_ADVISOR, icon: <AIIcon />, module: 'ai_advisor' },
        'divider',
        'install_app',
        { label: 'Configurações', view: VIEWS.SETTINGS, icon: <SettingsIcon /> },
        { label: 'Ajuda', view: VIEWS.HELP, icon: <HelpIcon /> },
    ];

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity md:hidden ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-2xl shadow-lg z-50 transition-transform duration-300 ease-in-out md:hidden ${
                    isOpen ? 'translate-y-0' : 'translate-y-full'
                }`}
            >
                <div className="p-2">
                    <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />
                </div>

                <nav className="p-4 max-h-[60vh] overflow-y-auto">
                    <ul className="space-y-1">
                        {menuItems.map((item, index) => {
                             if (item === 'divider') {
                                return <li key={`divider-${index}`}><hr className="my-2 border-slate-200 dark:border-slate-800" /></li>;
                            }
                            if (item === 'install_app') {
                                return installPromptEvent ? (
                                    <NavItem
                                        key="install_app"
                                        label="Instalar App"
                                        icon={<DownloadAppIcon />}
                                        onClick={handleInstall}
                                    />
                                ) : null;
                            }
                            if (item.module === 'accountant' && !isAccountantModuleEnabled) return null;
                            if (item.module === 'properties' && !company?.enabledModules.includes('properties')) return null;
                            if (item.module === 'fiscal' && !company?.enabledModules.includes('fiscal')) return null;
                            if (item.module === 'ai_advisor' && !company?.enabledModules.includes('ai_advisor')) return null;
                            if (item.roles && !item.roles.includes(currentUser.role)) return null;

                            return (
                                <NavItem
                                    key={item.view}
                                    label={item.label}
                                    icon={item.icon}
                                    onClick={() => handleNavigation(item.view)}
                                />
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </>
    );
};


// SVG Icons
const iconSize = "w-6 h-6";
const ReconciliationIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>;
const CashFlowRecordsIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>;
const AddressBookIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;
const ReportsIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>;
const AIIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const FiscalIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-4m-3 4h.01M9 14h.01M5 7h.01M5 11h.01M5 15h.01M19 7h-.01M19 11h-.01M19 15h.01M12 21a9 9 0 110-18 9 9 0 010 18z"></path></svg>;
const AccountantIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;
const PropertyIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V10a2 2 0 00-2-2H7a2 2 0 00-2 2v11m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 21v-6a2 2 0 012-2h2a2 2 0 012 2v6"></path></svg>;
const ContractIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>;
const SettingsIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;
const HelpIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const DownloadAppIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4 4m0 0l-4-4m4 4V4"></path></svg>;