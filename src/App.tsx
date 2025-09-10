import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { Help } from './components/Help';
import { GeneratedInvoices } from './components/GeneratedInvoices';
import { AccountantPanel } from './components/AccountantPanel';
import { BankAccounts } from './components/BankAccounts';
import { BankReconciliation } from './components/BankReconciliation';
import { Recurrences } from './components/Recurrences';
import { PayableRecurrences } from './components/PayableRecurrences';
import { PaymentSchedule } from './components/PaymentSchedule';
import { ReceivableSchedule } from './components/ReceivableSchedule';
import { CashFlowRecords } from './components/CashFlowRecords';
import { Properties } from './components/Properties';
import { Projects } from './components/Projects';
import { Proposals } from './components/Proposals';
import { SchemaGenerator } from './components/SchemaGenerator';
import { PaymentConfirmationModal } from './components/PaymentConfirmationModal';
import { ExpenseModal } from './components/ExpenseModal';
import { ProjectModal } from './components/ProjectModal';
import { ProposalModal } from './components/ProposalModal';
import { AutomatedNotificationManager } from './components/AutomatedNotificationManager';
import { ToastContainer } from './components/ToastContainer';
import { AdminPanel } from './components/AdminPanel';
import { NotificationCenter } from './components/NotificationCenter';
import { CostCenters } from './components/CostCenters';
import { CompanyProfile } from './components/CompanyProfile';
import { PlanSubscription } from './components/PlanSubscription';
import { Settings } from './components/Settings';
import { Categories } from './components/Categories';
import { Indexes } from './components/Indexes';
import { QRCodeModal } from './components/QRCodeModal';
import { Spinner } from './components/ui/Spinner';
import type { View, Company, User, AuditLog, Contact, Transaction, AccountantRequest, BankAccount, BankTransaction, DebtorCustomer, Property, ToastMessage, Notification, SystemTransaction, CostCenter, Category, AdjustmentIndex, Project, Proposal } from './types';
import { VIEWS, MOCK_AUDIT_LOGS } from './constants';
import * as apiService from './services/apiService';


