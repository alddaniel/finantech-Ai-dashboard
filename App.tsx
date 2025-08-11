
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AccountsPayable } from './components/AccountsPayable';
import { Receipts } from './components/Receipts';
import { CashManagement } from './components/CashManagement';
import { Reports } from './components/Reports';
import { AIFinancialAdvisor } from './components/AIFinancialAdvisor';
import { InvoiceGenerator } from './components/InvoiceGenerator';
import { FiscalModule } from './components/FiscalModule';
import { FinancialCRM } from './components/FinancialCRM';
import { Integrations } from './components/Integrations';
import { UserManagement } from './components/UserManagement';
import { Contacts } from './components/Contacts';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Help } from './components/Help';
import { GeneratedInvoices } from './components/GeneratedInvoices';
import { AccountantPanel } from './components/AccountantPanel';
import { BankAccounts } from './components/BankAccounts';
import { Recurrences } from './components/Recurrences';
import { PayableRecurrences } from './components/PayableRecurrences';
import { PaymentSchedule } from './components/PaymentSchedule';
import { CashFlowRecords } from './components/CashFlowRecords';
import type { View, Company, User, AuditLog, Contact, Transaction, AccountantRequest, BankAccount, BankTransaction, DebtorCustomer } from './types';
import { VIEWS, MOCK_AUDIT_LOGS } from './constants';
import * as apiService from './services/apiService';


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => apiService.getIsAuthenticated());
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  
  const [companies, setCompanies] = useState<Company[]>(() => apiService.getCompanies());
  const [users, setUsers] = useState<User[]>(() => apiService.getUsers());
  
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [contacts, setContacts] = useState<Contact[]>(() => apiService.getContacts());

  // Centralized state for transactions
  const [payables, setPayables] = useState<Transaction[]>(() => apiService.getPayables());
  const [receivables, setReceivables] = useState<Transaction[]>(() => apiService.getReceivables());
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => apiService.getBankAccounts());
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(() => apiService.getBankTransactions());

  const [activeView, setActiveView] = useState<View>(VIEWS.DASHBOARD);
  
  // State for Invoice Modal, which can be triggered from multiple places
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceInitialData, setInvoiceInitialData] = useState<{ customer: string; amount: number; } | { receivableToEdit: Transaction } | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(() => apiService.getCurrentUser(users));
  const [selectedCompany, setSelectedCompany] = useState<string>(() => apiService.getSelectedCompany(companies));
  
  // Add-on Modules State
  const [isAccountantModuleEnabled, setIsAccountantModuleEnabled] = useState<boolean>(() => apiService.getIsAccountantModuleEnabled());
  const [accountantRequests, setAccountantRequests] = useState<AccountantRequest[]>(() => apiService.getAccountantRequests());

  // Systematically persist all key states to our abstracted service layer.
  useEffect(() => { apiService.saveCompanies(companies); }, [companies]);
  useEffect(() => { apiService.saveUsers(users); }, [users]);
  useEffect(() => { apiService.saveContacts(contacts); }, [contacts]);
  useEffect(() => { apiService.saveIsAuthenticated(isAuthenticated); }, [isAuthenticated]);
  useEffect(() => { apiService.saveSelectedCompany(selectedCompany); }, [selectedCompany]);
  useEffect(() => { apiService.savePayables(payables); }, [payables]);
  useEffect(() => { apiService.saveReceivables(receivables); }, [receivables]);
  useEffect(() => { apiService.saveCurrentUser(currentUser); }, [currentUser]);
  useEffect(() => { apiService.saveIsAccountantModuleEnabled(isAccountantModuleEnabled); }, [isAccountantModuleEnabled]);
  useEffect(() => { apiService.saveAccountantRequests(accountantRequests); }, [accountantRequests]);
  useEffect(() => { apiService.saveBankAccounts(bankAccounts); }, [bankAccounts]);
  useEffect(() => { apiService.saveBankTransactions(bankTransactions); }, [bankTransactions]);
  
  // When user logs in or out, adjust the selected company
  useEffect(() => {
    if (currentUser) {
        if (!currentUser.accessibleCompanies.includes(selectedCompany)) {
            const firstCompany = currentUser.accessibleCompanies[0] || '';
            setSelectedCompany(firstCompany);
        }
    }
  }, [currentUser, selectedCompany]);


  const handleLoginSuccess = (user: User) => {
      setCurrentUser(user);
      setIsAuthenticated(true);
      if (user.accessibleCompanies.length > 0) {
        setSelectedCompany(user.accessibleCompanies[0]);
      }
  }

  const handleLogout = () => {
      setIsAuthenticated(false);
      setCurrentUser(null);
  }

  const handleRegisterSuccess = (newUser: User, newCompany: Company) => {
    const updatedUsers = [...users, newUser];
    const updatedCompanies = [...companies, newCompany];

    setUsers(updatedUsers);
    setCompanies(updatedCompanies);
    
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setSelectedCompany(newCompany.name);
  };

  const openInvoiceModal = (data: { customer: string; amount: number; } | { receivableToEdit: Transaction } | null = null) => {
    setInvoiceInitialData(data);
    setIsInvoiceModalOpen(true);
  };

  const handleGenerateInvoiceFromCRM = (debtor: DebtorCustomer) => {
    openInvoiceModal({
      customer: debtor.name,
      amount: debtor.totalDebt,
    });
  };

  const renderContent = () => {
    switch (activeView) {
      case VIEWS.DASHBOARD:
        return <Dashboard 
                  setActiveView={setActiveView} 
                  selectedCompany={selectedCompany} 
                  payables={payables} 
                  receivables={receivables}
                  accountantRequests={accountantRequests}
                  setAccountantRequests={setAccountantRequests}
                  currentUser={currentUser!}
                  isAccountantModuleEnabled={isAccountantModuleEnabled}
                  bankAccounts={bankAccounts}
                  bankTransactions={bankTransactions}
                  onOpenInvoiceModal={() => openInvoiceModal()}
                />;
      case VIEWS.PAYABLE:
        return <AccountsPayable 
                  selectedCompany={selectedCompany} 
                  payables={payables} 
                  setPayables={setPayables}
                  contacts={contacts} 
               />;
      case VIEWS.PAYABLE_RECURRENCES:
        return <PayableRecurrences 
                  payables={payables}
                  setPayables={setPayables}
                  selectedCompany={selectedCompany}
                />;
      case VIEWS.PAYMENT_SCHEDULE:
        return <PaymentSchedule payables={payables} selectedCompany={selectedCompany} setActiveView={setActiveView} />;
      case VIEWS.RECEIPTS:
        return <Receipts 
                  selectedCompany={selectedCompany} 
                  receivables={receivables} 
                  setReceivables={setReceivables}
                  onOpenInvoiceModal={openInvoiceModal}
                />;
      case VIEWS.RECURRENCES:
        return <Recurrences 
                  receivables={receivables} 
                  selectedCompany={selectedCompany} 
                  setReceivables={setReceivables} 
                />;
      case VIEWS.CASH_MANAGEMENT:
        return <CashManagement selectedCompany={selectedCompany} payables={payables} receivables={receivables} />;
      case VIEWS.CASH_FLOW_RECORDS:
        return <CashFlowRecords 
                  payables={payables}
                  receivables={receivables}
                  selectedCompany={selectedCompany}
                />;
      case VIEWS.BANK_ACCOUNTS:
        return <BankAccounts 
                  selectedCompany={selectedCompany} 
                  bankAccounts={bankAccounts} 
                  setBankAccounts={setBankAccounts}
                  bankTransactions={bankTransactions}
               />;
      case VIEWS.REPORTS:
        return <Reports selectedCompany={selectedCompany} payables={payables} contacts={contacts} />;
      case VIEWS.AI_ADVISOR:
        return <AIFinancialAdvisor payables={payables} receivables={receivables} selectedCompany={selectedCompany} />;
       case VIEWS.FISCAL_MODULE:
        return <FiscalModule />;
      case VIEWS.CRM:
        return <FinancialCRM selectedCompany={selectedCompany} onGenerateInvoice={handleGenerateInvoiceFromCRM} />;
      case VIEWS.INTEGRATIONS:
        return <Integrations isAccountantModuleEnabled={isAccountantModuleEnabled} setIsAccountantModuleEnabled={setIsAccountantModuleEnabled} />;
       case VIEWS.USER_MANAGEMENT:
        return <UserManagement 
                    users={users} 
                    setUsers={setUsers} 
                    companies={companies} 
                    setCompanies={setCompanies} 
                    auditLogs={auditLogs}
                    isAccountantModuleEnabled={isAccountantModuleEnabled}
                />;
       case VIEWS.CONTACTS:
        return <Contacts contacts={contacts} setContacts={setContacts} selectedCompany={selectedCompany} />;
      case VIEWS.GENERATED_INVOICES:
        return <GeneratedInvoices 
                  selectedCompany={selectedCompany} 
                  receivables={receivables} 
                  setReceivables={setReceivables}
                  onOpenInvoiceModal={openInvoiceModal}
                />;
      case VIEWS.HELP:
        return <Help />;
      case VIEWS.ACCOUNTANT_PANEL:
        return <AccountantPanel 
                  users={users}
                  companies={companies}
                  accountantRequests={accountantRequests}
                  setAccountantRequests={setAccountantRequests}
                  currentUser={currentUser!}
                />;
      default:
        return <Dashboard 
                setActiveView={setActiveView} 
                selectedCompany={selectedCompany} 
                payables={payables} 
                receivables={receivables}
                accountantRequests={accountantRequests}
                setAccountantRequests={setAccountantRequests}
                currentUser={currentUser!}
                isAccountantModuleEnabled={isAccountantModuleEnabled}
                bankAccounts={bankAccounts}
                bankTransactions={bankTransactions}
                onOpenInvoiceModal={() => openInvoiceModal()}
              />;
    }
  };

  if (!isAuthenticated || !currentUser) {
    if (authView === 'register') {
      return <Register users={users} onRegisterSuccess={handleRegisterSuccess} onSwitchToLogin={() => setAuthView('login')} />;
    }
    return (
      <Login 
        users={users} 
        onLoginSuccess={handleLoginSuccess} 
        onSwitchToRegister={() => setAuthView('register')} 
      />
    );
  }

  return (
    <div className="flex h-screen text-gray-800 dark:text-gray-200 print:block">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        selectedCompany={selectedCompany} 
        setSelectedCompany={setSelectedCompany}
        companies={companies}
        currentUser={currentUser}
        onLogout={handleLogout}
        className="print-hide"
        isAccountantModuleEnabled={isAccountantModuleEnabled}
        onOpenInvoiceModal={() => openInvoiceModal()}
      />
      <main className="flex-1 overflow-y-auto p-6 md:p-8 print:overflow-visible print:p-0">
        {renderContent()}
      </main>

      {isInvoiceModalOpen && (
          <InvoiceGenerator
              isOpen={isInvoiceModalOpen}
              onClose={() => {
                  setIsInvoiceModalOpen(false);
                  setInvoiceInitialData(null);
              }}
              contacts={contacts}
              setContacts={setContacts}
              receivables={receivables}
              setReceivables={setReceivables}
              selectedCompany={selectedCompany}
              initialData={invoiceInitialData}
          />
      )}
    </div>
  );
}
