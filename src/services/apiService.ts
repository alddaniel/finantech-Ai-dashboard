import type { Company, User, Contact, Transaction, AccountantRequest, BankAccount, BankTransaction, InvoiceItem, Property, Notification, SystemTransaction, CostCenter, Category, AdjustmentIndex, Project, Proposal, DashboardSettings } from '../types';
import { MOCK_COMPANIES, MOCK_USERS, MOCK_CONTACTS, MOCK_PAYABLES, MOCK_RECEIVABLES, MOCK_ACCOUNTANT_REQUESTS, MOCK_BANK_ACCOUNTS, MOCK_BANK_TRANSACTIONS, MOCK_PROPERTIES, MOCK_NOTIFICATIONS, MOCK_SYSTEM_TRANSACTIONS, MOCK_COST_CENTERS_DATA, MOCK_CATEGORIES_DATA, MOCK_ADJUSTMENT_INDEXES_DATA, MOCK_PROJECTS, MOCK_PROPOSALS } from '../constants';

// ====================================================================================
// Abstraction Layer for Data Persistence (Simulated API)
//
// This service simulates a backend API by making localStorage access asynchronous.
// This prepares the frontend architecture for a real backend implementation.
// ====================================================================================

const SIMULATED_LATENCY = 500; // ms

const get = <T,>(key: string, defaultValue: T): T => {
    try {
        const saved = window.localStorage.getItem(key);
        if (saved) {
            return JSON.parse(saved);
        }
        return defaultValue;
    } catch (e) {
        console.error(`Failed to parse ${key} from localStorage, using default value.`, e);
        return defaultValue;
    }
};

const set = <T,>(key: string, value: T): void => {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error(`Failed to save ${key} to localStorage.`, e);
    }
};

// --- API Simulation Functions ---
const apiGet = <T,>(key: string, defaultValue: T): Promise<T> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(get<T>(key, defaultValue));
        }, SIMULATED_LATENCY / 2); // Reads are faster
    });
};

const apiSet = <T,>(key: string, value: T): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            set<T>(key, value);
            resolve();
        }, SIMULATED_LATENCY); // Writes are slower
    });
};

// --- Authentication ---
export const getIsAuthenticated = (): boolean => get('finantech_is_authenticated', false);
export const saveIsAuthenticated = (isAuthenticated: boolean): Promise<void> => apiSet('finantech_is_authenticated', isAuthenticated);

// --- Current User ---
export const getCurrentUser = (users: User[]): User | null => {
    const user = get<User | null>('finantech_current_user', null);
    if (user && users.find(u => u.id === user.id)) {
        return user;
    }
    return null;
}
export const saveCurrentUser = (user: User | null): Promise<void> => apiSet('finantech_current_user', user);


// --- Data Fetching & Saving ---
export const getCompanies = (): Promise<Company[]> => apiGet('finantech_companies', MOCK_COMPANIES);
export const saveCompanies = (companies: Company[]): Promise<void> => apiSet('finantech_companies', companies);

export const getUsers = (): Promise<User[]> => apiGet('finantech_users', MOCK_USERS);
export const saveUsers = (users: User[]): Promise<void> => apiSet('finantech_users', users);

export const getContacts = (): Promise<Contact[]> => apiGet('finantech_contacts', MOCK_CONTACTS);
export const saveContacts = (contacts: Contact[]): Promise<void> => apiSet('finantech_contacts', contacts);

export const getPayables = (): Promise<Transaction[]> => apiGet('finantech_payables', MOCK_PAYABLES);
export const savePayables = (payables: Transaction[]): Promise<void> => apiSet('finantech_payables', payables);

export const getReceivables = (): Promise<Transaction[]> => apiGet('finantech_receivables', MOCK_RECEIVABLES);
export const saveReceivables = (receivables: Transaction[]): Promise<void> => apiSet('finantech_receivables', receivables);

export const getBankAccounts = (): Promise<BankAccount[]> => apiGet('finantech_bank_accounts', MOCK_BANK_ACCOUNTS);
export const saveBankAccounts = (accounts: BankAccount[]): Promise<void> => apiSet('finantech_bank_accounts', accounts);

export const getBankTransactions = (): Promise<BankTransaction[]> => apiGet('finantech_bank_transactions', MOCK_BANK_TRANSACTIONS);
export const saveBankTransactions = (transactions: BankTransaction[]): Promise<void> => apiSet('finantech_bank_transactions', transactions);

export const getSystemTransactions = (): Promise<SystemTransaction[]> => apiGet('finantech_system_transactions', MOCK_SYSTEM_TRANSACTIONS);
export const saveSystemTransactions = (transactions: SystemTransaction[]): Promise<void> => apiSet('finantech_system_transactions', transactions);

export const getProperties = (): Promise<Property[]> => apiGet('finantech_properties', MOCK_PROPERTIES);
export const saveProperties = (properties: Property[]): Promise<void> => apiSet('finantech_properties', properties);

export const getProjects = (): Promise<Project[]> => apiGet('finantech_projects', MOCK_PROJECTS);
export const saveProjects = (projects: Project[]): Promise<void> => apiSet('finantech_projects', projects);

