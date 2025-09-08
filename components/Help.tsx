import React from 'react';
import { downloadPdfFromElement } from '../services/pdfService';

const DocSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="mb-10 print:break-before-page">
        <h2 className="text-2xl font-bold border-b-2 border-indigo-500 pb-2 mb-4 text-gray-800 dark:text-gray-100 dark:print:text-black">{title}</h2>
        <div className="prose prose-lg dark:prose-invert max-w-none prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-h3:text-gray-800 dark:prose-h3:text-gray-200 prose-strong:text-indigo-600 prose-strong:dark:text-indigo-400 prose-strong:dark:print:text-black">
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
                    className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                    <PdfIcon />
                    Salvar como PDF
                </button>
            </div>
            
            <div id="help-printable-area" className="printable-area bg-white dark:bg-slate-900 p-8 rounded-lg shadow-sm dark:shadow-none print:shadow-none print:border-none print:p-0">
                <h1 className="hidden print:block text-3xl font-bold mb-8 text-center">Manual do Usuário: FinanTech AI Dashboard</h1>
                
                <DocSection title="1. Primeiros Passos e Acesso ao Sistema">
                    <h3>1.1. Acesso ao Sistema</h3>
                    <p>Na tela de login, selecione a <strong>Empresa</strong> que deseja acessar, informe seu <strong>E-mail</strong> e <strong>Senha</strong>. O sistema é multi-empresa, então você terá acesso apenas às empresas que seu administrador permitiu.</p>

                    <h3>1.2. Registro de Nova Conta</h3>
                    <p>Caso sua organização ainda não use o FinanTech AI, o primeiro usuário pode se registrar. O processo de registro cria seu usuário como <strong>Administrador</strong> e cadastra a primeira <strong>Empresa</strong>. Outras empresas (filiais) podem ser adicionadas posteriormente por você no painel de administração.</p>
                </DocSection>

                <DocSection title="2. Navegação Principal e Dashboard">
                    <h3>2.1. O Menu Lateral Inteligente</h3>
                    <p>O menu lateral foi redesenhado para ser mais intuitivo. Agora, as operações financeiras principais estão agrupadas em submenus para facilitar o acesso:</p>
                    <ul>
                        <li><strong>Pagamentos:</strong> Agrupa todas as ações relacionadas a despesas, como lançar uma nova conta a pagar, agendar pagamentos e gerenciar recorrências.</li>
                        <li><strong>Recebimentos:</strong> Centraliza as ações de receitas, como baixar recebimentos, agendar cobranças, emitir novas faturas e gerenciar o funil de inadimplência (CRM).</li>
                    </ul>
                    <p>Na parte inferior do menu, você pode alternar rapidamente entre as empresas que você tem acesso e sair do sistema com segurança.</p>
                    
                    <h3>2.2. Dashboard: Sua Visão 360°</h3>
                    <p>O Dashboard é a tela inicial e oferece um resumo vital da saúde financeira da empresa selecionada. Ele foi aprimorado com novos widgets:</p>
                    <ul>
                        <li><strong>Avisos para Hoje:</strong> Exibe um alerta para quaisquer pagamentos ou recebimentos que foram agendados para o dia atual, permitindo uma ação rápida.</li>
                        <li><strong>Pendências Contábeis:</strong> Se o Módulo Contador estiver ativo, este widget mostra as solicitações pendentes do seu contador, garantindo que nada seja esquecido.</li>
                        <li><strong>Resumos e Gráficos:</strong> Os cartões de resumo, saldos bancários e o gráfico de fluxo de caixa continuam fornecendo uma visão rápida e clara do desempenho financeiro.</li>
                    </ul>
                </DocSection>
                
                <DocSection title="3. Módulo de Pagamentos (Contas a Pagar)">
                    <h3>3.1. Lançando e Gerenciando Despesas</h3>
                    <p>Acesse o submenu <strong>Pagamentos ➔ Pagar</strong>. Nesta tela, você visualiza todas as suas contas a pagar. Para adicionar uma nova despesa, clique no botão "Adicionar Despesa".</p>
                    <ul>
                        <li><strong>Importação de XML:</strong> A forma mais rápida de lançar uma despesa é importando o arquivo XML da Nota Fiscal de compra. O sistema lê o arquivo, preenche os dados do fornecedor, itens e valor automaticamente, e até cadastra o fornecedor se ele for novo.</li>
                        <li><strong>Anexos:</strong> Você pode anexar comprovantes, boletos em PDF ou outros documentos relevantes a cada lançamento.</li>
                        <li><strong>Baixa e Agendamento:</strong> Uma conta pode ser marcada como 'Paga' diretamente (baixa) ou ter seu pagamento agendado para uma data futura.</li>
                    </ul>

                    <h3>3.2. Agenda de Pagamentos</h3>
                    <p>Acesse em <strong>Pagamentos ➔ Agendar</strong>. Esta tela funciona como seu calendário financeiro de saídas, mostrando todas as contas pendentes e agendadas, ordenadas por data. A partir daqui, você pode agendar ou reagendar pagamentos.</p>
                </DocSection>

                <DocSection title="4. Módulo de Recebimentos (Contas a Receber)">
                    <h3>4.1. Lançando e Gerenciando Receitas</h3>
                    <p>Acesse em <strong>Recebimentos ➔ Lançar/Baixar Receita</strong>. Aqui você gerencia todas as suas contas a receber. A principal forma de adicionar uma receita é através da geração de uma fatura.</p>

                    <h3>4.2. Gerador de Faturas e Cobranças</h3>
                    <p>Acesse em <strong>Recebimentos ➔ Nova Cobrança/Fatura</strong>. Este é um dos módulos mais poderosos:</p>
                    <ul>
                        <li><strong>Cobrança de Serviços/Produtos:</strong> Crie uma fatura detalhada, com múltiplos itens, e o sistema simula a emissão da NF-e, gerando um XML e permitindo a visualização da DANFE.</li>
                        <li><strong>Cobrança de Aluguel:</strong> Vincule a cobrança a um imóvel cadastrado. O sistema oferece opções específicas como "Aluguel Mensal", "Caução", etc., e permite definir o mês de referência para clareza no recibo. Cobranças de aluguel não geram NF-e, apenas um recibo detalhado.</li>
                        <li><strong>Opções Avançadas:</strong> Configure parcelamentos, juros e multas por atraso.</li>
                        <li><strong>Pós-geração:</strong> Após criar a cobrança, você pode visualizar o boleto, salvar um PDF da fatura/recibo ou compartilhar via WhatsApp.</li>
                    </ul>
                    
                    <h3>4.3. Central de Cobrança (CRM)</h3>
                    <p>Acesse em <strong>Recebimentos ➔ Central de Cobrança</strong>. Use o funil visual para gerenciar clientes inadimplentes, movendo-os entre as etapas de cobrança. A IA pode gerar uma "Régua de Cobrança Inteligente" com um plano de ação personalizado para cada devedor.</p>
                </DocSection>
                
                <DocSection title="5. Módulos de Gestão e Cadastros">
                    <h3>5.1. Gestão de Imóveis</h3>
                    <p>Se o módulo estiver ativo para sua empresa, você pode gerenciar um portfólio de imóveis. Cadastre propriedades, vincule proprietários e inquilinos (dos seus Contatos), e defina detalhes de aluguel e venda. As despesas (ex: IPTU) e receitas (aluguel) podem ser vinculadas diretamente a um imóvel, permitindo calcular o resultado mensal de cada um.</p>

                    <h3>5.2. Contas Bancárias e Contatos</h3>
                    <p>Mantenha seus cadastros centralizados. Em <strong>Contas Bancárias</strong>, gerencie as contas da sua empresa. Em <strong>Contatos</strong>, cadastre seus clientes, fornecedores e proprietários de imóveis.</p>
                </DocSection>

                <DocSection title="6. Análise e Inteligência Artificial">
                    <h3>6.1. Relatórios e Indicadores</h3>
                    <p>Analise o desempenho da sua empresa com relatórios detalhados de pagamentos. Filtre por período, categoria, fornecedor e mais. Exporte os dados para PDF ou CSV (compatível com Excel/Google Sheets).</p>

                    <h3>6.2. Consultor Financeiro IA e Módulo Fiscal</h3>
                    <p>Utilize o poder da IA do Gemini para obter análises preditivas sobre seu fluxo de caixa, sugestões de corte de custos e comparações detalhadas entre regimes tributários para otimizar sua carga de impostos.</p>
                </DocSection>

                <DocSection title="7. Administração e Configurações">
                    <h3>7.1. Administração da Empresa (Perfil 'Admin')</h3>
                    <p>Se você possui o perfil de <strong>Administrador</strong>, pode acessar o menu "Administração do Sistema" para gerenciar os dados da sua empresa, cadastrar novos usuários e definir a quais empresas eles têm acesso. Você também pode visualizar os logs de auditoria para maior segurança.</p>

                    <h3>7.2. Painel do Contador</h3>
                    <p>Se o módulo estiver ativo, contadores têm um painel exclusivo onde podem visualizar os dados das empresas que lhes deram acesso e abrir solicitações formais de documentos, esclarecimentos ou lançamentos, criando um canal de comunicação direto e rastreável com seus clientes.</p>
                </DocSection>
            </div>
        </div>
    );
};

const PdfIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;