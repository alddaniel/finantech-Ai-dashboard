import type { View, Transaction, CashFlowData, BankTransaction, SystemTransaction, DefaultRateData, NetProfitData, DebtorCustomer, FunnelStage, BankAccount, Role, User, AuditLog, Company, Contact, AccountantRequest, Property, ModuleKey, UserPermissions, Notification, CostCenter, Category, AdjustmentIndex, Project, Proposal, QuotationRequest } from './types';
import { CONTACT_AVATARS, COMPANY_AVATARS } from './components/ui/IconComponents';

export const VIEWS: { [key: string]: View } = {
  DASHBOARD: 'dashboard',
  PAYABLE: 'payable',
  PAYABLE_RECURRENCES: 'payable_recurrences',
  PAYMENT_SCHEDULE: 'payment_schedule',
  RECEIPTS: 'receipts',
  RECURRENCES: 'recurrences',
  RECEIVABLE_SCHEDULE: 'receivable_schedule',
  CASH_MANAGEMENT: 'cash_management',
  CASH_FLOW_RECORDS: 'cash_flow_records',
  BANK_ACCOUNTS: 'bank_accounts',
  BANK_RECONCILIATION: 'bank_reconciliation',
  REPORTS: 'reports',
  GENERATED_INVOICES: 'generated_invoices',
  AI_ADVISOR: 'ai_advisor',
  FISCAL_MODULE: 'fiscal_module',
  CRM: 'crm',
  INTEGRATIONS: 'integrations',
  USER_MANAGEMENT: 'user_management',
  CONTACTS: 'contacts',
  HELP: 'help',
  ACCOUNTANT_PANEL: 'accountant_panel',
  PROPERTIES: 'properties',
  PROJECTS: 'projects',
  PROPOSALS: 'proposals',
  PRICE_QUOTATIONS: 'price_quotations',
  SCHEMA_GENERATOR: 'schema_generator',
  COST_CENTERS: 'cost_centers',
  COMPANY_PROFILE: 'company_profile',
  PLAN_SUBSCRIPTION: 'plan_subscription',
  SETTINGS: 'settings',
  CATEGORIES: 'categories',
  INDEXES: 'indexes',
};

