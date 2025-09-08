



export type View = 'dashboard' | 'payable' | 'receipts' | 'cash_management' | 'reports' | 'ai_advisor' | 'fiscal_module' | 'crm' | 'integrations' | 'user_management' | 'contacts' | 'help' | 'generated_invoices' | 'accountant_panel' | 'bank_accounts' | 'bank_reconciliation' | 'recurrences' | 'payable_recurrences' | 'payment_schedule' | 'receivable_schedule' | 'cash_flow_records' | 'properties' | 'schema_generator' | 'cost_centers' | 'company_profile' | 'plan_subscription' | 'settings' | 'indexes' | 'categories' | 'projects' | 'proposals';

export type Role = 'Admin' | 'Manager' | 'Analyst' | 'Contador';

// --- New Permission System Types ---
export type ModuleKey = 'dashboard' | 'payable' | 'receipts' | 'contacts' | 'bank_accounts' | 'properties' | 'reports' | 'user_management' | 'crm' | 'fiscal_module' | 'integrations' | 'ai_advisor' | 'projects';
export type PermissionAction = 'view' | 'edit' | 'delete';
export type UserPermissions = Partial<Record<ModuleKey, Partial<Record<PermissionAction, boolean>>>>;
// --- End New Permission System Types ---

export type GroupingType = 'none' | 'status' | 'costCenter' | 'type';

export interface Address {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string; // UF
    zip: string;
}

export type PlanType = 'Basic' | 'Pro' | 'Enterprise';
export type ModuleType = 'properties' | 'fiscal' | 'integrations' | 'ai_advisor' | 'projects';

export interface Company {
    id: string;
    name: string;
    cnpj: string;
    address: Address;
    ie?: string;
    plan: PlanType;
    enabledModules: ModuleType[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: Role;
    avatar: string;
    accessibleCompanies: string[];
    permissions: UserPermissions;
}

export interface AuditLog {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    action: string;
    timestamp: string;
    company: string;
}

export interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  scheduledPaymentDate?: string;
  notificationEmail?: string;
  notificationSentOn?: string;
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
  propertyId?: string;
  projectId?: string;
  purchaseXmlContent?: string;
  attachments?: {
    fileName: string;
    fileType: string;
    fileContent: string; // base64 encoded content
  }[];
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
    cfop?: string;
    xmlContent?: string;
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
    hasOpenInvoice: boolean;
}

export interface ContactBankDetails {
    bankName: string;
    agency: string;
    account: string;
    pixKey?: string;
}

export interface Contact {
    id: string;
    name: string;
    type: 'Cliente' | 'Fornecedor' | 'Proprietário';
    document: string; // CNPJ or CPF
    email: string;
    phone: string;
    company: string;
    address: Address;
    taxRegime: 'Simples Nacional' | 'Lucro Presumido' | 'Lucro Real';
    bankDetails?: ContactBankDetails;
    ie?: string;
    icon?: string;
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
  priority?: 'High' | 'Medium' | 'Low';
}

// Types for Properties Module
export interface RentalDetails {
    tenantId: string;
    rentAmount: number;
    contractStart: string;
    contractEnd: string;
    paymentDay: number;
    adjustmentIndexId?: string;
}

export interface SaleDetails {
    price: number;
}

export interface Property {
    id: string;
    name: string;
    address: Address;
    type: 'Apartamento' | 'Casa' | 'Terreno' | 'Comercial';
    status: 'Disponível' | 'Alugado' | 'Vendido' | 'À Venda';
    ownerId: string; // Contact ID of the owner
    rentalDetails?: RentalDetails;
    saleDetails?: SaleDetails;
    company: string;
    iptuAmount?: number;
    condoAmount?: number;
    iptuDueDate?: number; // Dia do mês
    condoDueDate?: number; // Dia do mês
    // FIX: Added optional 'icon' property to support custom icons for property types.
    icon?: string;
}

export interface CostCenter {
  id: string;
  name: string;
  description: string;
  budget?: number;
  company: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'receita' | 'despesa';
  company: string;
}

export interface AdjustmentIndex {
  id: string;
  name: string;
  description: string;
  company: string;
  value: number;
}

// --- Proposal Management Module Types ---
export interface ProposalItem {
    id: string;
    description: string;
    value: number;
}

export interface Proposal {
    id: string;
    name: string;
    clientId: string;
    scope: string;
    status: 'Rascunho' | 'Enviada' | 'Aprovada' | 'Recusada';
    items: ProposalItem[];
    createdAt: string; // ISO date string
    company: string;
}
// --- End Proposal Management Module Types ---


// --- Project Management Module Types ---
export interface BudgetItem {
    id: string;
    description: string;
    type: 'Insumos' | 'Mão de Obra' | 'Terceiros' | 'Serviços' | 'Taxas';
    cost: number;
}