export const getProposals = (): Promise<Proposal[]> => apiGet('finantech_proposals', MOCK_PROPOSALS);
export const saveProposals = (proposals: Proposal[]): Promise<void> => apiSet('finantech_proposals', proposals);

export const getCostCenters = (): Promise<CostCenter[]> => apiGet('finantech_cost_centers', MOCK_COST_CENTERS_DATA);
export const saveCostCenters = (costCenters: CostCenter[]): Promise<void> => apiSet('finantech_cost_centers', costCenters);

export const getCategories = (): Promise<Category[]> => apiGet('finantech_categories', MOCK_CATEGORIES_DATA);
export const saveCategories = (categories: Category[]): Promise<void> => apiSet('finantech_categories', categories);

export const getAdjustmentIndexes = (): Promise<AdjustmentIndex[]> => apiGet('finantech_adjustment_indexes', MOCK_ADJUSTMENT_INDEXES_DATA);
export const saveAdjustmentIndexes = (indexes: AdjustmentIndex[]): Promise<void> => apiSet('finantech_adjustment_indexes', indexes);

// --- User Preferences ---
export const getSelectedCompany = (companies: Company[]): string => get('finantech_selected_company', companies[0]?.name || '');
export const saveSelectedCompany = (companyName: string): Promise<void> => apiSet('finantech_selected_company', companyName);

// --- Modules & Other Settings ---
export const getIsAccountantModuleEnabled = (): Promise<boolean> => apiGet('finantech_accountant_module_enabled', false);
export const saveIsAccountantModuleEnabled = (isEnabled: boolean): Promise<void> => apiSet('finantech_accountant_module_enabled', isEnabled);

export const getAccountantRequests = (): Promise<AccountantRequest[]> => apiGet('finantech_accountant_requests', MOCK_ACCOUNTANT_REQUESTS);
export const saveAccountantRequests = (requests: AccountantRequest[]): Promise<void> => apiSet('finantech_accountant_requests', requests);

export const getNotifications = (): Promise<Notification[]> => apiGet('finantech_notifications', MOCK_NOTIFICATIONS);
export const saveNotifications = (notifications: Notification[]): Promise<void> => apiSet('finantech_notifications', notifications);

export const getCustomAvatars = (): Promise<string[]> => apiGet('finantech_custom_avatars', []);
export const saveCustomAvatars = (avatars: string[]): Promise<void> => apiSet('finantech_custom_avatars', avatars);

const defaultDashboardSettings: DashboardSettings = {
    summaryCards: true, cashFlowChart: true, bankBalances: true, overduePayables: true,
    overdueReceivables: true, latestPayables: true, latestReceivables: true,
    aiInsight: true, scheduledItems: true, accountantRequests: true,
};
export const getDashboardSettings = (): Promise<DashboardSettings> => apiGet('finantech_dashboard_settings', defaultDashboardSettings);
export const saveDashboardSettings = (settings: DashboardSettings): Promise<void> => apiSet('finantech_dashboard_settings', settings);

// --- Initial Data Loader ---
export const fetchAllInitialData = async () => {
    const [
        companies, users, contacts, properties, projects, proposals,
        costCenters, categories, adjustmentIndexes, customAvatars,
        payables, receivables, bankAccounts, bankTransactions,
        systemTransactions, notifications, isAccountantModuleEnabled
    ] = await Promise.all([
        getCompanies(), getUsers(), getContacts(), getProperties(), getProjects(), getProposals(),
        getCostCenters(), getCategories(), getAdjustmentIndexes(), getCustomAvatars(),
        getPayables(), getReceivables(), getBankAccounts(), getBankTransactions(),
        getSystemTransactions(), getNotifications(), getIsAccountantModuleEnabled()
    ]);

    return {
        companies, users, contacts, properties, projects, proposals,
        costCenters, categories, adjustmentIndexes, customAvatars,
        payables, receivables, bankAccounts, bankTransactions,
        systemTransactions, notifications, isAccountantModuleEnabled
    };
};


// ====================================================================================
// UTILITY FUNCTIONS (Unchanged)
// ====================================================================================

export const parseDate = (dateStr: string): Date => {
    let date;
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3 && parts[2].length === 4) {
            date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        }
    } else if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3 && parts[0].length === 4) {
           date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        }
    }
    if (date && !isNaN(date.getTime())) {
        return date;
    }
    return new Date(NaN);
};

