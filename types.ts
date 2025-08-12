
export type View = 'dashboard' | 'payable' | 'receipts' | 'cash_management' | 'reports' | 'ai_advisor' | 'fiscal_module' | 'crm' | 'integrations' | 'user_management' | 'contacts' | 'help' | 'generated_invoices' | 'accountant_panel' | 'bank_accounts' | 'recurrences' | 'payable_recurrences' | 'payment_schedule' | 'cash_flow_records';

export type Role = 'Admin' | 'Manager' | 'Analyst' | 'Contador';

export interface Company {
    id: string;
    name: string;
    cnpj: string;
    address: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: Role;
    avatar: string;
    accessibleCompanies: string[];
}

export interface AuditLog {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    action: string;
    timestamp: string;
}

export interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  status: 'Pendente' | 'Pago' | 'Vencido' | 'Agendado';
  type: 'receita' | 'despesa';
  recurrence?: {
    interval: 'monthly' | 'yearly';
    endDate?: string;
  };
  company: string;
  costCenter: string;
  bankAccount: string;
  paymentMethod?: string;
  invoiceDetails?: InvoiceData;
  interestRate?: number; // e.g., 1 for 1%
  interestType?: 'daily' | 'monthly';
  fineRate?: number; // e.g., 2 for 2%
  fixedOrVariable?: 'fixa' | 'variável';
  contactId?: string;
}

export interface BankAccount {
    id: string;
    name: string;
    agency: string;
    account: string;
    balance: number;
    logoUrl: string;
    company: string;
}

export interface BankTransaction {
  id: string;
  bankAccountId: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
}

export interface SystemTransaction extends BankTransaction {
  matched: boolean;
  company: string;
}

export interface CashFlowData {
  month: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

export interface InvoiceItem {
    id: number;
    description: string;
    quantity: number;
    price: string;
}

export interface InvoiceData {
    customer: string;
    dueDate: string;
    items: InvoiceItem[];
    total: number;
    bank: string;
    invoiceType: 'nfe' | 'nfse' | 'nfce';
    issuerProvider: string;
    interestRate?: number;
    interestType?: 'daily' | 'monthly';
    fineRate?: number;
    issuerProviderTransactionId?: string;
    issuerProviderStatus?: 'pending' | 'issued' | 'error';
}

export interface DefaultRateData {
    month: string;
    inadimplencia: number;
}

export interface NetProfitData {
    month: string;
    lucro: number;
}

// Types for Financial CRM
export type FunnelStage = 'Notificação' | 'Negociação' | 'Acordo' | 'Ação Jurídica';

export interface CommunicationHistory {
    id: string;
    date: string;
    type: 'email' | 'sms' | 'call' | 'whatsapp';
    summary: string;
}

export interface DebtorCustomer {
    id: string;
    name: string;
    avatar: string;
    totalDebt: number;
    lastDueDate: string;
    status: FunnelStage;
    communicationHistory: CommunicationHistory[];
    company: string;
}

export interface Contact {
    id: string;
    name: string;
    type: 'Cliente' | 'Fornecedor';
    document: string; // CNPJ or CPF
    email: string;
    phone: string;
    company: string;
}

export interface AccountantRequest {
  id: string;
  company: string;
  requesterId: string; // Accountant's user ID
  requesterName: string;
  requestType: 'documento' | 'esclarecimento' | 'lançamento';
  subject: string;
  details: string;
  status: 'Pendente' | 'Resolvido' | 'Cancelado';
  createdAt: string;
  resolvedAt?: string;
  assignedToId: string; // Admin/Manager user ID
}