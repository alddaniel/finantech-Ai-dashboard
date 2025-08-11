import type { Company, User, Contact, Transaction, AccountantRequest, BankAccount, BankTransaction } from '../types';
import { MOCK_COMPANIES, MOCK_USERS, MOCK_CONTACTS, MOCK_PAYABLES, MOCK_RECEIVABLES, MOCK_ACCOUNTANT_REQUESTS, MOCK_BANK_ACCOUNTS, MOCK_BANK_TRANSACTIONS } from '../constants';

// ====================================================================================
// Abstraction Layer for Data Persistence
//
// This service simulates a backend API. Currently, it uses localStorage.
// To migrate to a real backend (e.g., connected to PostgreSQL), you would
// only need to change the implementation of these functions to use `fetch`
// to call your API endpoints, without changing any other part of the frontend.
// ====================================================================================

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

// --- Authentication ---
export const getIsAuthenticated = (): boolean => get('finantech_is_authenticated', false);
export const saveIsAuthenticated = (isAuthenticated: boolean): void => set('finantech_is_authenticated', isAuthenticated);

// --- Current User ---
export const getCurrentUser = (users: User[]): User | null => {
    const user = get<User | null>('finantech_current_user', null);
    // Data integrity check: ensure the stored user exists in the main user list
    if (user && users.find(u => u.id === user.id)) {
        return user;
    }
    return null;
}
export const saveCurrentUser = (user: User | null): void => set('finantech_current_user', user);


// --- Companies ---
export const getCompanies = (): Company[] => get('finantech_companies', MOCK_COMPANIES);
export const saveCompanies = (companies: Company[]): void => set('finantech_companies', companies);

// --- Users ---
export const getUsers = (): User[] => get('finantech_users', MOCK_USERS);
export const saveUsers = (users: User[]): void => set('finantech_users', users);

// --- Contacts ---
export const getContacts = (): Contact[] => get('finanteantech_contacts', MOCK_CONTACTS);
export const saveContacts = (contacts: Contact[]): void => set('finantech_contacts', contacts);

// --- Transactions: Payables ---
export const getPayables = (): Transaction[] => get('finantech_payables', MOCK_PAYABLES);
export const savePayables = (payables: Transaction[]): void => set('finantech_payables', payables);

// --- Transactions: Receivables ---
export const getReceivables = (): Transaction[] => get('finantech_receivables', MOCK_RECEIVABLES);
export const saveReceivables = (receivables: Transaction[]): void => set('finantech_receivables', receivables);

// --- Bank Accounts ---
export const getBankAccounts = (): BankAccount[] => get('finantech_bank_accounts', MOCK_BANK_ACCOUNTS);
export const saveBankAccounts = (accounts: BankAccount[]): void => set('finantech_bank_accounts', accounts);

// --- Bank Transactions ---
export const getBankTransactions = (): BankTransaction[] => get('finantech_bank_transactions', MOCK_BANK_TRANSACTIONS);
export const saveBankTransactions = (transactions: BankTransaction[]): void => set('finantech_bank_transactions', transactions);


// --- User Preferences ---
export const getSelectedCompany = (companies: Company[]): string => {
    const defaultCompany = companies[0]?.name || '';
    return get('finantech_selected_company', defaultCompany);
};
export const saveSelectedCompany = (companyName: string): void => set('finantech_selected_company', companyName);

// --- Accountant Module ---
export const getIsAccountantModuleEnabled = (): boolean => get('finantech_accountant_module_enabled', false);
export const saveIsAccountantModuleEnabled = (isEnabled: boolean): void => set('finantech_accountant_module_enabled', isEnabled);

export const getAccountantRequests = (): AccountantRequest[] => get('finantech_accountant_requests', MOCK_ACCOUNTANT_REQUESTS);
export const saveAccountantRequests = (requests: AccountantRequest[]): void => set('finantech_accountant_requests', requests);