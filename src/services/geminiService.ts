
import { GoogleGenAI, Type } from "@google/genai";
import type { Transaction, CashFlowData, DebtorCustomer, BankTransaction, SystemTransaction, Company } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const generateFinancialSummary = (
    cashFlow: CashFlowData[], 
    receivables: Transaction[], 
    payables: Transaction[]
): string => {
    const totalReceitas = cashFlow.reduce((acc, item) => acc + item.receitas, 0);
    const totalDespesas = cashFlow.reduce((acc, item) => acc + item.despesas, 0);
    const saldoFinal = cashFlow[cashFlow.length - 1].saldo;

    const pendingReceivables = receivables.filter(t => t.status === 'Pendente').reduce((acc, t) => acc + t.amount, 0);
    const pendingPayables = payables.filter(t => t.status === 'Pendente').reduce((acc, t) => acc + t.amount, 0);

    return `
      ## Resumo Financeiro da Empresa (últimos 6 meses)
      - Receita Total: R$ ${totalReceitas.toFixed(2)}
      - Despesa Total: R$ ${totalDespesas.toFixed(2)}
      - Saldo Atual: R$ ${saldoFinal.toFixed(2)}
      - Contas a Receber (Pendente): R$ ${pendingReceivables.toFixed(2)}
      - Contas a Pagar (Pendente): R$ ${pendingPayables.toFixed(2)}

      ## Fluxo de Caixa Mensal
      ${cashFlow.map(item => `- ${item.month}: Receita R$ ${item.receitas}, Despesa R$ ${item.despesas}, Saldo R$ ${item.saldo}`).join('\n')}
    `;
};


export const getFinancialAnalysis = async (
    cashFlow: CashFlowData[], 
    receivables: Transaction[], 
    payables: Transaction[]
): Promise<string> => {
    try {
        if (!process.env.API_KEY) {
            return "Chave de API não configurada. Por favor, configure a variável de ambiente API_KEY.";
        }
        
        const summary = generateFinancialSummary(cashFlow, receivables, payables);
        const prompt = `
            Você é um consultor financeiro especialista em análise de dados para pequenas e médias empresas.
            Com base no resumo financeiro a seguir, forneça uma análise preditiva do fluxo de caixa para os próximos 3 meses.
            Identifique tendências, pontos de atenção (riscos) e oportunidades de melhoria.
            Seja claro, objetivo e forneça recomendações práticas em formato de bullet points.

            ${summary}
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.5,
            }
        });
        
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Ocorreu um erro ao tentar analisar os dados. Por favor, tente novamente mais tarde.";
    }
};

export const getCostCuttingSuggestions = async (payables: Transaction[]): Promise<string> => {
    try {
        if (!process.env.API_KEY) {
            return "Chave de API não configurada.";
        }
        const expensesSummary = payables.map(p => `- ${p.category}: ${p.description} - R$ ${p.amount.toFixed(2)}`).join('\n');
        const prompt = `
            Você é um especialista em otimização de custos. Com base na lista de despesas a seguir, sugira áreas onde a empresa pode cortar custos sem impactar negativamente a operação.
            Categorize suas sugestões (Ex: Negociar com fornecedores, Substituir ferramentas, etc.) e, se possível, estime o potencial de economia.

            Lista de Despesas:
            ${expensesSummary}
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.7,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Ocorreu um erro ao buscar sugestões de corte de custos.";
    }
};

export const getTaxRegimeComparison = async (
    monthlyRevenue: number,
    businessActivity: string
): Promise<string> => {
    if (!process.env.API_KEY) {
        return "Chave de API não configurada.";
    }

    const prompt = `
        Você é um contador e consultor tributário brasileiro altamente qualificado, especialista em PMEs.
        Com base nos dados a seguir, gere uma análise comparativa detalhada entre os regimes tributários: Simples Nacional, Lucro Presumido e Lucro Real.

        Dados da Empresa:
        - Faturamento Mensal Estimado: R$ ${monthlyRevenue.toFixed(2)}
        - Atividade Principal: ${businessActivity || 'Serviços em geral'}

        Sua análise deve ser estruturada e clara, usando markdown. Para cada regime, inclua:
        1.  **Estimativa de Impostos:** Calcule uma estimativa dos impostos mensais. Para o Simples Nacional, considere o Anexo III (serviços). Para o Lucro Presumido, use a presunção de 32% para serviços. Para o Lucro Real, apresente cenários para margens de lucro de 10%, 20% e 30%.
        2.  **Prós:** Liste os principais pontos positivos.
        3.  **Contras:** Liste os principais pontos negativos.
        4.  **Alíquota Efetiva:** Calcule a porcentagem que os impostos representam sobre o faturamento.

        Ao final, forneça uma **Recomendação Final** bem fundamentada, indicando qual regime parece ser o mais vantajoso para esta empresa e por quê.

        Formate a resposta de forma clara usando títulos (##), listas de marcadores (*) e negrito (**) para ênfase.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.4,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for tax comparison:", error);
        return "Ocorreu um erro ao buscar a análise tributária com a IA.";
    }
};

export const getSmartCollectionStrategy = async (debtor: DebtorCustomer): Promise<string> => {
    try {
        if (!process.env.API_KEY) {
            return "Chave de API não configurada.";
        }

        const history = debtor.communicationHistory.map(h => `- ${h.date}: ${h.type.toUpperCase()} - ${h.summary}`).join('\n');

        const prompt = `
            Você é um especialista em cobranças e recuperação de crédito. Sua tarefa é criar uma "Régua de Cobrança Inteligente" para um cliente devedor.

            Perfil do Devedor:
            - Nome: ${debtor.name}
            - Dívida Total: R$ ${debtor.totalDebt.toFixed(2)}
            - Data do Último Vencimento: ${debtor.lastDueDate}
            - Status Atual no Funil de Cobrança: ${debtor.status}
            - Histórico de Comunicação:
            ${history || 'Nenhuma comunicação registrada.'}

            Com base nesses dados, crie um plano de ação passo a passo para os próximos 30 dias.
            As ações devem ser práticas e claras. Use um tom profissional, mas que busque a resolução.
            Sugira diferentes canais (email, SMS, WhatsApp, ligação) e o conteúdo/roteiro para cada um.
            Se apropriado, sugira oferecer um parcelamento.

            Formate sua resposta usando markdown com títulos para cada etapa (Ex: "Semana 1: Contato Inicial", "Semana 2: Escalonamento") e bullet points para as ações.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.7,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Ocorreu um erro ao gerar a estratégia de cobrança.";
    }
};