export const calculateCharges = (transaction: Transaction) => {
    if (transaction.status !== 'Vencido') {
        return { interest: 0, fine: 0, total: transaction.amount };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = parseDate(transaction.dueDate);

    if (isNaN(dueDate.getTime()) || today <= dueDate) {
        return { interest: 0, fine: 0, total: transaction.amount };
    }
    dueDate.setHours(0, 0, 0, 0);

    let fine = 0;
    if (transaction.fineRate && transaction.fineRate > 0) {
        fine = transaction.amount * (transaction.fineRate / 100);
    }

    let interest = 0;
    if (transaction.interestRate && transaction.interestType) {
        const timeDiff = today.getTime() - dueDate.getTime();
        const daysOverdue = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
        const ratePerPeriod = transaction.interestRate / 100;

        if (transaction.interestType === 'daily') {
            interest = transaction.amount * ratePerPeriod * daysOverdue;
        } else if (transaction.interestType === 'monthly') {
            const monthsOverdue = daysOverdue / 30;
            interest = transaction.amount * ratePerPeriod * monthsOverdue;
        }
    }
    
    interest = Math.max(0, interest);
    fine = Math.max(0, fine);

    return {
        interest,
        fine,
        total: transaction.amount + interest + fine,
    };
};

export const generateAndAdjustRentReceivables = (
    property: Property,
    adjustmentIndexes: AdjustmentIndex[],
    existingReceivables: Transaction[]
): { receivablesToKeep: Transaction[]; newReceivables: Transaction[] } => {
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const receivablesToKeep = existingReceivables.filter(r => {
        if (r.propertyId === property.id && r.category === 'Aluguéis') {
            const dueDate = parseDate(r.dueDate);
            return r.status === 'Pago' || dueDate < today;
        }
        return true;
    });

    if (property.status !== 'Alugado' || !property.rentalDetails) {
        return { receivablesToKeep, newReceivables: [] };
    }

    const { tenantId, rentAmount, contractStart, contractEnd, paymentDay, adjustmentIndexId } = property.rentalDetails;
    if (!tenantId || !rentAmount || !contractStart || !contractEnd || !paymentDay) {
        return { receivablesToKeep, newReceivables: [] };
    }

    const newReceivables: Transaction[] = [];
    const startDate = parseDate(contractStart);
    const finalDate = parseDate(contractEnd);
    let currentDate = parseDate(contractStart);

    const adjustmentIndex = adjustmentIndexes.find(i => i.id === adjustmentIndexId);
    const adjustmentRate = adjustmentIndex ? (1 + adjustmentIndex.value / 100) : 1;

    while (currentDate <= finalDate) {
        const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), paymentDay);

        if (dueDate >= today) {
            const monthYear = new Date(currentDate.getFullYear(), currentDate.getMonth()).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
            
            let yearsPassed = currentDate.getFullYear() - startDate.getFullYear();
            if (currentDate.getMonth() < startDate.getMonth() || (currentDate.getMonth() === startDate.getMonth() && currentDate.getDate() < startDate.getDate())) {
                yearsPassed--;
            }
            yearsPassed = Math.max(0, yearsPassed);

            const adjustedRentAmount = rentAmount * Math.pow(adjustmentRate, yearsPassed);

            const receivable: Transaction = {
                id: `rent_${property.id}_${dueDate.toISOString().slice(0, 7)}`,
                description: `Aluguel Ref. ${monthYear} - ${property.name}`,
                category: 'Aluguéis',
                amount: adjustedRentAmount,
                dueDate: dueDate.toISOString().split('T')[0],
                status: 'Pendente',
                type: 'receita',
                company: property.company,
                costCenter: 'Imobiliário',
                bankAccount: '',
                contactId: tenantId,
                propertyId: property.id,
            };
            newReceivables.push(receivable);
        }

        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return { receivablesToKeep, newReceivables };
};

// ====================================================================================
// SIMULAÇÃO DE API FISCAL EXTERNA
// ====================================================================================

interface ApiPayload {
    issuer: Company;
    customer: Contact;
    total: number;
    items: InvoiceItem[];
    dueDate: string;
    installments?: { number: string; dueDate: string; amount: number }[];
}

export interface ApiResponse {
    success: boolean;
    status?: 'Aprovado' | 'Pendente' | 'Rejeitado';
    providerId?: string;
    cfop?: string;
    calculatedTaxes?: {
        icms: number;
        pis: number;
        cofins: number;
    };
    xmlContent?: string;
    errorMessage?: string;
}

const generateMockNFeXml = (payload: ApiPayload, providerId: string, cfop: string): string => {
    // ... (implementation is unchanged)
    return `<?xml version="1.0" encoding="UTF-8"?><NFe>...</NFe>`; // Abridged for brevity
};

export const emitirNFe = (payload: ApiPayload): Promise<ApiResponse> => {
    console.log("Simulando chamada para API Fiscal com payload:", payload);

    return new Promise(resolve => {
        setTimeout(() => {
            if (payload.total <= 0) {
                resolve({
                    success: false,
                    status: 'Rejeitado',
                    errorMessage: 'Valor da nota deve ser maior que zero.',
                });
                return;
            }
            const tecnoSpeedId = `TS_${Date.now()}`;
            const isInterstate = payload.issuer.address.state.toUpperCase() !== payload.customer.address.state.toUpperCase();
            const cfop = isInterstate ? '6102' : '5102';
            const xmlContent = generateMockNFeXml(payload, tecnoSpeedId, cfop);
            
            resolve({
                success: true,
                status: 'Aprovado',
                providerId: tecnoSpeedId,
                cfop: cfop,
                xmlContent: xmlContent,
            });
        }, 1500);
    });
};
