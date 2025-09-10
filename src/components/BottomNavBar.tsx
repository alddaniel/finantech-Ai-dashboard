import React, { useState } from 'react';
import type { View, Company, User, Role } from '../types';
import { VIEWS } from '../constants';
import { MoreMenu } from './MoreMenu';

interface BottomNavBarProps {
    activeView: View;
    setActiveView: (view: View) => void;
    onOpenInvoiceModal: () => void;
    company?: Company;
    currentUser: User;
    isAccountantModuleEnabled: boolean;
    installPromptEvent: any;
    onInstallClick: () => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
            isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
        aria-current={isActive ? 'page' : undefined}
    >
        {icon}
        <span className="text-[10px] font-bold mt-1">{label}</span>
    </button>
);

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeView, setActiveView, onOpenInvoiceModal, company, currentUser, isAccountantModuleEnabled, installPromptEvent, onInstallClick }) => {
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 md:hidden z-40">
                <div className="grid grid-cols-5 h-full">
                    <NavItem
                        label="Dashboard"
                        icon={<DashboardIcon />}
                        isActive={activeView === 'dashboard'}
                        onClick={() => setActiveView('dashboard')}
                    />
                    <NavItem
                        label="Pagar"
                        icon={<PayableIcon />}
                        isActive={activeView === 'payable'}
                        onClick={() => setActiveView('payable')}
                    />
                    <NavItem
                        label="Receber"
                        icon={<ReceivableIcon />}
                        isActive={activeView === 'receipts'}
                        onClick={() => setActiveView('receipts')}
                    />
                     <NavItem
                        label="Projetos"
                        icon={<ProjectsIcon />}
                        isActive={activeView === 'projects' || activeView === 'proposals'}
                        onClick={() => setActiveView('projects')}
                    />
                    <NavItem
                        label="Mais"
                        icon={<MoreIcon />}
                        isActive={isMoreMenuOpen}
                        onClick={() => setIsMoreMenuOpen(true)}
                    />
                </div>
            </div>
            <MoreMenu 
                isOpen={isMoreMenuOpen}
                onClose={() => setIsMoreMenuOpen(false)}
                activeView={activeView}
                setActiveView={setActiveView}
                company={company}
                currentUser={currentUser}
                isAccountantModuleEnabled={isAccountantModuleEnabled}
                onOpenInvoiceModal={onOpenInvoiceModal}
                installPromptEvent={installPromptEvent}
                onInstallClick={onInstallClick}
            />
        </>
    );
};

// --- ICONS ---
const iconSize = "w-6 h-6";
const DashboardIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>;
const PayableIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>;
const ReceivableIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>;
const ProjectsIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>;
const MoreIcon = () => <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>;