export const reconcileTransactionsWithAI = async (
    bankTxs: BankTransaction[],
    systemTxs: SystemTransaction[]
): Promise<{ bankTxId: string; systemTxId: string; reason: string }[]> => {
    if (!process.env.API_KEY) {
        throw new Error("Chave de API não configurada.");
    }

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                bankTxId: { type: Type.STRING },
                systemTxId: { type: Type.STRING },
                reason: { type: Type.STRING },
            },
            required: ["bankTxId", "systemTxId", "reason"],
        },
    };

    const prompt = `
        Você é um assistente de contabilidade especialista em conciliação bancária.
        Sua tarefa é encontrar correspondências entre uma lista de transações de um extrato bancário e uma lista de lançamentos de um sistema financeiro.

        Critérios para correspondência:
        1. O valor deve ser idêntico.
        2. A data deve ser muito próxima (geralmente no mesmo dia ou com poucos dias de diferença).
        3. A descrição deve ser semelhante (ex: "PAGTO ALUGUEL" no extrato e "Aluguel do Escritório" no sistema).

        Analise as duas listas a seguir e retorne um array de objetos JSON com os pares que você tem alta confiança que correspondem.
        
        Lista de Transações do Extrato Bancário:
        ${JSON.stringify(bankTxs, null, 2)}

        Lista de Lançamentos do Sistema (não conciliados):
        ${JSON.stringify(systemTxs, null, 2)}

        Retorne apenas os pares correspondentes no formato JSON especificado. Não inclua lançamentos que não tenham um par claro.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.1,
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result;
    } catch (error) {
        console.error("Error in AI reconciliation:", error);
        throw new Error("A IA não conseguiu processar a conciliação.");
    }
};

export const getSchemaModification = async (
    currentSchema: string,
    userPrompt: string,
    dialect: 'postgres' | 'mysql'
): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("Chave de API não configurada.");
    }

    const prompt = `
        Você é um arquiteto de banco de dados especialista em SQL. Sua tarefa é modificar um schema SQL existente com base na solicitação de um usuário.
        O dialeto do banco de dados é '${dialect}'.
        Você DEVE retornar APENAS o script SQL completo e atualizado. Não inclua NENHUMA explicação, comentário, ou formatação markdown como \`\`\`sql. Apenas o código SQL bruto.

        SCHEMA ATUAL:
        ---
        ${currentSchema}
        ---

        SOLICITAÇÃO DO USUÁRIO:
        ---
        ${userPrompt}
        ---

        Agora, forneça o script SQL completo e modificado.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.1,
            }
        });
        
        const cleanResponse = response.text.replace(/```sql/g, '').replace(/```/g, '').trim();
        
        return cleanResponse;

    } catch (error) {
        console.error("Error calling Gemini API for schema modification:", error);
        throw new Error("A IA não conseguiu processar a modificação do schema.");
    }
};

export const getDashboardInsight = async (
    payables: Transaction[],
    receivables: Transaction[]
): Promise<string> => {
    if (!process.env.API_KEY) {
        return "💡 A funcionalidade de insights está desativada. Configure sua chave de API.";
    }

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const overduePayables = payables.filter(p => p.status === 'Vencido');
    const dueSoonPayables = payables.filter(p => {
        if (p.status !== 'Pendente') return false;
        const dueDate = new Date(p.dueDate + 'T00:00:00');
        return dueDate > today && dueDate <= nextWeek;
    });

    const overdueReceivables = receivables.filter(r => r.status === 'Vencido');

    const summary = `
        - Contas a pagar vencidas: ${overduePayables.length} (Total: R$ ${overduePayables.reduce((s, t) => s + t.amount, 0).toFixed(2)})
        - Contas a pagar vencendo nos próximos 7 dias: ${dueSoonPayables.length} (Total: R$ ${dueSoonPayables.reduce((s, t) => s + t.amount, 0).toFixed(2)})
        - Contas a receber vencidas: ${overdueReceivables.length} (Total: R$ ${overdueReceivables.reduce((s, t) => s + t.amount, 0).toFixed(2)})
    `;

    const prompt = `
        Você é um assistente financeiro proativo para uma pequena empresa.
        Com base no resumo de dados a seguir, forneça UM insight acionável, útil e muito conciso (máximo 2 frases).
        Comece a resposta com um emoji relevante (ex: 💡, ⚠️, ✅, 📈).
        O tom deve ser direto e prestativo. Foque no que é mais urgente ou importante.

        Dados:
        ${summary}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.8,
                maxOutputTokens: 100,
                thinkingConfig: { thinkingBudget: 50 },
            }
        });
        return response.text ? response.text.trim() : "💡 Não foi possível gerar um insight no momento.";
    } catch (error) {
        console.error("Error calling Gemini API for dashboard insight:", error);
        return "💡 Não foi possível gerar um insight no momento.";
    }
};