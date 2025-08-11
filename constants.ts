
import type { View, Transaction, CashFlowData, BankTransaction, SystemTransaction, DefaultRateData, NetProfitData, DebtorCustomer, FunnelStage, BankAccount, Role, User, AuditLog, Company, Contact, AccountantRequest } from './types';

export const VIEWS: { [key: string]: View } = {
  DASHBOARD: 'dashboard',
  PAYABLE: 'payable',
  PAYABLE_RECURRENCES: 'payable_recurrences',
  PAYMENT_SCHEDULE: 'payment_schedule',
  RECEIPTS: 'receipts',
  RECURRENCES: 'recurrences',
  CASH_MANAGEMENT: 'cash_management',
  CASH_FLOW_RECORDS: 'cash_flow_records',
  BANK_ACCOUNTS: 'bank_accounts',
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
};

export const MOCK_COMPANIES: Company[] = [
    { id: 'comp1', name: 'Minha Empresa (Matriz)', cnpj: '12.345.678/0001-99', address: 'Rua Principal, 123, Centro' },
    { id: 'comp2', name: 'Filial São Paulo', cnpj: '12.345.678/0002-80', address: 'Avenida Paulista, 1500, São Paulo' },
    { id: 'comp3', name: 'Filial Rio de Janeiro', cnpj: '12.345.678/0003-60', address: 'Avenida Atlântica, 2000, Rio de Janeiro' }
];

export const MOCK_CONTACTS: Contact[] = [
    { id: 'contact1', name: 'Cliente A Soluções', type: 'Cliente', document: '11.222.333/0001-44', email: 'contato@clientea.com', phone: '(11) 98765-4321', company: 'Minha Empresa (Matriz)' },
    { id: 'contact2', name: 'Fornecedor de Café XYZ', type: 'Fornecedor', document: '44.555.666/0001-77', email: 'vendas@cafexyz.com', phone: '(21) 91234-5678', company: 'Filial São Paulo' },
    { id: 'contact3', 'name': 'Inova Corp', 'type': 'Cliente', 'document': '22.333.444/0001-55', 'email': 'financeiro@inovacorp.com', 'phone': '(31) 99999-8888', company: 'Filial São Paulo'},
    { id: 'contact4', name: 'Aluguel Escritório Imóveis', type: 'Fornecedor', document: '55.666.777/0001-88', email: 'admin@imoveis.com', phone: '(41) 98888-7777', company: 'Minha Empresa (Matriz)' },
];


export const MOCK_BANK_ACCOUNTS: BankAccount[] = [
    { id: 'acc1', name: 'Banco do Brasil', agency: '1234-5', account: '10101-1', balance: 75230.50, logoUrl: 'https://logo.clearbit.com/bb.com.br', company: 'Minha Empresa (Matriz)' },
    { id: 'acc2', name: 'Itaú Unibanco', agency: '5678-9', account: '20202-2', balance: 120500.00, logoUrl: 'https://logo.clearbit.com/itau.com.br', company: 'Filial São Paulo' },
    { id: 'acc3', name: 'Nubank', agency: '0001', account: '30303-3', balance: 12890.75, logoUrl: 'https://logo.clearbit.com/nubank.com.br', company: 'Minha Empresa (Matriz)' },
    { id: 'acc4', name: 'Bradesco', agency: '1122-3', account: '40404-4', balance: 45000.00, logoUrl: 'https://logo.clearbit.com/bradesco.com.br', company: 'Filial Rio de Janeiro' },
];

export const MOCK_COST_CENTERS = ['Administrativo', 'Vendas & Marketing', 'Tecnologia & Produto', 'Operações'];

export const MOCK_PAYMENT_METHODS = ['Boleto', 'Transferência (TED/DOC)', 'Pix', 'Cartão de Crédito', 'Débito Automático', 'Dinheiro'];

export const MOCK_PAYMENT_CATEGORIES = [
    'Despesas Operacionais',
    'Tecnologia',
    'Suprimentos',
    'Utilities',
    'Marketing',
    'Salários e Encargos',
    'Impostos e Taxas',
    'Viagens e Deslocamento',
    'Outros'
];

