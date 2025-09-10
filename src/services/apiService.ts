import type { Company, User, Contact, Transaction, AccountantRequest, BankAccount, BankTransaction, InvoiceItem, Property, Notification, SystemTransaction, CostCenter, Category, AdjustmentIndex, Project, Proposal, DashboardSettings, QuotationRequest } from '../types';
import { MOCK_COMPANIES, MOCK_USERS, MOCK_CONTACTS, MOCK_PAYABLES, MOCK_RECEIVABLES, MOCK_ACCOUNTANT_REQUESTS, MOCK_BANK_ACCOUNTS, MOCK_BANK_TRANSACTIONS, MOCK_PROPERTIES, MOCK_NOTIFICATIONS, MOCK_SYSTEM_TRANSACTIONS, MOCK_COST_CENTERS_DATA, MOCK_CATEGORIES_DATA, MOCK_ADJUSTMENT_INDEXES_DATA, MOCK_PROJECTS, MOCK_PROPOSALS, MOCK_QUOTATIONS } from '../constants';

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
export const getContacts = (): Contact[] => get('finantech_contacts', MOCK_CONTACTS);
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

// --- System Transactions (for reconciliation) ---
export const getSystemTransactions = (): SystemTransaction[] => get('finantech_system_transactions', MOCK_SYSTEM_TRANSACTIONS);
export const saveSystemTransactions = (transactions: SystemTransaction[]): void => set('finantech_system_transactions', transactions);

// --- Properties ---
export const getProperties = (): Property[] => get('finantech_properties', MOCK_PROPERTIES);
export const saveProperties = (properties: Property[]): void => set('finantech_properties', properties);

// --- Projects ---
export const getProjects = (): Project[] => get('finantech_projects', MOCK_PROJECTS);
export const saveProjects = (projects: Project[]): void => set('finantech_projects', projects);

// --- Proposals ---
export const getProposals = (): Proposal[] => get('finantech_proposals', MOCK_PROPOSALS);
export const saveProposals = (proposals: Proposal[]): void => set('finantech_proposals', proposals);

// --- Price Quotations ---
export const getQuotations = (): QuotationRequest[] => get('finantech_quotations', MOCK_QUOTATIONS);
export const saveQuotations = (quotations: QuotationRequest[]): void => set('finantech_quotations', quotations);


// --- Cost Centers ---
export const getCostCenters = (): CostCenter[] => get('finantech_cost_centers', MOCK_COST_CENTERS_DATA);
export const saveCostCenters = (costCenters: CostCenter[]): void => set('finantech_cost_centers', costCenters);

// --- Categories ---
export const getCategories = (): Category[] => get('finantech_categories', MOCK_CATEGORIES_DATA);
export const saveCategories = (categories: Category[]): void => set('finantech_categories', categories);

// --- Adjustment Indexes ---
export const getAdjustmentIndexes = (): AdjustmentIndex[] => get('finantech_adjustment_indexes', MOCK_ADJUSTMENT_INDEXES_DATA);
export const saveAdjustmentIndexes = (indexes: AdjustmentIndex[]): void => set('finantech_adjustment_indexes', indexes);


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

// --- Notifications ---
export const getNotifications = (): Notification[] => get('finantech_notifications', MOCK_NOTIFICATIONS);
export const saveNotifications = (notifications: Notification[]): void => set('finantech_notifications', notifications);

// --- Custom Avatars ---
export const getCustomAvatars = (): string[] => get('finantech_custom_avatars', []);
export const saveCustomAvatars = (avatars: string[]): void => set('finantech_custom_avatars', avatars);

// --- Dashboard Settings ---
const defaultDashboardSettings: DashboardSettings = {
    summaryCards: true,
    cashFlowChart: true,
    bankBalances: true,
    overduePayables: true,
    overdueReceivables: true,
    latestPayables: true,
    latestReceivables: true,
    aiInsight: true,
    scheduledItems: true,
    accountantRequests: true,
};
export const getDashboardSettings = (): DashboardSettings => get('finantech_dashboard_settings', defaultDashboardSettings);
export const saveDashboardSettings = (settings: DashboardSettings): void => set('finantech_dashboard_settings', settings);


// ====================================================================================
// UTILITY FUNCTIONS
// ====================================================================================