export const MOCK_COMPANIES: Company[] = [
    { id: 'comp1', name: 'Minha Empresa (Matriz)', cnpj: '12.345.678/0001-99', address: { street: 'Rua Principal', number: '123', neighborhood: 'Centro', city: 'São Paulo', state: 'SP', zip: '01000-000' }, plan: 'Enterprise', enabledModules: ['properties', 'fiscal', 'integrations', 'ai_advisor', 'projects'] },
    { id: 'comp2', name: 'Filial São Paulo', cnpj: '12.345.678/0002-80', address: { street: 'Avenida Paulista', number: '1500', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP', zip: '01310-200' }, plan: 'Pro', enabledModules: ['properties'] },
    { id: 'comp3', name: 'Filial Rio de Janeiro', cnpj: '12.345.678/0003-60', address: { street: 'Avenida Atlântica', number: '2000', neighborhood: 'Copacabana', city: 'Rio de Janeiro', state: 'RJ', zip: '22021-001' }, plan: 'Basic', enabledModules: [] }
];

export const MOCK_CONTACTS: Contact[] = [
    { id: 'contact1', name: 'Cliente A Soluções', type: 'Cliente', document: '11.222.333/0001-44', email: 'contato@clientea.com', phone: '(21) 98765-4321', company: 'Minha Empresa (Matriz)', address: { street: 'Rua das Laranjeiras', number: '500', neighborhood: 'Laranjeiras', city: 'Rio de Janeiro', state: 'RJ', zip: '22240-000' }, taxRegime: 'Lucro Presumido', icon: COMPANY_AVATARS[0] },
    { id: 'contact2', name: 'Fornecedor de Café XYZ', type: 'Fornecedor', document: '44.555.666/0001-77', email: 'vendas@cafexyz.com', phone: '(11) 91234-5678', company: 'Filial São Paulo', address: { street: 'Rua do Café', number: '10', neighborhood: 'Centro', city: 'São Paulo', state: 'SP', zip: '01010-010' }, taxRegime: 'Simples Nacional', icon: COMPANY_AVATARS[1] },
    { id: 'contact3', 'name': 'Inova Corp', 'type': 'Cliente', 'document': '22.333.444/0001-55', 'email': 'financeiro@inovacorp.com', 'phone': '(31) 99999-8888', company: 'Filial São Paulo', address: { street: 'Avenida Afonso Pena', number: '4000', neighborhood: 'Serra', city: 'Belo Horizonte', state: 'MG', zip: '30130-009' }, taxRegime: 'Lucro Real', icon: COMPANY_AVATARS[2] },
    { id: 'contact4', name: 'Aluguel Escritório Imóveis', type: 'Proprietário', document: '55.666.777/0001-88', email: 'admin@imoveis.com', phone: '(11) 98888-7777', company: 'Minha Empresa (Matriz)', address: { street: 'Rua Augusta', number: '2500', neighborhood: 'Jardins', city: 'São Paulo', state: 'SP', zip: '01412-100' }, taxRegime: 'Lucro Presumido', bankDetails: { bankName: 'Banco Itaú', agency: '0123', account: '45678-9', pixKey: '55.666.777/0001-88' }, icon: COMPANY_AVATARS[3] },
    { id: 'contact5', name: 'Companhia de Energia Elétrica', type: 'Fornecedor', document: '66.777.888/0001-99', email: 'faturas@energia.com', phone: '(11) 0800-1234', company: 'Minha Empresa (Matriz)', address: { street: 'Rua da Luz', number: '100', neighborhood: 'Centro', city: 'São Paulo', state: 'SP', zip: '01011-011' }, taxRegime: 'Lucro Real', icon: COMPANY_AVATARS[4] },
    { id: 'contact6', name: 'Prefeitura Municipal', type: 'Fornecedor', document: '77.888.999/0001-00', email: 'iptu@prefeitura.gov', phone: '(21) 156', company: 'Filial Rio de Janeiro', address: { street: 'Praça da Cidade', number: '1', neighborhood: 'Centro', city: 'Rio de Janeiro', state: 'RJ', zip: '20000-000' }, taxRegime: 'Lucro Real', icon: COMPANY_AVATARS[5] },
    { id: 'contact7', name: 'Mariana Silva (Inquilino)', type: 'Cliente', document: '123.456.789-00', email: 'mariana.silva@email.com', phone: '(11) 98765-1122', company: 'Filial São Paulo', address: { street: 'Avenida Paulista', number: '1800', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP', zip: '01310-200' }, taxRegime: 'Simples Nacional', icon: CONTACT_AVATARS[0] },
    { id: 'contact8', name: 'João Pereira (Proprietário)', type: 'Proprietário', document: '987.654.321-11', email: 'joao.prop@email.com', phone: '(21) 99887-2233', company: 'Filial Rio de Janeiro', address: { street: 'Rua do Sol', number: '150', neighborhood: 'Botafogo', city: 'Rio de Janeiro', state: 'RJ', zip: '22270-000' }, taxRegime: 'Lucro Presumido', bankDetails: { bankName: 'Banco Bradesco', agency: '4321', account: '98765-4' }, icon: CONTACT_AVATARS[1] },
    { id: 'contact9', name: 'Ricardo Mendes (Cliente)', type: 'Cliente', document: '111.222.333-44', email: 'ricardo.mendes@email.com', phone: '(11) 97654-1234', company: 'Minha Empresa (Matriz)', address: { street: 'Rua Faria Lima', number: '1234', neighborhood: 'Pinheiros', city: 'São Paulo', state: 'SP', zip: '05426-100' }, taxRegime: 'Simples Nacional', icon: CONTACT_AVATARS[2] },
    { id: 'contact10', name: 'Global Tech Fornecedor', type: 'Fornecedor', document: '99.888.777/0001-66', email: 'comercial@globaltech.com', phone: '(48) 3232-5566', company: 'Minha Empresa (Matriz)', address: { street: 'Rodovia SC-401', number: '5000', neighborhood: 'Saco Grande', city: 'Florianópolis', state: 'SC', zip: '88032-005' }, taxRegime: 'Lucro Presumido', icon: COMPANY_AVATARS[6] },
];


export const MOCK_BANK_ACCOUNTS: BankAccount[] = [
    { id: 'acc1', name: 'Banco do Brasil', agency: '1234-5', account: '10101-1', balance: 75230.50, logoUrl: 'https://logo.clearbit.com/bb.com.br', company: 'Minha Empresa (Matriz)' },
    { id: 'acc2', name: 'Itaú Unibanco', agency: '5678-9', account: '20202-2', balance: 120500.00, logoUrl: 'https://logo.clearbit.com/itau.com.br', company: 'Filial São Paulo' },
    { id: 'acc3', name: 'Nubank', agency: '0001', account: '30303-3', balance: 12890.75, logoUrl: 'https://logo.clearbit.com/nubank.com.br', company: 'Minha Empresa (Matriz)' },
    { id: 'acc4', name: 'Bradesco', agency: '1122-3', account: '40404-4', balance: 45000.00, logoUrl: 'https://logo.clearbit.com/bradesco.com.br', company: 'Filial Rio de Janeiro' },
];

export const MOCK_COST_CENTERS_DATA: CostCenter[] = [
    { id: 'cc1', name: 'Administrativo', description: 'Despesas gerais da administração.', budget: 15000, company: 'Minha Empresa (Matriz)' },
    { id: 'cc2', name: 'Vendas & Marketing', description: 'Custos relacionados a marketing e equipe de vendas.', budget: 10000, company: 'Minha Empresa (Matriz)' },
    { id: 'cc3', name: 'Tecnologia & Produto', description: 'Custos com software, hardware e desenvolvimento.', budget: 8000, company: 'Minha Empresa (Matriz)' },
    { id: 'cc4', name: 'Operações', description: 'Custos operacionais da filial de São Paulo.', budget: 5000, company: 'Filial São Paulo' },
    { id: 'cc5', name: 'Imobiliário', description: 'Custos e receitas de gestão de imóveis.', budget: 2000, company: 'Filial Rio de Janeiro' },
    { id: 'cc6', name: 'Administrativo', description: 'Despesas gerais da administração da filial.', company: 'Filial São Paulo' },
];

export const MOCK_PAYMENT_METHODS = ['Boleto', 'Transferência (TED/DOC)', 'Pix', 'Cartão de Crédito', 'Débito Automático', 'Dinheiro'];

export const MOCK_CATEGORIES_DATA: Category[] = [
  // Despesas
  { id: 'cat-d1', name: 'Despesas Operacionais', type: 'despesa', company: 'Minha Empresa (Matriz)' },
  { id: 'cat-d2', name: 'Tecnologia', type: 'despesa', company: 'Minha Empresa (Matriz)' },
  { id: 'cat-d3', name: 'Suprimentos', type: 'despesa', company: 'Minha Empresa (Matriz)' },
  { id: 'cat-d4', name: 'Utilities', type: 'despesa', company: 'Minha Empresa (Matriz)' },
  { id: 'cat-d5', name: 'Marketing', type: 'despesa', company: 'Minha Empresa (Matriz)' },
  { id: 'cat-d6', name: 'Salários e Encargos', type: 'despesa', company: 'Minha Empresa (Matriz)' },
  { id: 'cat-d7', name: 'Impostos e Taxas', type: 'despesa', company: 'Minha Empresa (Matriz)' },
  { id: 'cat-d8', name: 'Viagens e Deslocamento', type: 'despesa', company: 'Minha Empresa (Matriz)' },
  { id: 'cat-d9', name: 'Manutenção de Imóvel', type: 'despesa', company: 'Minha Empresa (Matriz)' },
  { id: 'cat-d10', name: 'Outros', type: 'despesa', company: 'Minha Empresa (Matriz)' },

  // Receitas
  { id: 'cat-r1', name: 'Venda de Serviços', type: 'receita', company: 'Minha Empresa (Matriz)' },
  { id: 'cat-r2', name: 'Venda de Produtos', type: 'receita', company: 'Minha Empresa (Matriz)' },
  { id: 'cat-r3', name: 'Aluguéis', type: 'receita', company: 'Minha Empresa (Matriz)' },
  { id: 'cat-r4', name: 'Consultoria', type: 'receita', company: 'Minha Empresa (Matriz)' },
];

export const MOCK_ADJUSTMENT_INDEXES_DATA: AdjustmentIndex[] = [
    { id: 'idx1', name: 'IGP-M', description: 'Índice Geral de Preços – Mercado (FGV)', company: 'Minha Empresa (Matriz)', value: 4.5 },
    { id: 'idx2', name: 'IPCA', description: 'Índice Nacional de Preços ao Consumidor Amplo (IBGE)', company: 'Minha Empresa (Matriz)', value: 3.9 },
    { id: 'idx3', name: 'IVAR', description: 'Índice de Variação de Aluguéis Residenciais (FGV)', company: 'Minha Empresa (Matriz)', value: 5.0 },
];

export const MOCK_PAYABLES: Transaction[] = [
  { id: 'p1', description: 'Aluguel do Escritório', category: 'Despesas Operacionais', amount: 5500.00, dueDate: '2024-07-05', paymentDate: '2024-07-05', status: 'Pago', type: 'despesa', company: 'Minha Empresa (Matriz)', costCenter: 'Administrativo', bankAccount: 'acc1', paymentMethod: 'Débito Automático', recurrence: { interval: 'monthly' }, fixedOrVariable: 'fixa', contactId: 'contact4' },
  { id: 'p2', description: 'Software de Gestão (SaaS)', category: 'Tecnologia', amount: 750.00, dueDate: '2024-07-10', paymentDate: '2024-07-10', status: 'Pago', type: 'despesa', company: 'Minha Empresa (Matriz)', costCenter: 'Tecnologia & Produto', bankAccount: 'acc1', paymentMethod: 'Cartão de Crédito', recurrence: { interval: 'monthly' }, fixedOrVariable: 'fixa' },
  { id: 'p3', description: 'Fornecedor de Café XYZ', category: 'Suprimentos', amount: 250.00, dueDate: '2024-07-15', status: 'Pendente', type: 'despesa', company: 'Filial São Paulo', costCenter: 'Administrativo', bankAccount: 'acc2', paymentMethod: 'Boleto', interestRate: 0.5, interestType: 'daily', fixedOrVariable: 'variável', contactId: 'contact2' },
  { id: 'p4', description: 'Conta de Energia Elétrica', category: 'Utilities', amount: 1200.00, dueDate: '2024-07-20', status: 'Agendado', type: 'despesa', company: 'Minha Empresa (Matriz)', costCenter: 'Administrativo', bankAccount: 'acc1', paymentMethod: 'Boleto', interestRate: 1, interestType: 'monthly', fixedOrVariable: 'variável', contactId: 'contact5' },
  { id: 'p5', description: 'Campanha Google Ads', category: 'Marketing', amount: 3000.00, dueDate: '2024-06-25', status: 'Vencido', type: 'despesa', company: 'Minha Empresa (Matriz)', costCenter: 'Vendas & Marketing', bankAccount: 'acc3', paymentMethod: 'Cartão de Crédito', interestRate: 1, interestType: 'daily', fixedOrVariable: 'variável' },
  { id: 'p6', description: 'Servidores AWS', category: 'Tecnologia', amount: 1800.00, dueDate: '2024-07-12', paymentDate: '2024-07-12', status: 'Pago', type: 'despesa', company: 'Filial Rio de Janeiro', costCenter: 'Tecnologia & Produto', bankAccount: 'acc4', paymentMethod: 'Débito Automático', recurrence: { interval: 'monthly' }, fixedOrVariable: 'fixa' },
  { id: 'p7', description: 'IPTU Sala Comercial', category: 'Impostos e Taxas', amount: 450.00, dueDate: '2024-07-10', status: 'Pendente', type: 'despesa', company: 'Filial Rio de Janeiro', costCenter: 'Imobiliário', bankAccount: 'acc4', paymentMethod: 'Boleto', propertyId: 'prop2', contactId: 'contact6' },

];

export const MOCK_RECEIVABLES: Transaction[] = [
  { id: 'r1', description: 'Projeto Cliente A', category: 'Serviços Prestados', amount: 15000.00, dueDate: '2024-07-01', paymentDate: '2024-07-01', status: 'Pago', type: 'receita', company: 'Minha Empresa (Matriz)', costCenter: 'Tecnologia & Produto', bankAccount: 'acc1', contactId: 'contact1' },
  { id: 'r2', description: 'Manutenção Cliente B', category: 'Contratos Recorrentes', amount: 2500.00, dueDate: '2024-07-10', paymentDate: '2024-07-11', status: 'Pago', type: 'receita', company: 'Minha Empresa (Matriz)', costCenter: 'Operações', bankAccount: 'acc1', recurrence: { interval: 'monthly' } },
  { id: 'r3', description: 'Consultoria Cliente C', category: 'Serviços Prestados', amount: 8000.00, dueDate: '2024-07-18', status: 'Pendente', type: 'receita', company: 'Filial São Paulo', costCenter: 'Vendas & Marketing', bankAccount: 'acc2', interestRate: 1, interestType: 'daily', contactId: 'contact3' },
  { id: 'r4', description: 'Venda de Produto D', category: 'Vendas de Produtos', amount: 4500.00, dueDate: '2024-07-25', status: 'Pendente', type: 'receita', company: 'Minha Empresa (Matriz)', costCenter: 'Vendas & Marketing', bankAccount: 'acc3', interestRate: 1.5, interestType: 'monthly' },
  { id: 'r5', description: 'Projeto Cliente E', category: 'Serviços Prestados', amount: 12000.00, dueDate: '2024-06-28', status: 'Vencido', type: 'receita', company: 'Filial São Paulo', costCenter: 'Operações', bankAccount: 'acc4', interestRate: 2, interestType: 'monthly', contactId: 'contact3' },
  { id: 'r6', description: 'Aluguel Apto Av. Paulista', category: 'Aluguéis', amount: 4500, dueDate: '2024-07-10', status: 'Pendente', type: 'receita', company: 'Filial São Paulo', costCenter: 'Imobiliário', bankAccount: 'acc2', contactId: 'contact7', propertyId: 'prop1' },
  { id: 'r7', description: 'Consultoria de SEO', category: 'Serviços Prestados', amount: 4800.00, dueDate: '2024-06-20', status: 'Vencido', type: 'receita', company: 'Minha Empresa (Matriz)', costCenter: 'Vendas & Marketing', bankAccount: 'acc1', interestRate: 1, interestType: 'daily', contactId: 'contact1' },
  { id: 'r8', description: 'Desenvolvimento de App', category: 'Serviços Prestados', amount: 25000.00, dueDate: '2024-05-15', status: 'Vencido', type: 'receita', company: 'Minha Empresa (Matriz)', costCenter: 'Tecnologia & Produto', bankAccount: 'acc1', interestRate: 2, interestType: 'monthly', contactId: 'contact1' },
];

export const MOCK_CASH_FLOW_DATA: CashFlowData[] = [
    { month: 'Jan', receitas: 35000, despesas: 22000, saldo: 13000 },
    { month: 'Fev', receitas: 41000, despesas: 25000, saldo: 16000 },
    { month: 'Mar', receitas: 38000, despesas: 23000, saldo: 15000 },
    { month: 'Abr', receitas: 45000, despesas: 28000, saldo: 17000 },
    { month: 'Mai', receitas: 42000, despesas: 26000, saldo: 16000 },
    { month: 'Jun', receitas: 51000, despesas: 31000, saldo: 20000 },
];

export const MOCK_BANK_TRANSACTIONS: BankTransaction[] = [
    { id: 'bt1', bankAccountId: 'acc1', date: '2024-07-01', description: 'TEF 12345 CLIENTE A', amount: 15000.00, type: 'credit' },
    { id: 'bt2', bankAccountId: 'acc1', date: '2024-07-05', description: 'PAGTO ALUGUEL IMOVEL', amount: 5500.00, type: 'debit' },
    { id: 'bt3', bankAccountId: 'acc1', date: '2024-07-10', description: 'PIX SOFTWARE LTDA', amount: 750.00, type: 'debit' },
    { id: 'bt4', bankAccountId: 'acc1', date: '2024-07-10', description: 'CRED PIX CLIENTE B', amount: 2500.00, type: 'credit' },
    { id: 'bt5', bankAccountId: 'acc1', date: '2024-07-12', description: 'TAXA BANCARIA', amount: 45.90, type: 'debit' },
    { id: 'bt6', bankAccountId: 'acc4', date: '2024-07-12', description: 'DOC AMAZON WEB SERVICES', amount: 1800.00, type: 'debit' },
];

export const MOCK_SYSTEM_TRANSACTIONS: SystemTransaction[] = [
    { id: 'st1', bankAccountId: 'acc1', date: '2024-07-01', description: 'Projeto Cliente A', amount: 15000.00, type: 'credit', matched: false, company: 'Minha Empresa (Matriz)' },
    { id: 'st2', bankAccountId: 'acc1', date: '2024-07-05', description: 'Aluguel do Escritório', amount: 5500.00, type: 'debit', matched: false, company: 'Minha Empresa (Matriz)' },
    { id: 'st3', bankAccountId: 'acc1', date: '2024-07-10', description: 'Software de Gestão (SaaS)', amount: 750.00, type: 'debit', matched: false, company: 'Minha Empresa (Matriz)' },
    { id: 'st4', bankAccountId: 'acc1', date: '2024-07-10', description: 'Manutenção Cliente B', amount: 2500.00, type: 'credit', matched: false, company: 'Minha Empresa (Matriz)' },
    { id: 'st5', bankAccountId: 'acc2', date: '2024-07-18', description: 'Consultoria Cliente C', amount: 8000.00, type: 'credit', matched: false, company: 'Filial São Paulo' },
    { id: 'st6', bankAccountId: 'acc4', date: '2024-07-12', description: 'Servidores AWS', amount: 1800.00, type: 'debit', matched: false, company: 'Filial Rio de Janeiro' },
];

export const MOCK_BANKS = ['Banco do Brasil', 'Itaú Unibanco', 'Bradesco', 'Caixa Econômica', 'Santander'];

export const MOCK_DEFAULT_RATE_DATA: DefaultRateData[] = [
    { month: 'Jan', inadimplencia: 5.2 },
    { month: 'Fev', inadimplencia: 4.8 },
    { month: 'Mar', inadimplencia: 6.1 },
    { month: 'Abr', inadimplencia: 5.5 },
    { month: 'Mai', inadimplencia: 5.9 },
    { month: 'Jun', inadimplencia: 6.5 },
];

export const MOCK_NET_PROFIT_DATA: NetProfitData[] = [
    { month: 'Jan', lucro: 13000 },
    { month: 'Fev', lucro: 16000 },
    { month: 'Mar', lucro: 15000 },
    { month: 'Abr', lucro: 17000 },
    { month: 'Mai', lucro: 16000 },
    { month: 'Jun', lucro: 20000 },
];

// CRM Constants
export const FUNNEL_STAGES: FunnelStage[] = ['Notificação', 'Negociação', 'Acordo', 'Ação Jurídica'];

export const MOCK_DEBTORS: DebtorCustomer[] = [
    {
        id: 'd1', name: 'Tech Solutions Ltda', avatar: 'https://randomuser.me/api/portraits/men/75.jpg', totalDebt: 12000.00, lastDueDate: '2024-06-15', status: 'Notificação', communicationHistory: [
            { id: 'c1', date: '2024-06-20', type: 'email', summary: 'Primeiro e-mail de cobrança enviado.' }
        ],
        company: 'Minha Empresa (Matriz)',
        hasOpenInvoice: true,
    },
    {
        id: 'd2', name: 'Inova Corp', avatar: 'https://randomuser.me/api/portraits/women/75.jpg', totalDebt: 7500.00, lastDueDate: '2024-05-30', status: 'Negociação', communicationHistory: [
            { id: 'c2-1', date: '2024-06-05', type: 'email', summary: 'E-mail de cobrança enviado.' },
            { id: 'c2-2', date: '2024-06-12', type: 'call', summary: 'Contato telefônico realizado. Cliente pediu para renegociar.' },
            { id: 'c2-3', date: '2024-06-18', type: 'whatsapp', summary: 'Proposta de parcelamento enviada via WhatsApp.' }
        ],
        company: 'Filial São Paulo',
        hasOpenInvoice: true,
    },
    {
        id: 'd3', name: 'Mercado Central', avatar: 'https://randomuser.me/api/portraits/men/76.jpg', totalDebt: 4300.00, lastDueDate: '2024-06-10', status: 'Notificação', communicationHistory: [
            { id: 'c3-1', date: '2024-06-15', type: 'sms', summary: 'Lembrete de vencimento via SMS.' },
             { id: 'c3-2', date: '2024-06-18', type: 'email', summary: 'E-mail de cobrança enviado.' }
        ],
        company: 'Filial São Paulo',
        hasOpenInvoice: true,
    },
    {
        id: 'd4', name: 'Construtora Forte', avatar: 'https://randomuser.me/api/portraits/women/76.jpg', totalDebt: 35000.00, lastDueDate: '2024-04-20', status: 'Ação Jurídica', communicationHistory: [
             { id: 'c4-1', date: '2024-05-01', type: 'call', summary: 'Tentativa de contato, sem sucesso.' },
             { id: 'c4-2', date: '2024-05-15', type: 'email', summary: 'Notificação extrajudicial enviada por e-mail.' },
             { id: 'c4-3', date: '2024-06-01', type: 'call', summary: 'Contato com o financeiro, sem proposta de pagamento.' }
        ],
        company: 'Filial Rio de Janeiro',
        hasOpenInvoice: false,
    },
    {
        id: 'd5', name: 'Design Studio Criativo', avatar: 'https://randomuser.me/api/portraits/men/77.jpg', totalDebt: 1500.00, lastDueDate: '2024-06-01', status: 'Acordo', communicationHistory: [
             { id: 'c5-1', date: '2024-06-06', type: 'email', summary: 'E-mail de cobrança.' },
             { id: 'c5-2', date: '2024-06-10', type: 'call', summary: 'Acordo de pagamento em 2x firmado.' }
        ],
        company: 'Minha Empresa (Matriz)',
        hasOpenInvoice: true,
    }
];

// User Management Constants
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
    'Admin': [
        'Acesso total a todas as funcionalidades.',
        'Gerenciar usuários e permissões.',
        'Configurar integrações e empresas.',
        'Visualizar todos os relatórios financeiros.',
    ],
    'Manager': [
        'Aprovar e gerenciar despesas e receitas.',
        'Visualizar dashboards e relatórios da(s) sua(s) empresa(s).',
        'Gerenciar o funil de cobranças (CRM).',
        'Não pode gerenciar usuários ou configurações globais.',
    ],
    'Analyst': [
        'Acesso somente leitura aos dados financeiros.',
        'Pode visualizar dashboards e relatórios.',
        'Não pode criar, editar ou apagar transações.',
        'Ideal para consultores ou stakeholders externos.',
    ],
    'Contador': [
        'Acesso ao Painel do Contador.',
        'Visualizar dados financeiros de empresas permitidas.',
        'Solicitar documentos, esclarecimentos e lançamentos.',
        'Não pode criar, editar ou apagar transações.',
    ],
};

export const MODULE_PERMISSIONS_MAP: Record<ModuleKey, string> = {
    dashboard: 'Dashboard',
    payable: 'Contas a Pagar',
    receipts: 'Contas a Receber',
    contacts: 'Contatos',
    bank_accounts: 'Contas Bancárias',
    properties: 'Imóveis',
    projects: 'Projetos',
    reports: 'Relatórios',
    user_management: 'Administração',
    crm: 'CRM de Cobrança',
    fiscal_module: 'Módulo Fiscal',
    integrations: 'Integrações',
    ai_advisor: 'Consultor IA',
};

const fullAccess: UserPermissions = {
    dashboard: { view: true, edit: true, delete: true },
    payable: { view: true, edit: true, delete: true },
    receipts: { view: true, edit: true, delete: true },
    contacts: { view: true, edit: true, delete: true },
    bank_accounts: { view: true, edit: true, delete: true },
    properties: { view: true, edit: true, delete: true },
    projects: { view: true, edit: true, delete: true },
    reports: { view: true, edit: true, delete: true },
    user_management: { view: true, edit: true, delete: true },
    crm: { view: true, edit: true, delete: true },
    fiscal_module: { view: true, edit: true, delete: true },
    integrations: { view: true, edit: true, delete: true },
    ai_advisor: { view: true, edit: true, delete: true },
};

const managerAccess: UserPermissions = {
    dashboard: { view: true, edit: false, delete: false },
    payable: { view: true, edit: true, delete: false },
    receipts: { view: true, edit: true, delete: false },
    contacts: { view: true, edit: true, delete: false },
    bank_accounts: { view: true, edit: true, delete: false },
    properties: { view: true, edit: true, delete: false },
    projects: { view: true, edit: true, delete: false },
    reports: { view: true, edit: false, delete: false },
    user_management: { view: false, edit: false, delete: false },
    crm: { view: true, edit: true, delete: false },
    fiscal_module: { view: true, edit: false, delete: false },
    integrations: { view: false, edit: false, delete: false },
    ai_advisor: { view: true, edit: false, delete: false },
};

const analystAccess: UserPermissions = {
    dashboard: { view: true, edit: false, delete: false },
    payable: { view: true, edit: false, delete: false },
    receipts: { view: true, edit: false, delete: false },
    contacts: { view: true, edit: false, delete: false },
    bank_accounts: { view: true, edit: false, delete: false },
    properties: { view: true, edit: false, delete: false },
    projects: { view: true, edit: false, delete: false },
    reports: { view: true, edit: false, delete: false },
    user_management: { view: false, edit: false, delete: false },
    crm: { view: false, edit: false, delete: false },
    fiscal_module: { view: false, edit: false, delete: false },
    integrations: { view: false, edit: false, delete: false },
    ai_advisor: { view: false, edit: false, delete: false },
};

const accountantAccess: UserPermissions = {
    ...analystAccess, // Start with read-only
    // Accountants have specific access managed by their own panel
};

export const DEFAULT_PERMISSIONS: Record<Role, UserPermissions> = {
    Admin: fullAccess,
    Manager: managerAccess,
    Analyst: analystAccess,
    Contador: accountantAccess,
};


export const MOCK_USERS: User[] = [
    { id: 'user1', name: 'Ana Clara (Você)', email: 'ddarruspe@gmail.com', password: '1906', role: 'Admin', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', accessibleCompanies: ['Minha Empresa (Matriz)', 'Filial São Paulo', 'Filial Rio de Janeiro'], permissions: DEFAULT_PERMISSIONS.Admin },
    { id: 'user2', name: 'Bruno Gomes', email: 'bruno.gomes@email.com', password: 'password123', role: 'Manager', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', accessibleCompanies: ['Filial São Paulo'], permissions: DEFAULT_PERMISSIONS.Manager },
    { id: 'user3', name: 'Carlos Dias', email: 'carlos.dias@email.com', password: 'password123', role: 'Analyst', avatar: 'https://randomuser.me/api/portraits/men/45.jpg', accessibleCompanies: ['Minha Empresa (Matriz)'], permissions: DEFAULT_PERMISSIONS.Analyst },
    { id: 'user4', name: 'Daniela Faria', email: 'daniela.faria@email.com', password: 'password123', role: 'Manager', avatar: 'https://randomuser.me/api/portraits/women/31.jpg', accessibleCompanies: ['Filial Rio de Janeiro'], permissions: DEFAULT_PERMISSIONS.Manager },
    { id: 'user5', name: 'Sérgio Contábil', email: 'sergio.contabil@email.com', password: 'password123', role: 'Contador', avatar: 'https://randomuser.me/api/portraits/men/51.jpg', accessibleCompanies: ['Minha Empresa (Matriz)', 'Filial São Paulo'], permissions: DEFAULT_PERMISSIONS.Contador },
];


export const MOCK_AUDIT_LOGS: AuditLog[] = [
    { id: 'log1', userId: 'user2', userName: 'Bruno Gomes', userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg', action: 'aprovou a despesa "Compra de Monitores".', timestamp: '2024-07-28 10:45:12', company: 'Filial São Paulo' },
    { id: 'log2', userId: 'user1', userName: 'Ana Clara', userAvatar: 'https://randomuser.me/api/portraits/women/44.jpg', action: 'editou o usuário "Carlos Dias".', timestamp: '2024-07-28 09:30:05', company: 'Minha Empresa (Matriz)' },
    { id: 'log3', userId: 'user5', userName: 'Sérgio Contábil', userAvatar: 'https://randomuser.me/api/portraits/men/51.jpg', action: 'solicitou o documento "Extrato bancário de Junho/2024".', timestamp: '2024-07-28 08:15:00', company: 'Minha Empresa (Matriz)' },
    { id: 'log4', userId: 'user1', userName: 'Ana Clara', userAvatar: 'https://randomuser.me/api/portraits/women/44.jpg', action: 'exportou o relatório DRE em PDF.', timestamp: '2024-07-27 11:05:19', company: 'Filial Rio de Janeiro' },
    { id: 'log5', userId: 'user3', userName: 'Carlos Dias', userAvatar: 'https://randomuser.me/api/portraits/men/45.jpg', action: 'visualizou o Dashboard.', timestamp: '2024-07-27 10:01:56', company: 'Minha Empresa (Matriz)' },
];

export const MOCK_ACCOUNTANT_REQUESTS: AccountantRequest[] = [
    { 
        id: 'req1', 
        company: 'Minha Empresa (Matriz)', 
        requesterId: 'user5',
        requesterName: 'Sérgio Contábil',
        requestType: 'documento', 
        subject: 'Extrato bancário de Junho/2024 - Conta BB', 
        details: 'Por favor, anexe o extrato bancário completo da conta do Banco do Brasil referente ao mês de Junho de 2024 para fechamento.',
        status: 'Pendente', 
        createdAt: '2024-07-25',
        assignedToId: 'user1', // Ana Clara (Admin)
        priority: 'High',
    },
    { 
        id: 'req2', 
        company: 'Filial São Paulo', 
        requesterId: 'user5', 
        requesterName: 'Sérgio Contábil',
        requestType: 'esclarecimento', 
        subject: 'Despesa "Fornecedor de Café"', 
        details: 'Gostaria de confirmar se a despesa de R$ 250,00 com o fornecedor de café é recorrente ou pontual. É necessário para a correta classificação.',
        status: 'Resolvido', 
        createdAt: '2024-07-22',
        resolvedAt: '2024-07-23',
        assignedToId: 'user2', // Bruno Gomes (Manager)
        priority: 'Medium',
    }
];

export const MOCK_PROPERTIES: Property[] = [
    {
        id: 'prop1',
        name: 'Apartamento Av. Paulista',
        address: { street: 'Avenida Paulista', number: '1800', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP', zip: '01310-200' },
        type: 'Apartamento',
        status: 'Alugado',
        ownerId: 'contact4',
        rentalDetails: {
            tenantId: 'contact7',
            rentAmount: 4500,
            contractStart: '2023-01-15',
            contractEnd: '2025-07-15',
            paymentDay: 10,
            adjustmentIndexId: 'idx1',
        },
        company: 'Filial São Paulo',
        condoAmount: 850.00,
        condoDueDate: 5,
        iptuAmount: 320.00,
        iptuDueDate: 10,
        icon: 'https://images.unsplash.com/photo-1598228723793-52759bba239c?q=80&w=400&auto=format&fit=crop'
    },
    {
        id: 'prop2',
        name: 'Sala Comercial Centro RJ',
        address: { street: 'Avenida Rio Branco', number: '156', neighborhood: 'Centro', city: 'Rio de Janeiro', state: 'RJ', zip: '20040-003' },
        type: 'Comercial',
        status: 'À Venda',
        ownerId: 'contact8',
        saleDetails: {
            price: 750000
        },
        company: 'Filial Rio de Janeiro',
        condoAmount: 1200.00,
        condoDueDate: 15,
        iptuAmount: 980.00,
        iptuDueDate: 20,
        icon: 'https://images.unsplash.com/photo-1542314831-068cd1dbb563?q=80&w=400&auto=format&fit=crop'
    },
    {
        id: 'prop3',
        name: 'Casa no Morumbi',
        address: { street: 'Rua dos Jasmins', number: '45', neighborhood: 'Morumbi', city: 'São Paulo', state: 'SP', zip: '05655-000' },
        type: 'Casa',
        status: 'Disponível',
        ownerId: 'contact4',
        company: 'Minha Empresa (Matriz)',
        icon: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=400&auto=format&fit=crop'
    }
];

export const MOCK_PROJECTS: Project[] = [
    {
        id: 'proj1',
        name: 'Projeto Edifício Residencial Alfa',
        type: 'Residencial',
        status: 'Em Execução',
        clientId: 'contact1',
        company: 'Minha Empresa (Matriz)',
        totalArea: 2500,
        builtArea: 1800,
        allocationMethod: 'builtArea',
        costCenterName: 'Proj. Ed. Residencial Alfa',
        budget: [
            { id: 'b1-1', description: 'Cimento e Aço', type: 'Insumos', cost: 150000 },
            { id: 'b1-2', description: 'Equipe de Alvenaria', type: 'Mão de Obra', cost: 80000 },
            { id: 'b1-3', description: 'Serviço de Terraplanagem', type: 'Terceiros', cost: 35000 },
        ],
        stages: [
            { id: 's1-1', name: 'Fundação', dueDate: '2024-08-30', status: 'Concluído' },
            { id: 's1-2', name: 'Estrutura', dueDate: '2024-10-15', status: 'Aprovado Cliente' },
            { id: 's1-3', name: 'Acabamento', dueDate: '2025-01-20', status: 'Pendente' },
        ],
    },
    {
        id: 'proj2',
        name: 'Reforma Loja Shopping Center',
        type: 'Comercial',
        status: 'Concluído',
        clientId: 'contact3',
        company: 'Minha Empresa (Matriz)',
        totalArea: 300,
        builtArea: 300,
        allocationMethod: 'totalArea',
        costCenterName: 'Proj. Reforma Loja Shopping',
        budget: [
            { id: 'b2-1', description: 'Materiais de Acabamento', type: 'Insumos', cost: 50000 },
            { id: 'b2-2', description: 'Projeto de Iluminação', type: 'Terceiros', cost: 15000 },
        ],
        stages: [
            { id: 's2-1', name: 'Demolição e Limpeza', dueDate: '2024-06-10', status: 'Concluído' },
            { id: 's2-2', name: 'Instalações', dueDate: '2024-06-25', status: 'Concluído' },
            { id: 's2-3', name: 'Finalização', dueDate: '2024-07-05', status: 'Concluído' },
        ],
    },
    {
        id: 'proj3',
        name: 'Planejamento Galpão Industrial',
        type: 'Industrial',
        status: 'Planejamento',
        clientId: 'contact1',
        company: 'Minha Empresa (Matriz)',
        allocationMethod: 'none',
        costCenterName: 'Proj. Plan. Galpão Industrial',
        budget: [],
        stages: [
            { id: 's3-1', name: 'Estudo de Viabilidade', dueDate: '2024-09-01', status: 'Pendente' },
        ],
    }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 'notif1',
        type: 'accountant_request',
        title: 'Nova Pendência Contábil',
        description: 'Sérgio Contábil solicitou: "Extrato bancário de Junho/2024"',
        timestamp: '2024-07-28T10:00:00.000Z',
        isRead: true,
        entityId: 'req1',
        company: 'Minha Empresa (Matriz)'
    },
    {
        id: 'notif2',
        type: 'overdue_payable',
        title: 'Conta a Pagar Vencida',
        description: 'A transação "Campanha Google Ads" venceu.',
        timestamp: '2024-07-27T14:30:00.000Z',
        isRead: false,
        entityId: 'p5',
        company: 'Minha Empresa (Matriz)'
    }
];

export const MOCK_PROPOSALS: Proposal[] = [
    {
        id: 'prop-1',
        name: 'Proposta de Design de Interiores - Apto 101',
        clientId: 'contact1',
        scope: 'Elaboração de projeto completo de design de interiores, incluindo planta baixa, layout de mobiliário, projeto de iluminação e memorial descritivo de materiais.',
        status: 'Aprovada',
        items: [
            { id: 'pi-1-1', description: 'Estudo Preliminar e Layout', value: 5000 },
            { id: 'pi-1-2', description: 'Projeto Executivo Completo', value: 12000 },
        ],
        createdAt: '2024-07-15T10:00:00.000Z',
        company: 'Minha Empresa (Matriz)'
    },
    {
        id: 'prop-2',
        name: 'Proposta Projeto Estrutural - Ed. Comercial',
        clientId: 'contact3',
        scope: 'Cálculo e detalhamento do projeto estrutural em concreto armado para o novo edifício comercial.',
        status: 'Enviada',
        items: [
            { id: 'pi-2-1', description: 'Projeto Estrutural', value: 25000 },
            { id: 'pi-2-2', description: 'Acompanhamento Técnico (ART)', value: 1500 },
        ],
        createdAt: '2024-07-20T14:30:00.000Z',
        company: 'Minha Empresa (Matriz)'
    },
    {
        id: 'prop-3',
        name: 'Consultoria de Viabilidade',
        clientId: 'contact1',
        scope: 'Análise de viabilidade técnica e legal para construção em terreno.',
        status: 'Rascunho',
        items: [
            { id: 'pi-3-1', description: 'Laudo de Viabilidade', value: 3500 },
        ],
        createdAt: '2024-07-28T09:00:00.000Z',
        company: 'Filial São Paulo'
    }
];

export const MOCK_QUOTATIONS: QuotationRequest[] = [
    {
        id: 'quote1',
        title: 'Compra de Notebooks para Equipe de Vendas',
        status: 'Cotação',
        items: [
            { id: 'qi1-1', description: 'Notebook Dell Vostro i7, 16GB RAM, 512GB SSD', quantity: 5, unit: 'un' },
            { id: 'qi1-2', description: 'Mouse sem fio Logitech M185', quantity: 5, unit: 'un' },
        ],
        suppliers: [
            { supplierId: 'contact10' }, // Global Tech
            { supplierId: 'contact2' }, // Café XYZ (for example)
        ],
        createdAt: '2024-07-28T11:00:00.000Z',
        deadline: '2024-08-05T23:59:59.000Z',
        company: 'Minha Empresa (Matriz)',
    },
    {
        id: 'quote2',
        title: 'Material de Escritório Mensal',
        status: 'Concluída',
        items: [
            { id: 'qi2-1', description: 'Resma de Papel A4', quantity: 10, unit: 'cx' },
            { id: 'qi2-2', description: 'Caneta Azul BIC', quantity: 50, unit: 'un' },
        ],
        suppliers: [
            { supplierId: 'contact10' },
        ],
        createdAt: '2024-06-15T09:00:00.000Z',
        company: 'Filial São Paulo',
        selectedSupplierId: 'contact10',
    }
];