export interface ProjectStage {
    id: string;
    name: string;
    dueDate: string;
// FIX: Corrected typo from "Concluido" to "Concluído" for consistency.
    status: 'Pendente' | 'Aprovado Cliente' | 'Aprovado Órgão Público' | 'Concluído';
    deliverables?: {
        fileName: string;
        fileType: string;
        fileContent: string; // base64 encoded content
    }[];
}

export type AllocationMethod = 'none' | 'totalArea' | 'builtArea' | 'stages';

export interface Project {
    id: string;
    name: string;
    type: 'Residencial' | 'Comercial' | 'Industrial';
    status: 'Planejamento' | 'Em Execução' | 'Concluído';
    clientId: string; // Contact ID
    budget: BudgetItem[];
    stages: ProjectStage[];
    company: string;
    totalArea?: number;
    builtArea?: number;
    allocationMethod: AllocationMethod;
    costCenterName: string;
}
// --- End Project Management Module Types ---


// --- DANFE Data Structure ---

export interface DanfeProtocolo {
    codigo: string;
    data: string;
}

export interface DanfeEmitenteDestinatario {
    nome: string;
    cnpjCpf: string;
    endereco: string;
    bairro: string;
    cep: string;
    municipio: string;
    uf: string;
    telefone: string;
    ie: string;
}

export interface DanfeIcmsTotais {
    baseCalculoIcms: string;
    valorIcms: string;
    baseCalculoIcmsSt: string;
    valorIcmsSt: string;
    valorTotalProdutos: string;
    valorFrete: string;
    valorSeguro: string;
    desconto: string;
    outrasDespesas: string;
    valorTotalIpi: string;
    valorTotalNota: string;
}

export interface DanfeTransportador {
    nome: string;
    fretePorConta: string;
    codigoAntt: string;
    placaVeiculo: string;
    ufVeiculo: string;
    cnpjCpf: string;
    endereco: string;
    municipio: string;
    uf: string;
    ie: string;
    qntVolumes: string;
    especieVolumes: string;
    marcaVolumes: string;
    numeracaoVolumes: string;
    pesoBruto: string;
    pesoLiquido: string;
}

export interface DanfeItem {
    codigo: string;
    descricao: string;
    ncm: string;
    cfop: string;
    unidade: string;
    quantidade: string;
    valorUnitario: string;
    valorTotal: string;
    baseCalculoIcms: string;
    valorIcms: string;
    valorIpi: string;
    aliqIcms: string;
    aliqIpi: string;
}

export interface DanfeFatura {
    numero: string;
    vencimento: string;
    valor: string;
}

export interface DanfeData {
    tipoOperacao: '0' | '1'; // 0-Entrada, 1-Saída
    numeroNota: string;
    serie: string;
    chaveAcesso: string;
    protocolo?: DanfeProtocolo;
    naturezaOperacao: string;
    emitente: DanfeEmitenteDestinatario;
    destinatario: DanfeEmitenteDestinatario;
    dataEmissao: string;
    dataSaidaEntrada: string;
    horaSaidaEntrada: string;
    faturas: DanfeFatura[];
    totais: DanfeIcmsTotais;
    transportador: DanfeTransportador;
    items: DanfeItem[];
    infoAdicionais: string;
}

// --- XML Parsing Data Structure for Expenses ---
export interface ParsedNFeItem {
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface ParsedNFeSupplier {
    name: string;
    cnpj: string;
    address: Address;
    ie?: string;
    taxRegime: 'Simples Nacional' | 'Lucro Presumido' | 'Lucro Real';
}

export interface ParsedNFeInstallment {
    dueDate: string | null;
    amount: number;
}

export interface ParsedNFeData {
    supplier: ParsedNFeSupplier;
    items: ParsedNFeItem[];
    totalAmount: number;
    installments: ParsedNFeInstallment[];
    paymentMethod: string | null;
    status: 'Pendente' | 'Pago';
    paymentDate: string | null;
}

export interface ToastMessage { 
    id: number; 
    title: string; 
    description: string; 
    type: 'info' | 'success' | 'warning'; 
}

export interface Notification {
  id: string;
  type: 'overdue_payable' | 'overdue_receivable' | 'accountant_request' | 'payment_due_today' | 'info';
  title: string;
  description: string;
  timestamp: string; // ISO string
  isRead: boolean;
  entityId?: string; // e.g., transaction.id or request.id
  company: string;
}


// --- Dashboard Customization ---
export type DashboardWidget = 
    | 'summaryCards'
    | 'cashFlowChart'
    | 'bankBalances'
    | 'overduePayables'
    | 'overdueReceivables'
    | 'latestPayables'
    | 'latestReceivables'
    | 'aiInsight'
    | 'scheduledItems'
    | 'accountantRequests';

export type DashboardSettings = Record<DashboardWidget, boolean>;

export type AIInsightsMap = Record<string, string | undefined>;
// --- End Dashboard Customization ---