export const parseDate = (dateStr: string): Date => {
    let date;
    // Check for DD/MM/YYYY format
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3 && parts[2].length === 4) {
            // new Date(year, monthIndex, day)
            date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        }
    } else if (dateStr.includes('-')) { // Check for YYYY-MM-DD format
        const parts = dateStr.split('-');
        if (parts.length === 3 && parts[0].length === 4) {
           date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        }
    }
    // Return an invalid date if parsing failed or format is unexpected
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

    // Filter out future, unpaid rent receivables for this specific property.
    const receivablesToKeep = existingReceivables.filter(r => {
        if (r.propertyId === property.id && r.category === 'Aluguéis') {
            const dueDate = parseDate(r.dueDate);
            return r.status === 'Pago' || dueDate < today;
        }
        return true; // Keep all other transactions
    });

    // Stop if property is not rented or details are missing
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

        // Only generate for future or current months
        if (dueDate >= today) {
            const monthYear = new Date(currentDate.getFullYear(), currentDate.getMonth()).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
            
            // Calculate how many full years have passed since the contract started
            let yearsPassed = currentDate.getFullYear() - startDate.getFullYear();
            if (currentDate.getMonth() < startDate.getMonth() || (currentDate.getMonth() === startDate.getMonth() && currentDate.getDate() < startDate.getDate())) {
                yearsPassed--;
            }
            yearsPassed = Math.max(0, yearsPassed);

            // Apply adjustment based on the number of years passed
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

        // Move to the next month
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return { receivablesToKeep, newReceivables };
};


// ====================================================================================
// SIMULAÇÃO DE API FISCAL EXTERNA (Ex: TecnoSpeed)
//
// Este serviço simula o comportamento de uma chamada a uma API externa para
// emissão de notas fiscais. Ele introduz um atraso para simular a latência da rede
// e retorna uma resposta estruturada com sucesso ou erro.
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
    const itemsXml = payload.items.map((item, index) => {
        const price = parseFloat(item.price.replace(',', '.')) || 0;
        const total = price * item.quantity;
        return `
        <det nItem="${index + 1}">
            <prod>
                <cProd>PROD-${item.id}</cProd>
                <xProd>${item.description}</xProd>
                <NCM>22221100</NCM>
                <CFOP>${cfop}</CFOP>
                <uCom>UN</uCom>
                <qCom>${item.quantity.toFixed(4)}</qCom>
                <vUnCom>${price.toFixed(2)}</vUnCom>
                <vProd>${total.toFixed(2)}</vProd>
            </prod>
            <imposto>
                <ICMS>
                    <ICMS00>
                        <orig>0</orig>
                        <CST>00</CST>
                        <modBC>3</modBC>
                        <vBC>${total.toFixed(2)}</vBC>
                        <pICMS>0.00</pICMS>
                        <vICMS>0.00</vICMS>
                    </ICMS00>
                </ICMS>
            </imposto>
        </det>`;
    }).join('');
    
    const installmentsXml = (payload.installments && payload.installments.length > 0 ? payload.installments : [{ number: '001', dueDate: payload.dueDate, amount: payload.total }])
        .map(inst => `
            <dup>
                <nDup>${inst.number}</nDup>
                <dVenc>${inst.dueDate}</dVenc>
                <vDup>${inst.amount.toFixed(2)}</vDup>
            </dup>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
    <infNFe versao="4.00" Id="NFe${providerId}">
        <ide>
            <cUF>35</cUF>
            <cNF>${Math.floor(Math.random() * 100000000)}</cNF>
            <natOp>VENDA DE PRODUTO/SERVICO</natOp>
            <mod>55</mod>
            <serie>1</serie>
            <nNF>${Math.floor(Math.random() * 100000)}</nNF>
            <dhEmi>${new Date().toISOString()}</dhEmi>
            <tpNF>1</tpNF>
            <idDest>1</idDest>
            <cMunFG>3550308</cMunFG>
            <tpImp>1</tpImp>
            <tpEmis>1</tpEmis>
            <cDV>2</cDV>
            <tpAmb>2</tpAmb>
            <finNFe>1</finNFe>
            <indFinal>0</indFinal>
            <indPres>1</indPres>
            <procEmi>0</procEmi>
            <verProc>FinanTechAI 1.0</verProc>
        </ide>
        <emit>
            <CNPJ>${payload.issuer.cnpj.replace(/\D/g, '')}</CNPJ>
            <xNome>${payload.issuer.name}</xNome>
            <enderEmit>
                <xLgr>${payload.issuer.address.street}</xLgr>
                <nro>${payload.issuer.address.number}</nro>
                <xCpl/>
                <xBairro>Centro</xBairro>
                <cMun>3550308</cMun>
                <xMun>${payload.issuer.address.city}</xMun>
                <UF>${payload.issuer.address.state}</UF>
                <CEP>${payload.issuer.address.zip.replace(/\D/g, '')}</CEP>
                <cPais>1058</cPais>
                <xPais>BRASIL</xPais>
            </enderEmit>
            <IE>ISENTO</IE>
            <CRT>1</CRT>
        </emit>
        <dest>
            <CNPJ>${payload.customer.document.replace(/\D/g, '')}</CNPJ>
            <xNome>${payload.customer.name}</xNome>
            <enderDest>
                <xLgr>${payload.customer.address.street}</xLgr>
                <nro>${payload.customer.address.number}</nro>
                <xBairro>Centro</xBairro>
                <cMun>3550308</cMun>
                <xMun>${payload.customer.address.city}</xMun>
                <UF>${payload.customer.address.state}</UF>
                <CEP>${payload.customer.address.zip.replace(/\D/g, '')}</CEP>
                <cPais>1058</cPais>
                <xPais>BRASIL</xPais>
            </enderDest>
            <indIEDest>9</indIEDest>
        </dest>
        ${itemsXml}
        <total>
            <ICMSTot>
                <vBC>0.00</vBC>
                <vICMS>0.00</vICMS>
                <vBCST>0.00</vBCST>
                <vST>0.00</vST>
                <vProd>${payload.total.toFixed(2)}</vProd>
                <vFrete>0.00</vFrete>
                <vSeg>0.00</vSeg>
                <vDesc>0.00</vDesc>
                <vII>0.00</vII>
                <vIPI>0.00</vIPI>
                <vPIS>0.00</vPIS>
                <vCOFINS>0.00</vCOFINS>
                <vOutro>0.00</vOutro>
                <vNF>${payload.total.toFixed(2)}</vNF>
            </ICMSTot>
        </total>
        <transp>
            <modFrete>9</modFrete>
        </transp>
        <cobr>
            <fat>
                <nFat>001</nFat>
                <vOrig>${payload.total.toFixed(2)}</vOrig>
                <vLiq>${payload.total.toFixed(2)}</vLiq>
            </fat>
            ${installmentsXml}
        </cobr>
        <pag>
            <detPag>
                <tPag>01</tPag>
                <vPag>${payload.total.toFixed(2)}</vPag>
            </detPag>
        </pag>
    </infNFe>
</NFe>`;
};