export const MOCK_PAYABLES: Transaction[] = [
  { id: 'p1', description: 'Aluguel do Escritório', category: 'Despesas Operacionais', amount: 5500.00, dueDate: '2024-07-05', paymentDate: '2024-07-05', status: 'Pago', type: 'despesa', company: 'Minha Empresa (Matriz)', costCenter: 'Administrativo', bankAccount: 'acc1', paymentMethod: 'Débito Automático', recurrence: { interval: 'monthly' }, fixedOrVariable: 'fixa', contactId: 'contact4' },
  { id: 'p2', description: 'Software de Gestão (SaaS)', category: 'Tecnologia', amount: 750.00, dueDate: '2024-07-10', paymentDate: '2024-07-10', status: 'Pago', type: 'despesa', company: 'Minha Empresa (Matriz)', costCenter: 'Tecnologia & Produto', bankAccount: 'acc1', paymentMethod: 'Cartão de Crédito', recurrence: { interval: 'monthly' }, fixedOrVariable: 'fixa' },
  { id: 'p3', description: 'Fornecedor de Café XYZ', category: 'Suprimentos', amount: 250.00, dueDate: '2024-07-15', status: 'Pendente', type: 'despesa', company: 'Filial São Paulo', costCenter: 'Administrativo', bankAccount: 'acc2', paymentMethod: 'Boleto', interestRate: 0.5, interestType: 'daily', fixedOrVariable: 'variável', contactId: 'contact2' },
  { id: 'p4', description: 'Conta de Energia Elétrica', category: 'Utilities', amount: 1200.00, dueDate: '2024-07-20', status: 'Agendado', type: 'despesa', company: 'Minha Empresa (Matriz)', costCenter: 'Administrativo', bankAccount: 'acc1', paymentMethod: 'Boleto', interestRate: 1, interestType: 'monthly', fixedOrVariable: 'variável' },
  { id: 'p5', description: 'Campanha Google Ads', category: 'Marketing', amount: 3000.00, dueDate: '2024-06-25', status: 'Vencido', type: 'despesa', company: 'Minha Empresa (Matriz)', costCenter: 'Vendas & Marketing', bankAccount: 'acc3', paymentMethod: 'Cartão de Crédito', interestRate: 1, interestType: 'daily', fixedOrVariable: 'variável' },
  { id: 'p6', description: 'Servidores AWS', category: 'Tecnologia', amount: 1800.00, dueDate: '2024-07-12', paymentDate: '2024-07-12', status: 'Pago', type: 'despesa', company: 'Filial Rio de Janeiro', costCenter: 'Tecnologia & Produto', bankAccount: 'acc4', paymentMethod: 'Débito Automático', recurrence: { interval: 'monthly' }, fixedOrVariable: 'fixa' },

];

