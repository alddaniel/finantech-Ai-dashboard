import React from 'react';
import { downloadPdfFromElement } from '../services/pdfService';

const DocSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="mb-10 print:break-before-page">
        <h2 className="text-2xl font-bold border-b-2 border-blue-500 pb-2 mb-4 text-gray-800 dark:text-gray-100 dark:print:text-black">{title}</h2>
        <div className="prose prose-lg dark:prose-invert max-w-none prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-h3:text-gray-800 dark:prose-h3:text-gray-200 prose-strong:dark:print:text-black">
            {children}
        </div>
    </section>
);

export const Help: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 print-hide">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Central de Ajuda</h1>
                <button
                    onClick={() => downloadPdfFromElement('help-printable-area', 'manual_usuario_finantech_ai.pdf')}
                    className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <PdfIcon />
                    Salvar como PDF
                </button>
            </div>
            
            <div id="help-printable-area" className="printable-area bg-white dark:bg-slate-900 p-8 rounded-lg shadow-sm dark:shadow-none print:shadow-none print:border-none print:p-0">
                <h1 className="hidden print:block text-3xl font-bold mb-8 text-center">Manual do Usuário: FinanTech AI Dashboard</h1>
                
                <DocSection title="1. Primeiros Passos: Acesso e Registro">
                  <h3>1.1. Tela de Login</h3>
                  <p>A tela de login é a porta de entrada para o sistema. Insira seu e-mail e senha cadastrados para acessar o dashboard. Caso ainda não tenha uma conta, clique em <strong>"Registre-se aqui"</strong>.</p>
                  
                  <h3>1.2. Tela de Registro</h3>
                  <p>Ao se registrar, você cria não apenas seu usuário, mas também a primeira empresa da sua organização. O usuário criador se torna o <strong>Administrador</strong> principal.</p>
                  <ul>
                    <li><strong>Nome Completo:</strong> Seu nome de usuário.</li>
                    <li><strong>Nome da Empresa:</strong> O nome da sua empresa principal (Matriz).</li>
                    <li><strong>E-mail e Senha:</strong> Suas credenciais de acesso.</li>
                  </ul>
                  <p>Após o registro, você será redirecionado automaticamente para o Dashboard.</p>
                </DocSection>

                <DocSection title="2. Navegação e Dashboard">
                    <h3>2.1. Menu Lateral (Sidebar)</h3>
                    <p>O menu lateral é o seu centro de comando. A partir dele, você pode acessar todos os módulos do sistema. Na parte inferior, você pode:</p>
                    <ul>
                        <li><strong>Mudar a Empresa Ativa:</strong> Se você gerencia múltiplas filiais, pode alternar entre elas aqui. Os dados exibidos no sistema corresponderão à empresa selecionada.</li>
                        <li><strong>Sair do Sistema (Logout):</strong> Encerra sua sessão de forma segura.</li>
                    </ul>
                    
                    <h3>2.2. Dashboard</h3>
                    <p>Esta é a sua visão geral da saúde financeira. O Dashboard apresenta, para a empresa selecionada:</p>
                    <ul>
                        <li><strong>Resumos Financeiros:</strong> Cartões com os totais de Receitas Pagas, Despesas Pagas e o Resultado do mês.</li>
                        <li><strong>Saldos Bancários:</strong> Uma visão rápida dos saldos em suas contas conectadas.</li>
                        <li><strong>Fluxo de Caixa:</strong> Um gráfico interativo que mostra a evolução de receitas, despesas e saldo nos últimos 6 meses.</li>
                        <li><strong>Transações Recentes:</strong> Listas das últimas contas a pagar e a receber, com acesso rápido para visualizar todos os lançamentos.</li>
                    </ul>
                </DocSection>

                <DocSection title="3. Gestão Financeira Essencial">
                    <h3>3.1. Contas a Pagar</h3>
                    <p>Gerencie todas as suas despesas. A tela exibe uma tabela completa com juros calculados automaticamente para contas vencidas.</p>
                    <ul>
                      <li><strong>Adicionar Despesa:</strong> Clique no botão para abrir um formulário detalhado, onde você pode registrar informações como fornecedor, valor, vencimento, centro de custo, e se a despesa é recorrente ou possui juros.</li>
                      <li><strong>Marcar como Pago:</strong> Com um clique, a conta é liquidada, considerando o valor total com juros, se aplicável.</li>
                      <li><strong>Editar:</strong> Modifique qualquer detalhe de um lançamento. Para contas vencidas, a tela de edição mostra o cálculo detalhado de juros.</li>
                    </ul>
                    
                    <h3>3.2. Contas a Receber</h3>
                    <p>Controle todos os seus recebimentos. Similar ao Contas a Pagar, calcula juros para títulos vencidos.</p>
                    
                    <h3>3.3. Gerar Cobrança (Faturamento)</h3>
                    <p>Crie faturas detalhadas para seus clientes. Este módulo unifica a geração de cobrança, a emissão de boletos e a simulação de nota fiscal.</p>
                    <ul>
                      <li><strong>Itens da Cobrança:</strong> Adicione múltiplos produtos ou serviços com quantidade e valor unitário. O total é calculado automaticamente.</li>
                      <li><strong>Juros:</strong> Configure opcionalmente a cobrança de juros por atraso.</li>
                      <li><strong>Boleto e NF:</strong> Simule a emissão de boletos e notas fiscais (NFS-e, NF-e, etc.), configurando o provedor de emissão.</li>
                      <li>Após gerar, você pode enviar por E-mail, WhatsApp ou baixar um PDF.</li>
                    </ul>
                    
                     <h3>3.4. Cobranças Geradas</h3>
                     <p>Liste, visualize, edite e exclua todas as faturas e cobranças geradas através do módulo de faturamento.</p>
                </DocSection>

                <DocSection title="4. Módulos Avançados">
                    <h3>4.1. Conciliação Bancária</h3>
                    <p>Compare seus lançamentos internos com o extrato bancário. A conciliação pode ser feita de duas formas:</p>
                    <ul>
                        <li><strong>Manual:</strong> Selecione uma transação do extrato e uma do sistema e clique para conciliar.</li>
                        <li><strong>Automática com IA:</strong> Clique em <strong>"Conciliar Automaticamente com IA"</strong>. O Gemini analisará ambas as listas por data, valor e descrição para encontrar os pares correspondentes e conciliá-los em massa.</li>
                    </ul>
                    
                    <h3>4.2. CRM Financeiro</h3>
                    <p>Um funil de inadimplência no estilo Kanban. Arraste e solte os clientes devedores entre as etapas (Notificação, Negociação, etc.) para organizar seu processo de cobrança. Clique em um cliente para ver detalhes e gerar uma estratégia de cobrança com IA.</p>
                    
                    <h3>4.3. Relatórios</h3>
                    <p>Obtenha uma visão completa do desempenho da sua empresa. O DRE (Demonstrativo de Resultado do Exercício) é gerado automaticamente. Você pode visualizar gráficos de Lucro e Inadimplência e exportar os dados para CSV (compatível com Excel).</p>
                    
                    <h3>4.4. Módulo Fiscal</h3>
                    <p>Simule impostos e tome decisões tributárias mais inteligentes.</p>
                     <ul>
                        <li><strong>Calculadora:</strong> Simule o valor de impostos para diferentes faturamentos e regimes.</li>
                        <li><strong>Comparativo com IA:</strong> Forneça o faturamento e a atividade da sua empresa, e o Gemini criará uma análise comparativa detalhada entre Simples Nacional, Lucro Presumido e Lucro Real, com prós, contras e uma recomendação.</li>
                    </ul>

                    <h3>4.5. Consultor Financeiro IA</h3>
                    <p>Acesse análises aprofundadas sobre seus dados financeiros.</p>
                    <ul>
                        <li><strong>Análise Preditiva:</strong> Previsão do fluxo de caixa para os próximos meses, com identificação de tendências e riscos.</li>
                        <li><strong>Corte de Custos:</strong> Com base em suas despesas, a IA sugere áreas para otimização e economia.</li>
                    </ul>
                </DocSection>
                
                <DocSection title="5. Administração">
                    <h3>5.1. Contatos</h3>
                    <p>Um local central para gerenciar todos os seus clientes e fornecedores. Adicione, edite e remova contatos, mantendo sua base de dados organizada.</p>
                    
                    <h3>5.2. Gestão de Acessos</h3>
                    <p>Administre quem pode ver e fazer o quê no sistema.</p>
                    <ul>
                        <li><strong>Empresas:</strong> Adicione ou edite filiais e unidades de negócio.</li>
                        <li><strong>Usuários:</strong> Crie novos usuários, edite existentes e defina a quais empresas eles terão acesso.</li>
                        <li><strong>Perfis e Permissões:</strong> Consulte as permissões de cada perfil (Admin, Manager, Analyst).</li>
                        <li><strong>Auditoria:</strong> Rastreie as ações mais importantes realizadas no sistema.</li>
                    </ul>
                    
                    <h3>5.3. Integrações</h3>
                    <p>Conecte o FinanTech a fontes de dados externas. Conecte contas bancárias via Open Finance ou importe extratos em arquivos (CNAB, OFX) manualmente.</p>
                </DocSection>
            </div>
        </div>
    );
};

const PdfIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;