/**
 * Simula a emissão de uma NF-e através de um provedor externo.
 * @param payload Os dados da fatura a serem enviados.
 * @returns Uma promessa que resolve com o resultado da API.
 */
export const emitirNFe = (payload: ApiPayload): Promise<ApiResponse> => {
    console.log("Simulando chamada para API Fiscal com payload:", payload);

    return new Promise(resolve => {
        // Simula um atraso de rede de 1.5 segundos
        setTimeout(() => {
            // Lógica de simulação
            if (payload.total <= 0) {
                resolve({
                    success: false,
                    status: 'Rejeitado',
                    errorMessage: 'Valor da nota deve ser maior que zero.',
                });
                return;
            }

            const tecnoSpeedId = `TS_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

            // Lógica fiscal dinâmica baseada nos dados
            const isInterstate = payload.issuer.address.state.toUpperCase() !== payload.customer.address.state.toUpperCase();
            const cfop = isInterstate ? '6102' : '5102'; // 6102: Venda interestadual; 5102: Venda no mesmo estado

            let icmsRate = 0.18; // Padrão para Lucro Presumido/Real
            let pisRate = 0.0165;
            let cofinsRate = 0.076;

            if (payload.customer.taxRegime === 'Simples Nacional') {
                // No Simples Nacional, os impostos são unificados em uma única guia (DAS).
                // Para fins de simulação, mostraremos valores reduzidos ou zerados.
                icmsRate = 0.025; // Simulação de uma alíquota dentro do Simples
                pisRate = 0;
                cofinsRate = 0;
            }
            
            const icms = payload.total * icmsRate;
            const pis = payload.total * pisRate;
            const cofins = payload.total * cofinsRate;

            const xmlContent = generateMockNFeXml(payload, tecnoSpeedId, cfop);
            
            const response: ApiResponse = {
                success: true,
                status: 'Aprovado',
                providerId: tecnoSpeedId,
                cfop: cfop,
                xmlContent: xmlContent,
                calculatedTaxes: {
                    icms,
                    pis,
                    cofins
                }
            };
            
            console.log("Simulação de API Fiscal retornou:", response);
            resolve(response);

        }, 1500);
    });
};