export const MOCK_RECEIVABLES: Transaction[] = [
  { id: 'r1', description: 'Projeto Cliente A', category: 'Serviços Prestados', amount: 15000.00, dueDate: '2024-07-01', paymentDate: '2024-07-01', status: 'Pago', type: 'receita', company: 'Minha Empresa (Matriz)', costCenter: 'Tecnologia & Produto', bankAccount: 'acc1', contactId: 'contact1' },
  { id: 'r2', description: 'Manutenção Cliente B', category: 'Contratos Recorrentes', amount: 2500.00, dueDate: '2024-07-10', paymentDate: '2024-07-11', status: 'Pago', type: 'receita', company: 'Minha Empresa (Matriz)', costCenter: 'Operações', bankAccount: 'acc1', recurrence: { interval: 'monthly' } },
  { id: 'r3', description: 'Consultoria Cliente C', category: 'Serviços Prestados', amount: 8000.00, dueDate: '2024-07-18', status: 'Pendente', type: 'receita', company: 'Filial São Paulo', costCenter: 'Vendas & Marketing', bankAccount: 'acc2', interestRate: 1, interestType: 'daily' },
  { id: 'r4', description: 'Venda de Produto D', category: 'Vendas de Produtos', amount: 4500.00, dueDate: '2024-07-25', status: 'Pendente', type: 'receita', company: 'Minha Empresa (Matriz)', costCenter: 'Vendas & Marketing', bankAccount: 'acc3', interestRate: 1.5, interestType: 'monthly' },
  { id: 'r5', description: 'Projeto Cliente E', category: 'Serviços Prestados', amount: 12000.00, dueDate: '2024-06-28', status: 'Vencido', type: 'receita', company: 'Filial Rio de Janeiro', costCenter: 'Operações', bankAccount: 'acc4', interestRate: 2, interestType: 'monthly' },
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
        id: 'd1', name: 'Tech Solutions Ltda', avatar: 'https://i.pravatar.cc/150?u=d1', totalDebt: 12000.00, lastDueDate: '2024-06-15', status: 'Notificação', communicationHistory: [
            { id: 'c1', date: '2024-06-20', type: 'email', summary: 'Primeiro e-mail de cobrança enviado.' }
        ],
        company: 'Minha Empresa (Matriz)',
    },
    {
        id: 'd2', name: 'Inova Corp', avatar: 'https://i.pravatar.cc/150?u=d2', totalDebt: 7500.00, lastDueDate: '2024-05-30', status: 'Negociação', communicationHistory: [
            { id: 'c2-1', date: '2024-06-05', type: 'email', summary: 'E-mail de cobrança enviado.' },
            { id: 'c2-2', date: '2024-06-12', type: 'call', summary: 'Contato telefônico realizado. Cliente pediu para renegociar.' },
            { id: 'c2-3', date: '2024-06-18', type: 'whatsapp', summary: 'Proposta de parcelamento enviada via WhatsApp.' }
        ],
        company: 'Filial São Paulo',
    },
    {
        id: 'd3', name: 'Mercado Central', avatar: 'https://i.pravatar.cc/150?u=d3', totalDebt: 4300.00, lastDueDate: '2024-06-10', status: 'Notificação', communicationHistory: [
            { id: 'c3-1', date: '2024-06-15', type: 'sms', summary: 'Lembrete de vencimento via SMS.' },
             { id: 'c3-2', date: '2024-06-18', type: 'email', summary: 'E-mail de cobrança enviado.' }
        ],
        company: 'Filial São Paulo',
    },
    {
        id: 'd4', name: 'Construtora Forte', avatar: 'https://i.pravatar.cc/150?u=d4', totalDebt: 35000.00, lastDueDate: '2024-04-20', status: 'Ação Jurídica', communicationHistory: [
             { id: 'c4-1', date: '2024-05-01', type: 'call', summary: 'Tentativa de contato, sem sucesso.' },
             { id: 'c4-2', date: '2024-05-15', type: 'email', summary: 'Notificação extrajudicial enviada por e-mail.' },
             { id: 'c4-3', date: '2024-06-01', type: 'call', summary: 'Contato com o financeiro, sem proposta de pagamento.' }
        ],
        company: 'Filial Rio de Janeiro',
    },
    {
        id: 'd5', name: 'Design Studio Criativo', avatar: 'https://i.pravatar.cc/150?u=d5', totalDebt: 1500.00, lastDueDate: '2024-06-01', status: 'Acordo', communicationHistory: [
             { id: 'c5-1', date: '2024-06-06', type: 'email', summary: 'E-mail de cobrança.' },
             { id: 'c5-2', date: '2024-06-10', type: 'call', summary: 'Acordo de pagamento em 2x firmado.' }
        ],
        company: 'Minha Empresa (Matriz)',
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

export const MOCK_USERS: User[] = [
    { id: 'user1', name: 'Ana Clara (Você)', email: 'ddarruspe@gmail.com', password: '1906', role: 'Admin', avatar: 'https://picsum.photos/100', accessibleCompanies: ['Minha Empresa (Matriz)', 'Filial São Paulo', 'Filial Rio de Janeiro'] },
    { id: 'user2', name: 'Bruno Gomes', email: 'bruno.gomes@email.com', password: 'password123', role: 'Manager', avatar: 'https://i.pravatar.cc/150?u=user2', accessibleCompanies: ['Filial São Paulo'] },
    { id: 'user3', name: 'Carlos Dias', email: 'carlos.dias@email.com', password: 'password123', role: 'Analyst', avatar: 'https://i.pravatar.cc/150?u=user3', accessibleCompanies: ['Minha Empresa (Matriz)'] },
    { id: 'user4', name: 'Daniela Faria', email: 'daniela.faria@email.com', password: 'password123', role: 'Manager', avatar: 'https://i.pravatar.cc/150?u=user4', accessibleCompanies: ['Filial Rio de Janeiro'] },
    { id: 'user5', name: 'Sérgio Contábil', email: 'sergio.contabil@email.com', password: 'password123', role: 'Contador', avatar: 'https://i.pravatar.cc/150?u=user5', accessibleCompanies: ['Minha Empresa (Matriz)', 'Filial São Paulo'] },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
    { id: 'log1', userId: 'user2', userName: 'Bruno Gomes', userAvatar: 'https://i.pravatar.cc/150?u=user2', action: 'aprovou a despesa "Compra de Monitores".', timestamp: '2024-07-28 10:45:12' },
    { id: 'log2', userId: 'user1', userName: 'Ana Clara', userAvatar: 'https://picsum.photos/100', action: 'editou o usuário "Carlos Dias".', timestamp: '2024-07-28 09:30:05' },
    { id: 'log3', userId: 'user5', userName: 'Sérgio Contábil', userAvatar: 'https://i.pravatar.cc/150?u=user5', action: 'solicitou o documento "Extrato bancário de Junho/2024".', timestamp: '2024-07-28 08:15:00' },
    { id: 'log4', userId: 'user1', userName: 'Ana Clara', userAvatar: 'https://picsum.photos/100', action: 'exportou o relatório DRE em PDF.', timestamp: '2024-07-27 11:05:19' },
    { id: 'log5', userId: 'user3', userName: 'Carlos Dias', userAvatar: 'https://i.pravatar.cc/150?u=user3', action: 'visualizou o Dashboard.', timestamp: '2024-07-27 10:01:56' },
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
        assignedToId: 'user1' // Ana Clara (Admin)
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
        assignedToId: 'user2' // Bruno Gomes (Manager)
    }
];