export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => apiService.getIsAuthenticated());
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [adjustmentIndexes, setAdjustmentIndexes] = useState<AdjustmentIndex[]>([]);
  const [customAvatars, setCustomAvatars] = useState<string[]>([]);

  // Centralized state for transactions
  const [payables, setPayables] = useState<Transaction[]>([]);
  const [receivables, setReceivables] = useState<Transaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [systemTransactions, setSystemTransactions] = useState<SystemTransaction[]>([]);


  const [activeView, setActiveView] = useState<View>(VIEWS.DASHBOARD);
  
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceInitialData, setInvoiceInitialData] = useState<{ customer: string; amount: number; } | { receivableToEdit: Transaction } | null>(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Transaction | null>(null);
  
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [proposalForProject, setProposalForProject] = useState<Proposal | null>(null);

  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [proposalToEdit, setProposalToEdit] = useState<Proposal | null>(null);

  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  const [transactionForQRCode, setTransactionForQRCode] = useState<Transaction | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  
  const [isAccountantModuleEnabled, setIsAccountantModuleEnabled] = useState<boolean>(false);
  const [accountantRequests, setAccountantRequests] = useState<AccountantRequest[]>([]);

  const [isDesiredFullscreen, setIsDesiredFullscreen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  
  const [isConfirmPaymentModalOpen, setIsConfirmPaymentModalOpen] = useState(false);
  const [transactionToConfirm, setTransactionToConfirm] = useState<Transaction | null>(null);
  
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [isSuperAdminView, setIsSuperAdminView] = useState<boolean>(false);

  // Initial Data Load
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await apiService.fetchAllInitialData();
        setCompanies(data.companies);
        setUsers(data.users);
        setContacts(data.contacts);
        setProperties(data.properties);
        setProjects(data.projects);
        setProposals(data.proposals);
        setCostCenters(data.costCenters);
        setCategories(data.categories);
        setAdjustmentIndexes(data.adjustmentIndexes);
        setCustomAvatars(data.customAvatars);
        setPayables(data.payables);
        setReceivables(data.receivables);
        setBankAccounts(data.bankAccounts);
        setBankTransactions(data.bankTransactions);
        setSystemTransactions(data.systemTransactions);
        setNotifications(data.notifications);
        setIsAccountantModuleEnabled(data.isAccountantModuleEnabled);

        const storedUser = apiService.getCurrentUser(data.users);
        if (storedUser) {
          setCurrentUser(storedUser);
          setSelectedCompany(apiService.getSelectedCompany(data.companies));
        }

      } catch (error) {
        console.error("Failed to load initial data", error);
        addToast({type: 'warning', title: 'Erro de Carregamento', description: 'Não foi possível carregar os dados.'});
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
        loadData();
    } else {
        setIsLoading(false);
    }
  }, [isAuthenticated]);


  // Persist key states whenever they change
  useEffect(() => { if (!isLoading) apiService.saveCompanies(companies); }, [companies, isLoading]);
  useEffect(() => { if (!isLoading) apiService.saveUsers(users); }, [users, isLoading]);
  useEffect(() => { if (!isLoading) apiService.saveContacts(contacts); }, [contacts, isLoading]);
  useEffect(() => { if (!isLoading) apiService.saveProperties(properties); }, [properties, isLoading]);
  useEffect(() => { if (!isLoading) apiService.saveProjects(projects); }, [projects, isLoading]);
  useEffect(() => { if (!isLoading) apiService.saveProposals(proposals); }, [proposals, isLoading]);
  useEffect(() => { if (!isLoading) apiService.saveCostCenters(costCenters); }, [costCenters, isLoading]);
  useEffect(() => { if (!isLoading) apiService.saveCategories(categories); }, [categories, isLoading]);
  useEffect(() => { if (!isLoading) apiService.saveAdjustmentIndexes(adjustmentIndexes); }, [adjustmentIndexes, isLoading]);
  useEffect(() => { if (!isLoading) apiService.saveCustomAvatars(customAvatars); }, [customAvatars, isLoading]);
  useEffect(() => { if (!isLoading) apiService.saveIsAuthenticated(isAuthenticated); }, [isAuthenticated, isLoading]);
  useEffect(() => { if (!isLoading) apiService.saveSelectedCompany(selectedCompany); }, [selectedCompany, isLoading]);
  useEffect(() => { if (!isLoading) apiService.savePayables(payables); }, [payables, isLoading]);
  useEffect(() => { if (!isLoading) apiService.saveReceivables(receivables); }, [receivables, isLoading]);
  useEffect(() => { if (!isLoading) apiService.saveCurrentUser(currentUser); }, [currentUser, isLoading]);
  useEffect(() => { if (!isLoading) apiService.saveIsAccountantModuleEnabled(isAccountantModuleEnabled); }, [isAccountantModuleEnabled, isLoading]);
  useEffect(() => { if (!isLoading) apiService.saveAccountantRequests(accountantRequests); }, [accountantRequests, isLoading]);
  useEffect(() => { if (!isLoading) apiService.saveBankAccounts(bankAccounts); }, [bankAccounts, isLoading]);
  useEffect(() => { if (!isLoading) apiService.saveBankTransactions(bankTransactions); }, [bankTransactions, isLoading]);
  useEffect(() => { if (!isLoading) apiService.saveSystemTransactions(systemTransactions); }, [systemTransactions, isLoading]);
  useEffect(() => { if (!isLoading) apiService.saveNotifications(notifications); }, [notifications, isLoading]);

  
  useEffect(() => {
    if (currentUser) {
        if (!currentUser.accessibleCompanies.includes(selectedCompany)) {
            const firstCompany = currentUser.accessibleCompanies[0] || '';
            setSelectedCompany(firstCompany);
        }
    }
  }, [currentUser, selectedCompany]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement) {
        setIsDesiredFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      if (isDesiredFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.error(`Error attempting to re-enter fullscreen: ${err.message}`);
        });
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isDesiredFullscreen]);
  
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const newToast: ToastMessage = { ...toast, id: Date.now() };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };
  
  const handleSuperAdminLogout = () => {
      setIsSuperAdminView(false);
      setIsAuthenticated(false);
  };

  const handleLoginSuccess = (user: User, company: string) => {
    setIsLoading(true);
    setCurrentUser(user);
    setSelectedCompany(company);
    setIsAuthenticated(true);
  };
  
  const handleSuperAdminLoginSuccess = (user: User) => {
      setIsLoading(true);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setIsSuperAdminView(true);
  };
  
  const handleOpenInvoiceModal = useCallback((data?: { customer: string; amount: number; } | { receivableToEdit: Transaction } | null) => {
    setInvoiceInitialData(data || null);
    setIsInvoiceModalOpen(true);
  }, []);

  const handleOpenExpenseModal = useCallback((expense: Transaction | null) => {
    setExpenseToEdit(expense);
    setIsExpenseModalOpen(true);
  }, []);

  const handleOpenProjectModal = useCallback((project: Project | null, fromProposal?: Proposal | null) => {
    setProjectToEdit(project);
    setProposalForProject(fromProposal || null);
    setIsProjectModalOpen(true);
  }, []);

  const handleOpenProposalModal = useCallback((proposal?: Proposal | null) => {
    setProposalToEdit(proposal || null);
    setIsProposalModalOpen(true);
  }, []);

  const handleOpenConfirmPaymentModal = useCallback((transaction: Transaction) => {
    setTransactionToConfirm(transaction);
    setIsConfirmPaymentModalOpen(true);
  }, []);
  
  const handleOpenQRCodeModal = useCallback((transaction: Transaction) => {
      setTransactionForQRCode(transaction);
      setIsQRCodeModalOpen(true);
  }, []);

  const handleSaveExpense = async (expenseData: Transaction) => {
    let updatedPayables;
    if (expenseToEdit) {
      updatedPayables = payables.map(p => p.id === expenseData.id ? expenseData : p);
      addToast({ type: 'success', title: 'Sucesso!', description: 'Despesa atualizada com sucesso.' });
    } else {
      updatedPayables = [...payables, { ...expenseData, id: `p${Date.now()}` }];
      addToast({ type: 'success', title: 'Sucesso!', description: 'Nova despesa adicionada.' });
    }
    setPayables(updatedPayables);
    await apiService.savePayables(updatedPayables);
    setIsExpenseModalOpen(false);
  };
  
  const handleSaveMultipleExpenses = async (expenses: Omit<Transaction, 'id'>[]) => {
      const newPayables = expenses.map((exp, index) => ({
        ...exp,
        id: `p${Date.now() + index}`
      }));
      const updatedPayables = [...payables, ...newPayables];
      setPayables(updatedPayables);
      await apiService.savePayables(updatedPayables);
  };

  const handleSaveProject = async (projectData: Project, generateInvoice: boolean) => {
      const isNew = !projectToEdit;
      const finalProject = isNew ? { ...projectData, id: `proj${Date.now()}` } : projectData;

      const costCenterExists = costCenters.some(cc => cc.name === finalProject.costCenterName && cc.company === finalProject.company);
      if (!costCenterExists && finalProject.costCenterName) {
          const newCostCenter: CostCenter = {
              id: `cc_proj_${finalProject.id || Date.now()}`,
              name: finalProject.costCenterName,
              description: `Centro de custo para o projeto ${finalProject.name}`,
              company: finalProject.company,
          };
          const updatedCostCenters = [...costCenters, newCostCenter];
          setCostCenters(updatedCostCenters);
          await apiService.saveCostCenters(updatedCostCenters);
          addToast({
              type: 'info',
              title: 'Centro de Custo Criado',
              description: `Centro de custo "${newCostCenter.name}" foi criado automaticamente.`
          });
      }

      const updatedProjects = isNew ? [...projects, finalProject] : projects.map(p => p.id === finalProject.id ? finalProject : p);
      setProjects(updatedProjects);
      await apiService.saveProjects(updatedProjects);
      
      if (isNew && generateInvoice) {
           const totalBudget = finalProject.budget.reduce((sum, item) => sum + item.cost, 0);
           const contact = contacts.find(c => c.id === finalProject.clientId);
           if (contact && totalBudget > 0) {
                handleOpenInvoiceModal({ customer: contact.name, amount: totalBudget });
           }
      }

       addToast({
            type: 'success',
            title: 'Projeto Salvo!',
            description: `Os dados do projeto "${finalProject.name}" foram salvos.`
        });
  };

  const handleConfirmPayment = async (transactionId: string, amount: number, paymentDate: string, paymentMethod: string) => {
    let wasUpdated = false;

    const newPayables = payables.map(t => {
        if (t.id === transactionId) {
            wasUpdated = true;
            return { ...t, status: 'Pago' as const, amount, paymentDate, paymentMethod };
        }
        return t;
    });

    if(wasUpdated) {
        setPayables(newPayables);
        await apiService.savePayables(newPayables);
        addToast({ type: 'success', title: 'Pagamento Realizado!', description: 'A despesa foi marcada como paga.' });
    } else {
        const newReceivables = receivables.map(t => {
            if (t.id === transactionId) {
                wasUpdated = true;
                return { ...t, status: 'Pago' as const, amount, paymentDate, paymentMethod };
            }
            return t;
        });
        if(wasUpdated) {
            setReceivables(newReceivables);
            await apiService.saveReceivables(newReceivables);
            addToast({ type: 'success', title: 'Recebimento Realizado!', description: 'A receita foi marcada como recebida.' });
        }
    }
    setIsConfirmPaymentModalOpen(false);
  };
  
  const handleSaveProposal = async (proposalData: Proposal) => {
        let updatedProposals;
        if (proposalToEdit) {
            updatedProposals = proposals.map(p => p.id === proposalToEdit.id ? { ...proposalToEdit, ...proposalData } : p);
        } else {
            const newProposal = {
                ...proposalData,
                id: `prop-${Date.now()}`,
                createdAt: new Date().toISOString(),
            };
            updatedProposals = [...proposals, newProposal];
        }
        setProposals(updatedProposals);
        await apiService.saveProposals(updatedProposals);
    };
  
  const currentCompany = useMemo(() => companies.find(c => c.name === selectedCompany), [companies, selectedCompany]);

  const handleNotificationClick = (notification: Notification) => {
    const { type } = notification;
    
    switch(type) {
        case 'overdue_payable': setActiveView(VIEWS.PAYABLE); break;
        case 'overdue_receivable': setActiveView(VIEWS.RECEIPTS); break;
        case 'accountant_request': setActiveView(VIEWS.ACCOUNTANT_PANEL); break;
        case 'payment_due_today':
            setActiveView(payables.some(p => p.id === notification.entityId) ? VIEWS.PAYMENT_SCHEDULE : VIEWS.RECEIVABLE_SCHEDULE);
            break;
        default: break;
    }
    
    const newNotifications = notifications.map(n => n.id === notification.id ? {...n, isRead: true} : n);
    setNotifications(newNotifications);
    apiService.saveNotifications(newNotifications);
    setIsNotificationsOpen(false);
  }

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-100 dark:bg-slate-900">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login users={users} onLoginSuccess={handleLoginSuccess} onSuperAdminLoginSuccess={handleSuperAdminLoginSuccess} />;
  }
  
  if (isSuperAdminView) {
      return <AdminPanel 
        companies={companies}
        setCompanies={setCompanies}
        users={users}
        setUsers={setUsers}
        onLogout={handleSuperAdminLogout}
        currentUser={currentUser!}
        payables={payables}
        receivables={receivables}
        addToast={addToast}
      />;
  }
  
  const renderActiveView = () => {
    switch(activeView) {
      case VIEWS.DASHBOARD: return <Dashboard 
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
        onOpenInvoiceModal={handleOpenInvoiceModal}
        onOpenConfirmPaymentModal={handleOpenConfirmPaymentModal}
        onOpenQRCodeModal={handleOpenQRCodeModal}
      />;
      case VIEWS.PAYABLE: return <AccountsPayable 
        selectedCompany={selectedCompany} 
        payables={payables}
        setPayables={setPayables}
        contacts={contacts}
        setContacts={setContacts}
        properties={properties}
        onOpenExpenseModal={handleOpenExpenseModal} 
        onOpenConfirmPaymentModal={handleOpenConfirmPaymentModal} 
        bankAccounts={bankAccounts}
        addToast={addToast}
      />;
      case VIEWS.RECEIPTS: return <Receipts 
        selectedCompany={selectedCompany} 
        receivables={receivables} 
        setReceivables={setReceivables} 
        onOpenInvoiceModal={handleOpenInvoiceModal}
        onOpenConfirmPaymentModal={handleOpenConfirmPaymentModal}
        contacts={contacts}
        properties={properties}
        bankAccounts={bankAccounts}
        onOpenQRCodeModal={handleOpenQRCodeModal}
        addToast={addToast}
      />;
      case VIEWS.REPORTS: return <Reports
          selectedCompany={selectedCompany}
          payables={payables}
          setPayables={setPayables}
          receivables={receivables}
          setReceivables={setReceivables}
          contacts={contacts}
          setContacts={setContacts}
          properties={properties}
          onOpenExpenseModal={handleOpenExpenseModal}
          onOpenConfirmPaymentModal={handleOpenConfirmPaymentModal}
          onOpenInvoiceModal={handleOpenInvoiceModal}
          bankAccounts={bankAccounts}
          projects={projects}
          setProjects={setProjects}
          onOpenProjectModal={handleOpenProjectModal}
          categories={categories}
          onOpenQRCodeModal={handleOpenQRCodeModal}
          addToast={addToast}
        />;
      case VIEWS.AI_ADVISOR: return <AIFinancialAdvisor payables={payables} receivables={receivables} selectedCompany={selectedCompany} />;
      case VIEWS.FISCAL_MODULE: return <FiscalModule company={currentCompany} />;
      case VIEWS.CRM: return <FinancialCRM 
        selectedCompany={selectedCompany} 
        onGenerateInvoice={(debtor) => handleOpenInvoiceModal({ customer: debtor.name, amount: debtor.totalDebt })}
        receivables={receivables}
        contacts={contacts}
      />;
      case VIEWS.CONTACTS: return <Contacts 
          contacts={contacts} 
          setContacts={setContacts} 
          selectedCompany={selectedCompany} 
          company={currentCompany}
          customAvatars={customAvatars}
          setCustomAvatars={setCustomAvatars}
          payables={payables}
          receivables={receivables}
          addToast={addToast}
        />;
      case VIEWS.USER_MANAGEMENT: return <UserManagement 
        companies={companies} 
        setCompanies={setCompanies} 
        users={users} 
        setUsers={setUsers} 
        auditLogs={auditLogs}
        isAccountantModuleEnabled={isAccountantModuleEnabled} 
        selectedCompany={selectedCompany}
        currentUser={currentUser!}
        setActiveView={setActiveView}
        addToast={addToast}
      />;
      case VIEWS.GENERATED_INVOICES: return <GeneratedInvoices 
        selectedCompany={selectedCompany} 
        receivables={receivables}
        setReceivables={setReceivables}
        onOpenInvoiceModal={handleOpenInvoiceModal}
        addToast={addToast}
      />;
       case VIEWS.ACCOUNTANT_PANEL: return <AccountantPanel 
          users={users} 
          companies={companies} 
          accountantRequests={accountantRequests}
          setAccountantRequests={setAccountantRequests}
          currentUser={currentUser!}
        />;
      case VIEWS.BANK_ACCOUNTS: return <BankAccounts 
          bankAccounts={bankAccounts} 
          setBankAccounts={setBankAccounts} 
          selectedCompany={selectedCompany}
          bankTransactions={bankTransactions}
          setActiveView={setActiveView}
          addToast={addToast}
        />;
      case VIEWS.BANK_RECONCILIATION: return <BankReconciliation 
          bankTransactions={bankTransactions}
          systemTransactions={systemTransactions}
          setSystemTransactions={setSystemTransactions}
          bankAccounts={bankAccounts}
          selectedCompany={selectedCompany}
        />;
      case VIEWS.RECURRENCES: return <Recurrences 
          receivables={receivables} 
          selectedCompany={selectedCompany}
          setReceivables={setReceivables}
          addToast={addToast}
        />;
      case VIEWS.PAYABLE_RECURRENCES: return <PayableRecurrences 
        payables={payables}
        selectedCompany={selectedCompany}
        setPayables={setPayables}
        addToast={addToast}
      />;
      case VIEWS.PAYMENT_SCHEDULE: return <PaymentSchedule 
          payables={payables}
          setPayables={setPayables}
          selectedCompany={selectedCompany}
          setActiveView={setActiveView}
          contacts={contacts}
          onOpenExpenseModal={handleOpenExpenseModal}
          bankAccounts={bankAccounts}
        />;
      case VIEWS.RECEIVABLE_SCHEDULE: return <ReceivableSchedule 
          receivables={receivables}
          setReceivables={setReceivables}
          selectedCompany={selectedCompany}
          setActiveView={setActiveView}
          contacts={contacts}
          onOpenInvoiceModal={handleOpenInvoiceModal}
          bankAccounts={bankAccounts}
          onOpenQRCodeModal={handleOpenQRCodeModal}
        />;
      case VIEWS.CASH_FLOW_RECORDS: return <CashFlowRecords 
          payables={payables} 
          receivables={receivables} 
          selectedCompany={selectedCompany}
        />;
      case VIEWS.PROPERTIES: return <Properties
        properties={properties}
        setProperties={setProperties}
        contacts={contacts}
        payables={payables}
        setPayables={setPayables}
        receivables={receivables}
        setReceivables={setReceivables}
        selectedCompany={selectedCompany}
        adjustmentIndexes={adjustmentIndexes}
        addToast={addToast}
        customAvatars={customAvatars}
        setCustomAvatars={setCustomAvatars}
       />;
       case VIEWS.PROJECTS: return <Projects
        projects={projects}
        setProjects={setProjects}
        contacts={contacts}
        payables={payables}
        receivables={receivables}
        selectedCompany={selectedCompany}
        onOpenProjectModal={handleOpenProjectModal}
        addToast={addToast}
        />;
       case VIEWS.PROPOSALS: return <Proposals
        proposals={proposals}
        setProposals={setProposals}
        contacts={contacts}
        selectedCompany={selectedCompany}
        onOpenProposalModal={handleOpenProposalModal}
        onOpenProjectModal={handleOpenProjectModal}
        addToast={addToast}
        />;
      case VIEWS.SCHEMA_GENERATOR: return <SchemaGenerator />;
      case VIEWS.COST_CENTERS: return <CostCenters 
        costCenters={costCenters} 
        setCostCenters={setCostCenters} 
        selectedCompany={selectedCompany} 
        setActiveView={setActiveView}
        payables={payables}
        receivables={receivables}
        properties={properties}
        addToast={addToast}
      />;
      case VIEWS.COMPANY_PROFILE: return <CompanyProfile 
        company={currentCompany} 
        companies={companies}
        setCompanies={setCompanies}
        currentUser={currentUser!}
        setActiveView={setActiveView}
      />;
      case VIEWS.PLAN_SUBSCRIPTION: return <PlanSubscription 
        company={currentCompany}
        setActiveView={setActiveView}
      />;
      case VIEWS.SETTINGS: return <Settings 
          setActiveView={setActiveView}
          currentUser={currentUser!}
          properties={properties}
          receivables={receivables}
          setReceivables={setReceivables}
          adjustmentIndexes={adjustmentIndexes}
          setAdjustmentIndexes={setAdjustmentIndexes}
          addToast={addToast}
        />;
      case VIEWS.CATEGORIES: return <Categories 
          categories={categories}
          setCategories={setCategories}
          selectedCompany={selectedCompany}
          setActiveView={setActiveView}
          addToast={addToast}
        />;
      case VIEWS.INDEXES: return <Indexes
        adjustmentIndexes={adjustmentIndexes}
        setAdjustmentIndexes={setAdjustmentIndexes}
        selectedCompany={selectedCompany}
        setActiveView={setActiveView}
        properties={properties}
        receivables={receivables}
        setReceivables={setReceivables}
        addToast={addToast}
      />;
      case VIEWS.INTEGRATIONS: return <Integrations
        isAccountantModuleEnabled={isAccountantModuleEnabled}
        setIsAccountantModuleEnabled={setIsAccountantModuleEnabled}
        setActiveView={setActiveView}
        company={currentCompany}
       />;
      case VIEWS.HELP: return <Help />;
      default: return <div>View not found</div>
    }
  }

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView} 
          selectedCompany={selectedCompany} 
          setSelectedCompany={setSelectedCompany}
          companies={companies}
          company={currentCompany}
          currentUser={currentUser!}
          onLogout={handleLogout}
          isAccountantModuleEnabled={isAccountantModuleEnabled}
          onOpenInvoiceModal={handleOpenInvoiceModal}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsDesiredFullscreen(prev => !prev)}
          notifications={notifications}
          setIsNotificationsOpen={setIsNotificationsOpen}
        />
        <main className="flex-1 overflow-y-auto p-8">
            {renderActiveView()}
        </main>
        {isInvoiceModalOpen && <InvoiceGenerator
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          contacts={contacts}
          setContacts={setContacts}
          receivables={receivables}
          setReceivables={setReceivables}
          selectedCompany={selectedCompany}
          companies={companies}
          properties={properties}
          projects={projects}
          initialData={invoiceInitialData}
          costCenters={costCenters}
          categories={categories}
          adjustmentIndexes={adjustmentIndexes}
        />}
        {isExpenseModalOpen && <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          onSave={handleSaveExpense}
          onSaveMultiple={handleSaveMultipleExpenses}
          addToast={addToast}
          expenseToEdit={expenseToEdit}
          selectedCompany={selectedCompany}
          contacts={contacts}
          setContacts={setContacts}
          properties={properties}
          projects={projects}
          bankAccounts={bankAccounts}
          costCenters={costCenters}
          categories={categories}
        />}
        {isProjectModalOpen && <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
          onSave={handleSaveProject}
          projectToEdit={projectToEdit}
          proposalForProject={proposalForProject}
          contacts={contacts}
          setContacts={setContacts}
          selectedCompany={selectedCompany}
          costCenters={costCenters}
          setCostCenters={setCostCenters}
        />}
         {isProposalModalOpen && <ProposalModal
          isOpen={isProposalModalOpen}
          onClose={() => setIsProposalModalOpen(false)}
          onSave={handleSaveProposal}
          proposalToEdit={proposalToEdit}
          contacts={contacts}
          setContacts={setContacts}
          selectedCompany={selectedCompany}
        />}
        {isConfirmPaymentModalOpen && <PaymentConfirmationModal 
          isOpen={isConfirmPaymentModalOpen}
          onClose={() => setIsConfirmPaymentModalOpen(false)}
          onConfirm={handleConfirmPayment}
          transaction={transactionToConfirm}
        />}
        {isQRCodeModalOpen && <QRCodeModal 
            isOpen={isQRCodeModalOpen}
            onClose={() => setIsQRCodeModalOpen(false)}
            transaction={transactionForQRCode}
        />}
        {isNotificationsOpen && <NotificationCenter 
            notifications={notifications.filter(n => n.company === selectedCompany)}
            onClose={() => setIsNotificationsOpen(false)}
            onMarkAsRead={(id) => {
                const newNotifs = notifications.map(n => n.id === id ? {...n, isRead: true} : n);
                setNotifications(newNotifs);
                apiService.saveNotifications(newNotifs);
            }}
            onMarkAllAsRead={() => {
                const newNotifs = notifications.map(n => ({...n, isRead: true}));
                setNotifications(newNotifs);
                apiService.saveNotifications(newNotifs);
            }}
            onNotificationClick={handleNotificationClick}
        />}

        <ToastContainer toasts={toasts} onDismiss={removeToast} />
        <AutomatedNotificationManager 
            payables={payables}
            receivables={receivables}
            addNotification={addNotification}
            notifications={notifications}
        />
    </div>
  )
}
